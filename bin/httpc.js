#!/usr/bin/env node
'use strict'

// Modules
const net = require('net');
const chalk = require('chalk');
const display = require('../lib/display-messages');    //displays messages
const commander = require('commander');
const log = console.log;  
const fs = require('fs');
const path = require('path');

// Global Variables
var redirectLocation = "";
var redirectFlag = false;
var clientContentBodyFlag = false;
var numRedirects = 0;
var verbose = false;

// Polyfills
String.prototype.replaceAll = function(target, replacement){
  return this.split(target).join(replacement);
}

/*
** Functions Functions Functions
*/
// from socket connection
function parseServerResponse(data){
  // separates data into individual lines
  let responseSplit = data.split('\r\n\r\n');
  let responseHeaders = responseSplit[0];
  let responseBody = responseSplit[1];
  
  if(verbose){
  responseHeaders = responseHeaders.split("\r\n");
  
  // parses out HTTP response code
  let httpResponse = responseHeaders[0].split(" ");
  
  log(chalk.yellow("\n[Parsing Received Data]"));
  log(chalk.grey("Response Status"))
  log(
    chalk.blue("Protocol: ")+httpResponse[0]+
    chalk.blue("\nStatus Code: ")+httpResponse[1]+
    chalk.blue("\nStatus: ")+httpResponse[2]
  );
  
  // Parses response headers
  let attributes = {};    
  
  for(let i = 1; i < responseHeaders.length; i++){
    let temp = responseHeaders[i].split(/:(.+)/);
    attributes[temp[0]] = temp[1];      
  }
  
  log(chalk.grey("\nResponse Header Attributes"));
  var lineCount = 1;
  for(let key in attributes){
    if(key != null && attributes[key] != null){
      log(chalk.blue(chalk.grey(lineCount)+" "+key+": ")+attributes[key]);
      lineCount++;
    }
  }
  
  // determines size of response body - does it match with header information??
  // also body is cut off if this isn't done....
  let bodyLength = 0;
  try{
    bodyLength = new Buffer(responseBody).length;
  }catch(err){
    log(chalk.red(err));
    return 0;
  }
  
  log(chalk.grey("\nResponse Body\n")+chalk.blue("Body-Length: ")+bodyLength);
  log(chalk.cyan(responseBody)); 
  }else{
    log(chalk.grey("Server Response\n"+chalk.cyan("Body")+":\n")+responseBody)
  }
}

// checks for 3xx status codes
function checkRedirect(data,host){
  let dataSplit = data.split('\r\n');
  
  // First line of response had status code
  let requestStatus = dataSplit[0].split(" ");
  
  if(requestStatus[1][0] == "3") {
    log(chalk.yellow('\n[Redirect Status '+ chalk.green(requestStatus[1]) +' Detected]'));
    
    // Determine redirect location
    for(let i = 0; i <dataSplit.length; i++){
      if(dataSplit[i].search("Location") > -1){
        let location = dataSplit[i].split(/: (.+)/);
        log(chalk.blue("Redirect Location: ")+location[1]);
        
        // If redirect location is relative
        if(location[1][0] == "/" ){
          redirectLocation = host+location[1];
        }else{
          redirectLocation = location[1];
        }
        
        // Detected redirect
        return true;
      }
    }
  }
  // No redirect
  return false;
}

