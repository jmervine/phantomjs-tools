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

module.exports = {
    trim: trim,
    parsePaths: parsePaths,
    isLocal: isLocal,
    domain: domain
};

