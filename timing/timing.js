#!/usr/bin/env phantomjs
/***********************************************************
 * Author: @mervinej
 * Licence: MIT
 * Date: 11/27/2013
 *
 *  Run with:
 *
 *  $ phantomjs ./timing.js ./urls.txt
 *
 *  or
 *
 *  $ phantomjs ./timing.js \
 *     "http://foo.com, http://foo.com/bar"
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
 * TODO: Support populating this array from an external
 * source.
 ***********************************************************/

function usage() {
    console.log('Usage: timing.js <URL(s)>|<URL(s) file> [--json]');
    phantom.exit();
}

if (system.args.length === 1) {
    usage();
}

// remove unimportant args
var jsonIndex = system.args.indexOf('--json');
var json = (jsonIndex !== -1);
var urls;
var i = 0;
system.args.forEach(function(arg) {
    if (i !== 0 && i !== jsonIndex) {
        urls = arg;
    }
    i++;
});

var addresses = util.parsePaths(urls);

if (!addresses || addresses.length === 0) {
    usage();
}

var results = []; // if --json

addresses.forEach(function(address) {
    var t = Date.now();
    var page = webpage.create();

    page.open(address, function (status) {
        if (status !== 'success') {
            console.log('FAIL to load the address');
        } else {
            t = Date.now() - t;

            if (json) {
                results.push({
                    address: address,
                    complete: t
                });
            } else {
                console.log('Regarding: ' + address);
                console.log('> took ' + t + ' msec');
                console.log(' ');
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
});