// Parses URL into JSON  
function parseURL(URL){
  let urlDescription = {};
  
  /*
  ** TODO:: A bug where HTTPS doesn't get a responsee
  */
  // determines port number and removes protocol
  if(URL.search("https://") > -1){
    urlDescription["port"] = 80;    // HTTPS PORT = 443
    URL = URL.substr(8);
  }else{
    urlDescription["port"] = 80;
    if(URL.search("http://") > -1){
      URL = URL.substr(7);
    }
  }
  
  //removes www.
  if(URL.search("www.") > -1){
    URL = URL.substr(4);
  }
  
  // parses host and request
  let host = URL.split(/\/(.+)/);
  if(host[1] === undefined){
    host[1] = "";
    if(host[0].search("/") > -1){
      host[0] = host[0].slice(0,-1);
    }
  }
  urlDescription["host"] = host[0];
  urlDescription["path"] = "/"+host[1];
  
  // parses URL queries
  urlDescription["args"] = {}
  if(URL.search("\\?") > -1){
    let urlArgs = URL.split("?");
    if(urlArgs[1].search("&") > -1){
      urlArgs = urlArgs[1].split("&");
      for(let i = 0; i < urlArgs.length; i++){
        let temp = urlArgs[i].split("=");
        urlDescription.args[temp[0]] = temp[1];
      }
    }
  }
  
  if(verbose){
    log(chalk.yellow("[Parsing URL]"));
    log(chalk.green(URL))
    log(chalk.blue(JSON.stringify(urlDescription,null,2)));    
  }
  return urlDescription;
}

// Creates Request Headers
function buildRequest(input,_URL){
  let _reqMethod = input[1]._name.toUpperCase();
  let _protocol = "HTTP/1.1";
  let _header = input[1].header;  
  let requestBody = "";
  let httpRequest = "";
  
  // User POSTS File
  if(input[1].file !== undefined){
    requestBody = fs.readFileSync(path.join(__dirname, '../files/') + input[1].file, 'utf8');
    log("\n"+chalk.grey(chalk.green("["+chalk.cyan(input[1].file)+"] Contents: \n")+requestBody+"\n"));
    _URL["Content-Length"] = new Buffer(requestBody).length;
    clientContentBodyFlag = true;
  }else if(verbose){
    log(chalk.grey("Request body is empty"));  
  }
  
  // User POSTS inline data
  if(input[1].inlineData !== undefined){
    requestBody = input[1].inlineData;
    _URL["Content-Length"] = new Buffer(requestBody).length;
    clientContentBodyFlag = true;
  }else if(verbose){
    log(chalk.grey("Request body is empty"));
  }
  
  // Concats Request
  httpRequest += _reqMethod + " " + _URL.path + " " + _protocol + "\r\n";
  httpRequest += "Host:"+_URL.host+"\r\n";  // required for most sites
  if (_header.length > 0){
    for( let i = 0; i < _header.length; i++ ){
      httpRequest += _header[i]+"\r\n";
    }
  }
  
  // Determines Content-Length of request body
  if(clientContentBodyFlag){
    httpRequest += "Content-Length: "+_URL["Content-Length"]+"\r\n";
    clientContentBodyFlag = false;
  }
  
  httpRequest += "\r\n"+requestBody;
  
  return httpRequest;
}

