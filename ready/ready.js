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
var fs        = require('fs');
var finished  = 0;
var addresses = [];

function usage() {
    console.log('Usage: ready.js <URL(s)>|<URL(s) file> [--json]');
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

// parse urls
if (fs.exists(urls)) {
    fs.read(urls)
        .split('\n')
        .forEach(function(line) {
            if (line !== '') {
                addresses.push(line);
            }
        });
} else {
    urls.split(',').forEach(function(item) {
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
        finished++;

        if (finished === addresses.length) {
            if (json) {
                console.log(JSON.stringify(results, null, 2));
            }
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
