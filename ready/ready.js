#!/usr/bin/env phantomjs
/***********************************************************
 * Author: @mervinej
 * Licence: MIT
 * Date: 11/27/2013
 *
 *  Run with:
 *
 *  $ phantomjs ./ready.js ./urls.txt
 *
 *  or
 *
 *  $ phantomjs ./ready.js \
 *     "http://foo.com, http://foo.com/bar"
 *
 *  '--json' returns JSON output for parsing with Phapper
 *  (http://github.com/jmervine/phapper).
 *
 ***********************************************************/

var webpage   = require('webpage');
var system    = require('system');
var util      = require('../common/util');
var args      = system.args.copyArgs();

function usage() {
    console.log('Usage: ready.js <URL(s)>|<URL(s) file> [--json]');
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
    var requests = [];
    var ready;

    page.open(address, function (status) {
        if (status !== 'success') {
            console.log('FAIL to load the address\n=> '+address);
        } else {

            if (json) {
                results.push({
                    address: address,
                    ready: (ready-t),
                    complete: (Date.now()-t)
                });
            } else {
                console.log('Regarding: ' + address);
                console.log('> ready after:    ' + (ready-t)      + ' msec');
                console.log('> complete after: ' + (Date.now()-t) + ' msec');
                console.log(' ');
            }
        }

        (page.close||page.release)();
        launcher();
        return;
    });

    page.onInitialized = function() {
        page.evaluate(function() {
            // $(document).ready(...)
            document.addEventListener('DOMContentLoaded', function() {
                window.callPhantom({ ready: true });
            }, false);
        });
    };

    page.onCallback = function(data) {
        if (data && data.ready) {
            ready = Date.now();
        }
    };
}

launcher();

