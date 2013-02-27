var Y = require('./Y');
var ui = require('./ui');
var wget = require('wget');
var async = require('async');
var fs = require('fs');
var Progress = require('progress');

var D = exports;

exports.createFileName = function(trackInfo, trackNumber) {
    var parts = [];
    if('undefined' !== typeof trackNumber) {
        parts.push(trackNumber);
    }
    if('undefined' !== typeof trackInfo.artist) {
        parts.push(trackInfo.artist);
    }
    if('undefined' !== typeof trackInfo.album) {
        parts.push(trackInfo.album);
    }
    if('undefined' !== typeof trackInfo.title) {
        parts.push(trackInfo.title);
    }
    return parts.join(' - ') + '.mp3';
};

exports.downloadTrack = function(url, outputFile, done) {
    ui.info(outputFile);

    var progress = new Progress('Downloading [:bar] :percent :etas'.yellow, {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: 1,
        stream : process.stderr
    });
    var prevProgr = 0;

    async.waterfall([

    function(next) {
        fs.exists(outputFile, function(ex) {
            next(null, ex);
        });
    }, function(exists, next) {
        if(exists) {
            fs.unlink(outputFile, next);
        } else {
            next();
        }
    }, function(next) {
        var download = wget.download(url, outputFile);

        download.on('end', function() {
            console.error(); //to insert CRLF after progress bar
            next();
        });
        download.on('error', function(error) {
            next(error);
        });
        download.on('progress', function(p) {
            // console.error(progress);
            if((p-prevProgr) >= 0.05 || p === 1) {
                progress.tick(p-prevProgr);
                prevProgr = p;
            }
        });
    }], done);

};

exports.downloadTrackList = function(tracks, outputDir, done) {
    if(!outputDir) {
        outputDir = './';
    }
    var trackNum = 0;

    async.eachSeries(tracks, function(track, next) {
        trackNum++;

        async.waterfall([

        function(next) {
            var oFile = (D.createFileName(track, trackNum));
            oFile = outputDir + oFile;
            Y.getTrackMp3Url(track, function(err, trackUrl) {
                next(err, oFile, trackUrl);
            });
        }, function(oFile, trackUrl, next) {
            D.downloadTrack(trackUrl, oFile, next);
        }], next);

    }, done);
};