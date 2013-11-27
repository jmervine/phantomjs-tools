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
    console.log('Usage: timing.js <some URL>|<some file>');
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

addresses.forEach(function(address) {
    var t = Date.now();
    var page = webpage.create();

    page.open(address, function (status) {
        if (status !== 'success') {
            console.log('FAIL to load the address');
        } else {
            t = Date.now() - t;

            console.log('Regarding: ' + address);
            console.log('> took ' + t + ' msec');
            console.log(' ');

            finished++;
        }
        if (finished === addresses.length) {
            phantom.exit();
        }
    });
});

