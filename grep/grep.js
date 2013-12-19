#!/usr/bin/env phantomjs
/***********************************************************
 * Author: @mervinej
 * Licence: MIT
 * Date: 12/02/2013
 *
 *  Run with:
 *
 *  $ phantomjs ./grep.js ./urls.txt ./strings.txt
 *
 *  or
 *
 *  $ phantomjs ./grep.js \
 *     "http://foo.com, http://foo.com/bar" \
 *     "string1, string2"
 *
 *  '--json' returns JSON output for parsing with Phapper
 *  (http://github.com/jmervine/phapper).
 *
 *  Warning: all search are case insensitive.
 *
 *  Note: As a bonus, I left the page timing as well from
 *  the example script I started this from.
 *
 ***********************************************************/

var webpage   = require('webpage');
var system    = require('system');
var util      = require('../common/util');
var args      = system.args.copyArgs();

function usage() {
    console.log('Usage: grep.js <URL(s)>|<URL(s) file> <STRING(s)|STRING(s) file>] [--json]');
    phantom.exit();
}

var json      = args.getArg(['--json', '-j'], false);
var addresses = util.parsePaths(args.shift());
var strings   = util.parsePaths(args.shift());
var finished  = 0;

if (addresses.length === 0) {
    usage();
}

// parse strings

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
            var body = page.evaluate(function() {
                return document.body.innerHTML;
            });

            var found = [];
            strings.forEach(function(str) {
                var count = 0;
                try {
                    count = Object.keys(body.match(new RegExp(str, 'ig'))).length;
                    found.push({ string: str, count: count });
                } catch(e) {
                    found.push({ string: str, count: 0 });
                }
            });

            if (json) {
                results.push({
                    address: address,
                    complete: t,
                    matches: found
                });
            } else {

                console.log('Regarding: ' + address);
                console.log('> took ' + t + ' msec');
                console.log(' ');

                console.log('Found:');

                found.forEach(function(item) {
                    console.log('- ' + item.string + ': ' + item.count);
                });

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

