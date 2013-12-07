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
var fs        = require('fs');
var finished  = 0;
var addresses = [];
var strings   = [];

function usage() {
    console.log('Usage: grep.js <URL(s)>|<URL(s) file> <STRING(s)|STRING(s) file>] [--json]');
    phantom.exit();
}

function trim(str) {
    return str.replace(/^\s+/,'').replace(/\s+$/,'');
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

if (args.length !== 2) {
    usage();
}

// parse urls
if (fs.exists(args[0])) {
    fs.read(args[0])
        .split('\n')
        .forEach(function(line) {
            if (line !== '') {
                addresses.push(line);
            }
        });
} else {
    args[0].split(',').forEach(function(item) {
        addresses.push(trim(item));
    });
}

if (args[1]) {
    if (fs.exists(args[1])) {
        fs.read(args[1])
            .split('\n')
            .forEach(function(line) {
                if (line !== '') {
                    strings.push(line);
                }
            });
    } else {
        args[1].split(',').forEach(function(item) {
            strings.push(trim(item));
        });
    }
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
            var body = page.evaluate(function() {
                return document.body.innerHTML;
            });

            var found = [];
            strings.forEach(function(str) {
                var count = 0;
                try {
                    count = Object.keys(body.match(new RegExp(str, 'ig'))).length;
                } catch(e) {}

                if (count > 0) {
                    found.push({ string: str, count: count });
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
