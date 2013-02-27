var Y = require('../Y');
var ui = require('../ui');
var downloader = require('../downloader');
var assert = require('assert');
var async = require('async');

module.exports = function(argv) {
    var term = argv._[1];
    assert('undefined' !== typeof term);

    var albumLocation = argv._[2];
    if('undefined' === typeof albumLocation) {
        albumLocation = false;
    }

    var trackLocation = argv._[3];
    if('undefined' === typeof trackLocation) {
        trackLocation = false;
    }

    var outputDir = argv['output-dir'];
    if('undefined' === typeof outputDir) {
        outputDir = '';
    }

    Y.searchAlbums(term, function (err, albums) {
        var al;

        if(false !== albumLocation) {
            al = albums[1*albumLocation];
            if(!al) {
                ui.printAlbumsList(albums);
                ui.err('Album not found: "'+ albumLocation + '".');
                ui.help('Please select album from the list above.');
                process.exit(1);
            }
        } else {
            ui.printAlbumsList(albums);
            ui.help('Please select album from the list above.');
            ui.help('Type:');
            ui.help('    yamusic "searchTerms" albumId');
            ui.help('Where albumId is ordinal number of album or its ID');
            process.exit(0);
        }
        ui.printAlbum(al);


        async.waterfall([
            function (next) {
                Y.getAlbumTracks(al.id, next);
            },
            function (tracks, next) {
                ui.printTracksList(tracks);
                downloader.downloadTrackList(tracks, outputDir, next);
            }
        ], function () {
            console.log('DONE!');
        });
    });

};