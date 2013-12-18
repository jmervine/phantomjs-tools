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

function isLocal(path) {
    var matched = false;
    local_domains.forEach(function(domain) {
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

//function open(address) {
    //var t = Date.now();
    //var page = webpage.create();
    //var requests = [];

    //page.open(address, function(stats) {
        //if (status !== 'success') {
            //console.log('FAIL to load the address');
        //} else {
            //t = Date.now() - t;
        //}
    //});

//}

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

