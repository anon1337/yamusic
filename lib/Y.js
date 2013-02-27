var assert = require('assert');
var scrape = require('scrape');
var querystring = require('querystring');
var crypt = require('./crypt');

var U_SEARCH = 'http://music.yandex.ru/fragment/search';
var U_ALBUM = 'http://music.yandex.ru/fragment/album';
var U_TRACKXML = 'http://storage.music.yandex.ru/get/{storage_dir}/2.xml';
var U_DOWNLOAD_INFO = 'http://storage.music.yandex.ru/download-info/{storage_dir}/{filename}';

var Y = module.exports = {};

Y.searchAlbums = function(q, cb) {
    var qs = querystring.stringify({
        text: q + '',
        type: 'albums'
    });

    var url = U_SEARCH + '?' + qs;

    scrape.request(url, function(err, $) {
        if(err) {
            cb(err);
        }
        var albums = [];
        $('a.b-link_class_albums-title-link').each(function(item) {
            albums.push({
                id:getAlbumIdFromHref(item.attribs.href),
                title:item.text
            });
        });
        cb(null, albums);
    });

};

Y.getAlbumTracks = function (alid, cb) {
    alid = 1*alid;
    assert(alid);
    var url = U_ALBUM + '/' + alid;

    scrape.request(url, function(err, $) {
        if(err) {
            cb(err);
        }
        var tracks = [];
        $('div.b-track').each(function(item) {
            if(item.attribs && item.attribs.onclick) {
                tracks.push(getTrackFromOnclick(item.attribs.onclick));
            }
        });
        cb(null, tracks);
    });
};

Y.getTrackMp3Url = function (track, cb) {
    assert(track);
    assert(track.storage_dir);
    var url = U_TRACKXML.replace('{storage_dir}', track.storage_dir);

    scrape.request(url, function(err, $) {
        if(err) {
            cb(err);
        }
        var trackElement = $('track');
        var fileName;
        assert(trackElement[0]);
        assert(trackElement[0].attribs);
        assert(fileName = trackElement[0].attribs.filename);
        var fullUrl = U_DOWNLOAD_INFO.replace('{storage_dir}', track.storage_dir);
        fullUrl = fullUrl.replace('{filename}', fileName);

        scrape.request(fullUrl, function (err, $) {
            if(err) {
                cb(err);
            }

            var host = $('host')[0].children[0].data;
            // var regHost = $('regional-host')[0].children[0].data;
            var regHost = getRegionalHostTags($('*'))[0].children[0].data;
            var path = $('path')[0].children[0].data;
            var s = $('s')[0].children[0].data;
            var ts = $('ts')[0].children[0].data;
            var region = $('region')[0].children[0].data;
            assert(regHost);
            assert(host);
            assert(path);
            assert(s);
            assert(ts);
            assert(region);

            // console.log($('*')[1].children);
            // console.log(regHost);
            // console.log(host);
            // console.log(path);
            // console.log(s);
            // console.log(ts);
            // console.log(region);

            var o = crypt(path.substr(1) + s);
            var mp3Url = ('http://' + regHost + '/get-mp3/' + o + '/' +
                            ts + path + '?' +
                            querystring.stringify({
                                context:'',
                                from:'service-playlist',
                                'track-id':track.id
                            }));

            // console.log('do_ob', mp3Url);

            cb(null, mp3Url);
        });
    });
};

function getAlbumIdFromHref(href) {
    var matches = (href+'').match(/(\d+)$/);
    assert.ok(matches[1]);
    return matches[1];
}

function getTrackFromOnclick(onclick) {
    var matches = (onclick+'').match(/^return\s(.+)$/);
    assert.ok(matches[1]);
    return JSON.parse(matches[1]);
}

function getRegionalHostTags(dom) {
    var items = [];
    dom[1].children.forEach(function (item) {
        if(item.type === 'tag' && item.name === 'regional-host') {
            items.push(item);
        }
    });

    return items;
}