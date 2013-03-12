var fs = require('fs');

exports.decorate = function (curl, logfile) {
    var oldRequest = curl.request;
    if(logfile) {
        var logh = fs.openSync(logfile, 'a');
        log = function (msg) {
            var bfr = new Buffer(msg + '\n');
            fs.writeSync(logh, bfr, 0, bfr.length);
        };
    } else {
        log = console.log.bind(console);
    }
    curl.request = function (options, callback) {
        var url = options.url;
        var method = options.method ? options.method : 'GET';
        log('REQUEST: ' + method + ' ' + url);
        oldRequest.call(curl, options, function (err, res) {
            if(err) {
                log('ERROR: ' + err);
            } else {
                log('RESPONSE: ' + res);
                log('\n');
            }
            callback(err, res);
        });
    };
};