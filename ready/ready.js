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
 ***********************************************************/

var webpage   = require('webpage');
var system    = require('system');
var fs        = require('fs');
var finished  = 0;
var addresses = [];

function usage() {
    console.log('Usage: ready.js <URL(s)>|<URL(s) file>');
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

if (!addresses || addresses.length === 0) {
    usage();
}

addresses.forEach(function(address) {
    var t = Date.now();
    var page = webpage.create();
    var requests = [];
    var ready;

    page.open(address, function (status) {
        if (status !== 'success') {
            console.log('FAIL to load the address');
            finished++;
            return;
        }

        console.log('Regarding: ' + address);
        console.log('> Document ready after ' + (ready-t) + ' msec');
        console.log(' ');
        finished++;

        if (finished === addresses.length) {
            phantom.exit();
        }
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

});
