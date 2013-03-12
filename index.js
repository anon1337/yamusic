#!/usr/bin/env node

var opt = require('optimist')
    .alias('o', 'output-dir')
    .alias('d', 'debug')
    .alias('l', 'log')
    .usage('yamusic command [text] [options]')
    .demand(1);
var argv = opt.argv;

if(argv.debug) {
    var curlLogger = require('./lib/curl-logger');
    var curl = require('scrape/node_modules/curlrequest'); //NOT SAFE!
    curlLogger.decorate(curl, argv.log);
}

var commands = require('./lib/commands');

var cmd = argv._[0];

if(commands.hasOwnProperty(cmd)) {
    commands[cmd](argv);
} else {
    opt.showHelp();
    process.exit(1);
}

process.on('SIGINT', function () {
    console.error('\nCtrl+C');
    process.exit(0);
});
