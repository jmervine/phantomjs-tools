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
var util      = require('../common/util');
var args      = system.args.copyArgs();

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

if (args.length === 0) {
    usage();
}

var json      = args.getArg(['--json', '-j'], false);
var addresses = util.parsePaths(args.shift());
var finished  = 0;

if (addresses.length === 0) {
    usage();
}

var results = [];
var limit   = 15;
var running = 1;

function launcher(){
    running--;
    while(running < limit && addresses.length > 0){
        running++;
        collectData(addresses.shift());
    }
    if(running < 1 && addresses.length < 1){
        if (json) {
            console.dir(results);
        }
        phantom.exit();
    }
}

function collectData(address) {
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
        launcher();
        return;
    });
}

launcher();

