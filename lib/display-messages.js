const chalk = require('chalk');
const log = console.log;

// Intro message
exports.splash = function(){
  log(chalk.white('\n\n\t\t--------Starting httpc CLI-------'));
  log(chalk.yellow('\t\t\t[Program status]'));
  log(chalk.green('\t\t\tConnection Status'));
  log(chalk.grey('\t\t\tSection'));
  log(chalk.blue("\t\t\tAn-Item-Key: ")+chalk.white("Some-Value"));
  log(chalk.red("\t\t\tAn Error"));
  log(chalk.white('\t\t----------------------------------\n\n'));
}

// General help information
exports.info = function(){
  log(chalk.yellow("\t\t\t ...Help..."))
  log(chalk.grey("\n\t\thttpc is a cURL like application supporting HTTP protocols\n"))
  log(chalk.green("\t\tUsage \n\t\t  "+chalk.yellow("httpc")+" ["+chalk.cyan("Command")+"] "+" ["+chalk.magenta("Option")+"] "+" ["+chalk.red("URL")+"] "));
  log(chalk.green("\t\t  "+chalk.yellow("httpc")+" ("+chalk.cyan("get|post")+") "+" ["+chalk.magenta("-v true|false")+"] "+" ("+chalk.magenta("-h \"k:v\"")+")* "+" ["+chalk.magenta("-d inline-data")+"] "+" ["+chalk.magenta("-f file")+"] "+" ["+chalk.red("URL")+"] "));
  
  log(chalk.green("\n\t\tCommands\t\tDescription"));

  log(chalk.grey("\t\t  "+chalk.cyan("help")+"\t\t\t  Detailed Help"));
  log(chalk.grey("\t\t  "+chalk.cyan("get")+"\t\t\t  HTTP Get Request"));
  log(chalk.grey("\t\t  "+chalk.cyan("post")+"\t\t\t  HTTP Post Request"));
   
  log(chalk.green("\n\t\tOptions (all commands)\t\t\tDescription"));

  log(chalk.grey("\t\t  "+chalk.magenta("-v  --verbose")+"\t\t  ["+chalk.cyan("boolean")+"] Detailed request description"));
  log(chalk.grey("\t\t  "+chalk.magenta("-h  --header")+"\t\t  ["+chalk.cyan("string")+"] Request header attributes"));
  log(chalk.grey("\t\t  "+chalk.magenta("-d  --inline-data")+"\t  ["+chalk.cyan("string")+"] Request body data"));
  log(chalk.grey("\t\t  "+chalk.magenta("-f  --file")+"\t\t  Request attached file"));
  log(chalk.grey("\t\t  "+chalk.magenta("-o  --option")+"\t\t  Extra option"));
  
  log(chalk.green("\n\t\tExamples:"));
  log(chalk.green("\t\t"+chalk.yellow("httpc")+chalk.cyan(" get ")+chalk.red('"www.google.com"')));
  log(chalk.green("\t\t"+chalk.yellow("httpc")+chalk.cyan(" get ")+chalk.magenta('-v true -h Accept:text/html -h "Accept-Language:en-US"')+chalk.red(' "https://www.httpbin.com/get?key=value&key2=value2"')));
  log(chalk.green("\t\t"+chalk.yellow("httpc")+chalk.cyan(" post ")+chalk.magenta("-v false -d 'some post data'")+chalk.red(' "http://www.ptsv2.com/t/dinher/post"')));
  
  log(chalk.green("\n\t\tNotes:"));
  log(chalk.grey("\t\t  - cannot have both -d and -f together in a post request"));
  log(chalk.grey("\t\t  - file transfers will only read and post txt files"));
  log(chalk.grey("\t\t  - supports 3xx status codes and redirects"));
  log(chalk.grey("\t\t  - supports http and https protocols"));
  log(chalk.grey("\t\t  - try "+chalk.cyan("httpc help get")+" for detailed information on the commands"));
}

// GET info
exports.get = function(){
  log(chalk.yellow("\t\t\t ...Help..."))
  log(chalk.grey("\n\t\thttpc is a cURL like application supporting HTTP protocols"))
  log(chalk.grey("\t\t"+chalk.cyan("get")+" executes a HTTP GET request for the given URL"));
  log(chalk.green("\n\t\tUsage \n\t\t  "+chalk.yellow("httpc")+" "+chalk.cyan("get")+" "+ " ["+chalk.magenta("-v true|false")+"] "+ " ["+chalk.magenta("-h key:value")+"] "+ " ["+chalk.red("URL")+"] "));
  
  log(chalk.green("\n\t\tOptions\t\t\tDescription"));
  log(chalk.grey("\t\t  "+chalk.magenta("-v --verbose")+"\t\t  ["+chalk.cyan("boolean")+"] Detailed request description"));
  log(chalk.grey("\t\t  "+chalk.magenta("-h --header")+"\t\t  ["+chalk.cyan("string")+"] Header attributes in [key:value] format"));
  
  log(chalk.green("\n\t\tExamples:"));
  log(chalk.green("\t\t"+chalk.yellow("httpc")+chalk.cyan(" get ")+chalk.magenta("-v true ")+chalk.red('"www.google.com/?key=value&key2=value2"')));
  log(chalk.green("\t\t"+chalk.yellow("httpc")+chalk.cyan(" get ")+chalk.magenta('-h Accept:text/html -h "Accept-Language:en-US"')+chalk.red(' "https://www.httpbin.com/get"')));
}

// POST info
exports.post = function(){
  log(chalk.yellow("\t\t\t ...Help..."))
  log(chalk.grey("\n\t\thttpc is a cURL like application supporting HTTP protocols"))
  log(chalk.grey("\t\t"+chalk.cyan("post")+" executes a HTTP GET request for the given URL"));
  log(chalk.green("\n\t\tUsage \n\t\t  "+chalk.yellow("httpc")+" "+chalk.cyan("post")+" "+ " ["+chalk.magenta("-v true|fase")+"] "+ " ["+chalk.magenta("-h key:value")+"] "+" ["+chalk.magenta("-d inline-data")+"] "+" ["+chalk.magenta("-f file")+"] " +" ["+chalk.red("URL")+"] "));
  
  log(chalk.green("\n\t\tOptions\t\t\tDescription"));
  log(chalk.grey("\t\t  "+chalk.magenta("-v --verbose")+"\t\t  ["+chalk.cyan("boolean")+"] Detailed request description"));
  log(chalk.grey("\t\t  "+chalk.magenta("-h --header")+"\t\t  ["+chalk.cyan("string")+"] Header attributes in [key:value] format"));
  log(chalk.grey("\t\t  "+chalk.magenta("-d --inline-data")+"\t  ["+chalk.cyan("boolean")+"] Detailed request description"));
  log(chalk.grey("\t\t  "+chalk.magenta("-f --file")+"\t\t  ["+chalk.cyan("boolean")+"] Detailed request description"));
  
  log(chalk.green("\n\t\tExamples:"));
  log(chalk.green("\t\t"+chalk.yellow("httpc")+chalk.cyan(" post ")+chalk.magenta("-d 'hello internet' ")+chalk.red('"ptsv2.com/t/dinher/post"')));
  log(chalk.green("\t\t"+chalk.yellow("httpc")+chalk.cyan(" post ")+chalk.magenta('-h "Accept-Language:en-US -d "I am bored"')+chalk.red(' "https://www.httpbin.com/get"')));
}
