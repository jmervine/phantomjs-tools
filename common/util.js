/***********************************************************
 * Author: @mervinej
 * Licence: MIT
 * Date: 11/27/2013
 *
 * Shared utils for phantomjs-tools
 *
 ***********************************************************/
var fs = require('fs');

// automatically shared to anything that requires this file.
console.dir = function dir(obj) {
    console.log(JSON.stringify(obj, null, 2));
};

Array.prototype.copyArgs = function copyArgs() {
    var n = new Array();
    this.forEach(function(e) {
        n.push(e);
    });
    n.shift(); // remove file name
    return n;
};

// usage:
//
// var arg = system.args.copy(); // see above
// var useFULL = arg.getArgs(['--full', '-f'], false); // false
// var useJSON = arg.getArgs(['--json', '-j'], false); // true
// var gotNAME = arg.getArgs(['--name', '-n'], true);  // foo
Array.prototype.getArg = function getArg(flags, hasValue) {
    for (var i = 0; i < flags.length; i++) {
        var pos = this.indexOf(flags[i]);
        if (pos !== -1) {
            if (hasValue) {
                try {
                    var ret = this[pos+1];
                    console.log('ret: ' + ret);
                    this.splice(pos,2);
                    return ret;
                } catch (e) {
                    console.trace(e);
                    return false;
                }
            }
            var len = this.length-1;
            this.splice(pos, 1);
            return true;
        }
    }
    return false;
};

function trim(str) {
    return str.replace(/^\s+/,'').replace(/\s+$/,'');
}

function parsePaths(str) {
    var result = [];
    if (!str) {
        return result;
    }

    if (fs.exists(str)) {
        fs.read(str)
            .split('\n')
            .forEach(function(line) {
                if (line !== '') {
                    result.push(line);
                }
            });
    } else {
        str.split(',').forEach(function(item) {
            result.push(trim(item));
        });
    }
    return result;
}

function isLocal(excludes, path) {
    var matched = false;
    excludes.forEach(function(domain) {
        if (path.match('^https?://[^/]*'+domain) || path.match('^//[^/]*'+domain)) {
            matched = true;
        }
    });
    return matched;
}

function domain(url) {
    return url.match("^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)")[1];
}

function doJSON(address, time, successes, failures, callback) {
    var reqs = [];
    if (typeof failures === 'function') {
        callback = failures;
        failures = [];
    }
    successes.forEach(function(item) {
        item.successful = true;
        reqs.push(item);
    });

    failures.forEach(function(item) {
        item.successful = false;
        reqs.push(item);
    });
    callback({
        address: address,
        complete: time,
        requests: reqs
    });
    return;
}

function doTEXT(address, time, successes, failures, callback) {
    if (typeof failures === 'function') {
        callback = failures;
        failures = [];
    }
    console.log('Regarding: ' + address);
    console.log('> took ' + time + ' msec');
    console.log(' ');
    console.log('External Requests:');

    callback(successes);
    console.log(' ');

    if (failures.length > 0) {
        console.log('Failed Requests:');
        callback(failures);
        console.log(' ');
    }

    return;
}

function reqSort(a, b) {
    if (a.count < b.count) {
        return 1;
    }
    if (a.count > b.count) {
        return -1;
    }
    return 0;
}

function referer(headers) {
    return headers.filter(function(header) {
        if (header.name === 'Referer') {
            return header;
        }
    })[0].value;
}

module.exports = {
    trim: trim,
    parsePaths: parsePaths,
    isLocal: isLocal,
    domain: domain,
    doJSON: doJSON,
    doTEXT: doTEXT,
    reqSort: reqSort,
    referer: referer
};

