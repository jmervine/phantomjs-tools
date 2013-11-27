#!/usr/bin/env phantomjs
/***********************************************************
 *
 *  Run with:
 *
 *  $ phantomjs ./external.js ./urls.txt
 *
 *  or
 *
 *  $ phantomjs ./external.js \
 *     "http://foo.com, http://foo.com/bar"
 *
 *  Note: As a bonus, I left the page timing as well from
 *  the example script I started this from.
 *
 ***********************************************************/

var webpage   = require('webpage');
var system    = require('system');
var fs        = require('fs');
var finished  = 0;
var addresses = [];

/***********************************************************
 * Add any domains you wish to exclude to this array.
 *
 * TODO: Support populating this array from an external
 * source.
 ***********************************************************/
var local_domains = [
    // domains to be excluded, e.g.:
    // "www.example.com"
];

function usage() {
    console.log('Usage: external.js <some URL>|<some file>');
    phantom.exit();
}

if (system.args.length === 1) {
    usage();
}

if (fs.exists(system.args[1])) {
    fs.read(system.args[1])
        .split('\n')
        .forEach(function(line) {
            if (line !== '') {
                addresses.push(line);
            }
        });
} else {
    system.args[1].split(',').forEach(function(item) {
        addresses.push(item.replace(/^\s+/,'').replace(/\s+$/,''));
    });
}

if (!addresses || addresses.length === 0) {
    usage();
}

function isLocal(path) {
    var matched = false;
    local_domains.forEach(function(domain) {
        if (path.match('^https://'+domain) || path.match('^http://'+domain) || path.match('^//'+domain)) {
            matched = true;
        }
    });
    return matched;
}

function domain(url) {
    return url.match("^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)")[1];
}

function flattenAndTally(urls) {
    var ret = [];
    urls.forEach(function(url) {
        url = domain(url);
        var exists = false;
        var index = 0;
        ret.forEach(function(u) {
            if (u.url === url) {
                exists = true;
                ret[index].count++;
            }
            index++;
        });
        if (!exists) {
            ret.push({ url: url, count: 1 });
        }
    });
    return ret;
}

addresses.forEach(function(address) {
    local_domains.push(domain(address));

    var t = Date.now();
    var page = webpage.create();
    var urls = [];
    page.open(address, function (status) {
        if (status !== 'success') {
            console.log('FAIL to load the address');
            finished++;
            return;
        }
        t = Date.now() - t;

        console.log('Regarding: ' + address);
        console.log('> took ' + t + ' msec');
        console.log(' ');
        console.log('External Requests:');

        var results = flattenAndTally(urls)
                        .sort(function(a,b) {
                            if (a.count < b.count) {
                                return 1;
                            }
                            if (a.count > b.count) {
                                return -1;
                            }
                            return 0;
                        });

        results.forEach(function(url) {
            console.log(' - ' + url.url + ' [' + url.count + ']');
        });
        console.log(' ');

        finished++;

        if (finished === addresses.length) {
            phantom.exit();
        }
        return;
    });
    page.onResourceReceived = function(response) {
        if (!isLocal(response.url)) {
            urls.push(response.url);
        }
    };
});
