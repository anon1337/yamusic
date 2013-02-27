require('colors');

exports.err = function (err) {
    console.error((''+err).red.bold);
};

exports.help = function (msg) {
    console.error((''+msg));
};

exports.info = function (msg) {
    console.error((''+msg).blue);
};

exports.printAlbumsList = function(albums) {
    albums.forEach(function (album, i) {
        console.error(
            (''+i).blue + '\t' +
            album.id.yellow + '\t' +
            album.title.green
        );
    });
};

exports.printAlbum = function(album) {
    console.error(
        'Album: ' +
        album.id.yellow + ' ' +
        album.title.green.bold.underline
    );
    console.error();
};

exports.printTracksList = function(tracks) {
    tracks.forEach(function (track, i) {
        console.error(
            (''+i).blue + '\t' +
            track.id.yellow + '\t' +
            track.title.green.bold
        );
    });
};
