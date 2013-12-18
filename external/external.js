#!/usr/bin/env phantomjs
/***********************************************************
 * Author: @mervinej
 * Licence: MIT
 * Date: 11/27/2013
 *
 *  Run with:
 *
 *  $ phantomjs ./external.js ./urls.txt [./excluded.txt]
 *
 *  or
 *
 *  $ phantomjs ./external.js \
 *     "http://foo.com, http://foo.com/bar" \
 *     "exclude1.example.com, exclude2.example.com"
 *
 *  '--json' returns JSON output for parsing with Phapper
 *  (http://github.com/jmervine/phapper).
 *
 *  Note: As a bonus, I left the page timing as well from
 *  the example script I started this from.
 *
 ***********************************************************/

var util      = require('../common/util');
var webpage   = require('webpage');
var system    = require('system');
var finished  = 0;

/***********************************************************
 * Add any domains you wish to exclude to this array.
 *
 * Domains added to this Array will be excluded in addition
 * to an domains passed through the second argument.
 ***********************************************************/
var local_domains = [
    // domains to be excluded, e.g.:
    // "www.example.com"
];

function usage() {
    console.log('Usage: external.js <URL(s)>|<URL(s) file> [<EXCLUDE(s)|EXCLUDE(s) file>] [--json]');
    phantom.exit();
}

if (system.args.length === 1) {
    usage();
}

// remove unimportant args
var jsonIndex = system.args.indexOf('--json');
var json = (jsonIndex !== -1);
var args = [];
var i = 0;
system.args.forEach(function(arg) {
    if (i !== 0 && i !== jsonIndex) {
        args.push(arg);
    }
    i++;
});

// parse urls
var addresses = util.parsePaths(args[0]);

// parse excludes
local_domains = local_domains.concat(util.parsePaths(args[1]));

if (!addresses || addresses.length === 0) {
    usage();
}

function flattenAndTallySuccesses(reqs) {
    var ret = [];
    reqs.forEach(function(req) {
        if (req.responded) {
            url = util.domain(req.url);
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
            url = util.domain(req.url);
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

var results = [];

addresses.forEach(function(address) {
    local_domains.push(address);

    var t = Date.now();
    var page = webpage.create();
    var requests = [];

    page.open(address, function (status) {
        if (status !== 'success') {
            console.log('FAIL to load the address');
        } else {
            t = Date.now() - t;

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

            if (json) {
                var reqs = [];

                successes.forEach(function(item) {
                    item.successful = true;
                    reqs.push(item);
                });

                failures.forEach(function(item) {
                    item.successful = false;
                    reqs.push(item);
                });

                results.push({
                    address: address,
                    complete: t,
                    requests: reqs
                });
            } else {
                console.log('Regarding: ' + address);
                console.log('> took ' + t + ' msec');
                console.log(' ');
                console.log('External Requests:');

                successes.forEach(function(url) {
                    console.log(' - ' + url.url + ' [' + url.count + ']');
                });
                console.log(' ');
                if (failures.length > 0) {
                    console.log('Failed Requests:');
                    failures.forEach(function(url) {
                        console.log(' - ' + url.url + ' [' + url.count + ']');
                    });
                    console.log(' ');
                }
            }
        }

        (page.close||page.release)();
        finished++;

        if (finished === addresses.length) {
            if (json) {
                console.dir(results);
            }
            phantom.exit();
        }
    });

    page.onResourceRequested = function(data, request) {
        if (!util.isLocal(data.url)) {
            requests.push({ url: data.url, id: data.id });
        }
    };

    page.onResourceReceived = function(response) {
        if (!util.isLocal(response.url)) {
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

