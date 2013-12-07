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

function usage() {
    console.log('Usage: timing.js <URL(s)>|<URL(s) file> [--json]');
    phantom.exit();
}

if (system.args.length === 1) {
    usage();
}

function trim(str) {
    return str.replace(/^\s+/,'').replace(/\s+$/,'');
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
        addresses.push(trim(item));
    });
}

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
            finished++;
        }
        if (finished === addresses.length) {
            if (json) {
                console.log(JSON.stringify(results, null, 2));
            }
            phantom.exit();
        }
    });
});

