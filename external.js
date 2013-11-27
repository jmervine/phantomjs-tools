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

function flattenAndTallySuccesses(reqs) {
    var ret = [];
    reqs.forEach(function(req) {
        if (req.responded) {
            url = domain(req.url);
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
        }
    });
    return ret;
}

function flattenAndTallyFailures(reqs) {
    var ret = [];
    reqs.forEach(function(req) {
        if (!req.responded) {
            url = domain(req.url);
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
        }
    });
    return ret;
}

addresses.forEach(function(address) {
    local_domains.push(domain(address));

    var t = Date.now();
    var page = webpage.create();
    var requests = [];
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

        var successes = flattenAndTallySuccesses(requests)
                        .sort(function(a,b) {
                            if (a.count < b.count) {
                                return 1;
                            }
                            if (a.count > b.count) {
                                return -1;
                            }
                            return 0;
                        });

        successes.forEach(function(url) {
            console.log(' - ' + url.url + ' [' + url.count + ']');
        });
        console.log(' ');

        var failures = flattenAndTallyFailures(requests)
                        .sort(function(a,b) {
                            if (a.count < b.count) {
                                return 1;
                            }
                            if (a.count > b.count) {
                                return -1;
                            }
                            return 0;
                        });

        if (failures.length > 0) {
            console.log('Failed Requests:');
            failures.forEach(function(url) {
                console.log(' - ' + url.url + ' [' + url.count + ']');
            });
            console.log(' ');
        }

        finished++;

        if (finished === addresses.length) {
            phantom.exit();
        }
        return;
    });

    page.onResourceRequested = function(data, request) {
        if (!isLocal(data.url)) {
            requests.push({ url: data.url, id: data.id });
        }
    };

    page.onResourceReceived = function(response) {
        if (!isLocal(response.url)) {
            var index = 0;
            requests.forEach(function(request) {
                if (request.url === response.url && request.id === response.id) {
                    requests[index].responded = true;
                }
                index++;
            });
        }
    };
});