/*
** Net/Socket Modules
*/
function connectHTTP(input){
  let _URL = parseURL(input[0]);
  let host = _URL.host;
  let port = _URL.port;
  let httpRequest = buildRequest(input,_URL);
  
  if(verbose){
    log(chalk.yellow("\n[Beginning TCP connection]"));    
  }
  
  // Create a TCP connction 
  let socket = new net.Socket();
  let responseData = "";
  let numPackets = 1;
  let clientInfo;
  
  // Starts TCP connection
  socket.connect(port,host);
  
  // Listens for successful host lookup
  socket.on('lookup',function(err,address,family,host){
    if(!err){
      if(verbose){
        log(chalk.green("Host Lookup Successful"));
        log(chalk.blue("Host: ")+host);
        log(chalk.blue("Famliy: ")+family);
        log(chalk.blue("IP Address: ")+address);
      }
    }else{
      log(chalk.red("Error: "+err));
      return 0;
    }
  })
  
  // Listens for successful connection
  socket.on('connect',function(a){
    if(verbose){
      log(chalk.green('\nSocket connection established'));
      log(chalk.yellow("[Preparing Client Request]"))
      log(chalk.grey("Raw HTTP Request:\n"))  
      log(chalk.white(httpRequest)+"\n");
    }
    
    // Sends request to server
    socket.write(httpRequest,function(a){      
      if(verbose){
        log(chalk.yellow("[Request Sent]\n"));
      }
    }); 
    
    // Closes connection
    socket.end();
  })
  
  // Listens for server data
  socket.on('data', function(data){
    if(verbose){
      log(chalk.green("Server Response:"+chalk.grey("\tPacket ")+"["+chalk.white(numPackets++)+"]"+chalk.grey(" Recieved")));
    }
    
    // If data is large it gets chunked, parse data after all received data
    redirectFlag = checkRedirect(data.toString(),host);
    responseData += data;
    clientInfo = this.address();
  });
  
  // Listens connection errors
  socket.on('error',function(err){
    log(chalk.red(err));
    return 0;
  });
  
  // Listens closed connection
  socket.on('close',function(){
    // Parse server data
    if(responseData.length > 0){
      parseServerResponse(responseData.toString()); 
      if(verbose){
        log(chalk.grey("\nClient information: \n")+chalk.cyan(JSON.stringify(clientInfo,null,2)));
        log(chalk.yellow('\n[TCP connection closed]\n'));
        log(chalk.red("Number of Redirects ")+"["+numRedirects+']');        
      }
      if(redirectFlag){
        redirectFlag = false;
        numRedirects++;
        log(chalk.yellow("[Redirecting to new URL]\n")+chalk.cyan(redirectLocation)+"\n");
        input[0] = redirectLocation;
        connectHTTP(input);
      }
    }else{
      log(chalk.red("No Server Response Detected"));
    }
  })
}


/*
** COMMANDER
*/
commander
  .command('get')   
  .description('HTTP Get Request')
  .option('-v, --verbose [boolean]','Verbose - decriptive logging')
  .option('-h, --header [header...]','Add a header attribute', function(attributes,headerArgs){
    headerArgs.push(attributes);
    return headerArgs;
  },[])
  .option('-d, --inline-data [inline-data]','Add inline data for request body')
  .option('-f, --file [file]','Attatch file to Request')
  .action(function(URL,option){
    //log('Request Method: '+option._name);
    //log('URL: '+URL);
    //if(option.verbose)log('Verbose: '+option.verbose);
    //if(option.header)log('Header: '+option.header);
    //if(option.inlineData)log('Data: '+option.inlineData);
    //if(option.file)log('File: '+option.file);
  });
  
commander
  .command('post')     
  .description('HTTP Post Request')
  .option('-v, --verbose [boolean]','Verbose - descriptive loggin')
  .option('-h, --header [header...]','Add a request header attribute', function(attributes,headerArgs){
    headerArgs.push(attributes);
    return headerArgs;
  },[])
  .option('-d, --inline-data [inline-data]','Add inline data for request body')
  .option('-f, --file [file]','Attach file to request')
  .action(function(URL,option){
    // maybe check URL before parse?
  });

// Help Command
commander
  .command('help')
  .option('get', "Program Help Assistant")
  .option('post', "Program Help Assistant")

// Parses input
commander.parse(process.argv);
var input = commander.args;

// Display help if empty arguments
if (commander.args.length === 0) {
  commander.help();
  return 0;
}

// HELP command
if(input[0] == "help"){
  if(input[1] == "get"){
    display.get();
  }else if(input[1] == "post"){
    display.post();
  }else{
    display.info();
  }
  return 0;
// GET/POST commands
}else if(input[1]){
  if(input[1]._name == "get" || input[1]._name== "post"){
    if(input[1].verbose == "true"){
      verbose = true;
    }
    
    if(input[1].inlineData && input[1].file){
      log(chalk.red("\nCannot have both -d (inline-data) and -f (file) together\n"))
      display.info();
    }
    
    // GO TO THE INTERNET!!
    display.splash();
    connectHTTP(input);
    
    /*
      TODO::CHECK POST FOR FILE VS INLINE
    */
  }
// Input error
}else{
  log(chalk.red("\nInput Error"))
  display.info();
}
