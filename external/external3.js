#!/usr/bin/env phantomjs
/***********************************************************
 * Author: @mervinej
 * Licence: MIT
 * Date: 11/27/2013
 *
 *  Run with:
 *
 *  $ phantomjs ./external2.js ./urls.txt [./excluded.txt]
 *
 *  or
 *
 *  $ phantomjs ./external2.js \
 *     "http://foo.com, http://foo.com/bar" \
 *     "exclude1.example.com, exclude2.example.com"
 *
 *  External 2 adds referer support.
 *
 *  '--json' returns JSON output for parsing with Phapper
 *  (http://github.com/jmervine/phapper).
 *
 *  '--full' returns full request/response url and referer
 *  as oppose to flattening them to just the domain.
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
 * Domains added to this Array will be excluded in addition
 * to an domains passed through the second argument.
 ***********************************************************/
var local_domains = [
    // domains to be excluded, e.g.:
    // "www.example.com"
];

function usage() {
    console.log('Usage: external2.js <URL(s)>|<URL(s) file> [<EXCLUDE(s)|EXCLUDE(s) file>] [--json] [--full]');
    phantom.exit();
}

if (system.args.length === 1) {
    usage();
}

function trim(str) {
    return str.replace(/^\s+/,'').replace(/\s+$/,'');
}

// remove unimportant args
var fullDomain = (system.args.indexOf('--full') !== -1);
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

function parsePaths(str) {
    var result = [];
    if (!str) return result;

    if (fs.exists(str)) {
        fs.read(str)
            .split('\n')
            .forEach(function(line) {
                if (line !== '') {
                    result.push(line);
                }
            });
    } else {
        str.split(',').forEach(function(item) {
            result.push(trim(item));
        });
    }
    return result;
}

// parse urls
addresses = addresses.concat(parsePaths(args[0]));

// parse excludes
local_domains = local_domains.concat(parsePaths(args[1]));

if (!addresses || addresses.length === 0) {
    usage();
}

function isLocal(path) {
    var matched = false;
    local_domains.forEach(function(domain) {
        if (path.match('^https?://[^/]*'+domain) || path.match('^//[^/]*'+domain)) {
            matched = true;
        }
    });
    return matched;
}

function domain(url) {
    if (fullDomain) {
        return url;
    }
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
                ret.push({ referer: domain(req.referer), url: url, count: 1 });
            }
        }
    });
    return ret;
}

function flattenAndTallyFailures(reqs) {
    var ret = [];
    reqs.forEach(function(req) {
        if (!req.responded) {
            url = req.url;
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
                ret.push({ referer: domain(req.referer), url: url, count: 1 });
            }
        }
    });
    return ret;
}

var results = [];
var limit=15;
var running =1;
function fin(){
    if (json) {
        console.dir(results);
    }
    phantom.exit();
}
function launcher(){
    running--;
    while(running < limit && addresses.length > 0){
        running++;
        collectData(addresses.shift());
    }
    if(running < 1 && addresses.length < 1){
        fin();
    }
}
function collectData(address){
    local_domains.push(domain(address));

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
                    console.log('* ' + url.referer + '\n  -> ' + url.url + ' [' + url.count + ']');
                });
                console.log(' ');
                if (failures.length > 0) {
                    console.log('Failed Requests:');
                    failures.forEach(function(url) {
                        console.log('* ' + url.referer + '\n  -> ' + url.url + ' [' + url.count + ']');
                    });
                    console.log(' ');
                }
            }
        }
        (page.close||page.release)();
        launcher();
    });

    page.onResourceRequested = function(data, request) {
        if (!isLocal(data.url)) {
            var referer = data.headers.filter(function(header) {
                if (header.name === "Referer") {
                    return header;
                }
            })[0].value;
            requests.push({ referer: referer, url: data.url, id: data.id });
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
}

console.dir = function dir(obj) {
    console.log(JSON.stringify(obj, null, 2));
}
launcher();
