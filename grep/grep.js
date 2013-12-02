#!/usr/bin/env phantomjs
/***********************************************************
 * Author: @mervinej
 * Licence: MIT
 * Date: 11/27/2013
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
    console.log('Usage: grep.js <URL(s)>|<URL(s) file> <STRING(s)|STRING(s) file>]');
    phantom.exit();
}

if (system.args.length === 1) {
    usage();
}

function trim(str) {
    return str.replace(/^\s+/,'').replace(/\s+$/,'');
}

// parse urls
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

if (system.args[2]) {
    if (fs.exists(system.args[2])) {
        fs.read(system.args[2])
            .split('\n')
            .forEach(function(line) {
                if (line !== '') {
                    strings.push(line);
                }
            });
    } else {
        system.args[2].split(',').forEach(function(item) {
            strings.push(trim(item));
        });
    }
}

if (!addresses || addresses.length === 0) {
    usage();
}

addresses.forEach(function(address) {
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

        var body = page.evaluate(function() {
            return document.body.innerHTML;
        });

        console.log('Found:');
        strings.forEach(function(str) {
            var count = 0;
            try {
                count = Object.keys(body.match(new RegExp(str, 'ig'))).length;
            } catch(e) {}

            if (count > 0) {
                console.log('- ' + str + ': ' + count);
            }
        });

        console.log(' ');
        finished++;

        if (finished === addresses.length) {
            phantom.exit();
        }
        return;
    });

});
