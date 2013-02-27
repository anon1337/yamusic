var opt = require('optimist')
    .alias('o', 'output-dir')
    .usage('yamusic command [text] [options]')
    .demand(1);
var argv = opt.argv;

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