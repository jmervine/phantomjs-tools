#!/usr/bin/env node
/***********************************************************
 * Author: @mervinej
 * Licence: MIT
 * Date: 12/07/2013
 ***********************************************************/

var fs      = require('fs');
var Phapper = require('phapper');
var async   = require('async');
var program = require('commander');

program
  .option('-s , --script [string]' , 'script to be run')
  .option('-r , --runs   [number]' , 'number of runs [1]', parseInt, 1)
  .option('-j , --json'            , 'output in JSON format')
  .option('-m , --median'          , 'return median value');

program.on('--help', function() {
    console.log('  Examples:');
    console.log('');
    console.log('    $ ./runner.js -s timer -m -r 9 -j "http://google.com,http://github.com"');
    console.log('');
    console.log('    $ ./runner.js -s grep -r 9 ./urls.txt ./strings.txt');
    console.log('');
    console.log('    $ ./runner.js -s ./external/external.js -j ./urls.txt ./excluded.txt');
    console.log('');
    console.log('  Warning:');
    console.log('');
    console.log('  This is optimized for json output, otherwise, display for anything aside\n  from simple timer output (e.g. ready and timer) needs a lot of work.');
    console.log('');
});

program.parse(process.argv);

if (!program.script) {
    program.script = program.args.slice(0);
}

try {
    if (!fs.statSync(program.script).isFile()) {
        var s = './'+program.script+'/'+program.script+'.js';
        if (fs.statSync(s).isFile()) {
            script = s;
        }
    }
} catch(e) {
    console.error("ERROR: '%s' isn't a valid script", program.script);
    process.exit(1);
}

var args = program.args;

if (args.indexOf('--json') === -1) {
    args.push('--json');
}

var runner  = new Phapper(script, args);
var runs    = [];
for (var i=0; i < program.runs; i++) {
    runs.push( function(callback) {
        runner.run(function(json, stdio) {
            if (stdio.error) {
                callback(stdio.error, null);
            }
            if (!json) {
                callback(new Error(stdio.stdout), null);
            }
            callback(null, json);
        });
    });
}

async.parallel(runs,
    function(err, results) {
        if (err) {
            console.trace(err);
            process.exit(1);
        }
        var sets = {};
        results.forEach(function(res) {
            res.forEach(function(r) {
                var address = r.address;
                delete r.address;

                sets[address] = sets[address] || {};
                Object.keys(r).forEach(function(key) {
                    sets[address][key] = sets[address][key] || [];
                    sets[address][key].push(r[key]);
                });
            });
        });

        if (program.json) {
            Object.keys(sets).forEach(function(set) {
                Object.keys(sets[set]).forEach(function(metric) {
                    var result = sets[set][metric];
                    if (Array.isArray(result) && typeof result[0] === 'number') {
                        result = median(result);
                    }
                    sets[set][metric] = result;
                });
            });
            console.log(JSON.stringify(sets, null, 2));
        } else {
            Object.keys(sets).forEach(function(set) {
                console.log('Regarding %s:', set);
                Object.keys(sets[set]).forEach(function(metric) {
                    var result = median(sets[set][metric]);
                    if (Array.isArray(result)) {
                        console.log('\n* %s:', metric);
                        crawl(result);
                    } else {
                        console.log('* %s: %s', metric, result);
                    }
                });
                console.log('');
            });
        }
    }
);

// functions
function median(values) {
    if (!program.median || !Array.isArray(values) || typeof values[0] !== 'number') {
        return values;
    }
    values.sort( function(a,b) {return a - b;} );
    var half = Math.floor(values.length/2);
    return (values.length % 2) ? values[half] : (values[half-1] + values[half]) / 2.0;
}

function crawl(item, depth) {
    depth = depth || 1;
    if (Array.isArray(item)) {
        var i = 1;
        item.forEach(function(sub) {
            if (Array.isArray(sub)) {
                crawl('Run ['+(i++)+']', depth);
            }
            crawl(sub, depth+1);
        });
        return;
    }

    if (typeof item === 'object') {
        Object.keys(item).forEach(function(key) {
            if (typeof item[key] === 'string') {
                crawl(item[key], depth);
            } else if (typeof item[key] === 'boolean' ||
                       typeof item[key] === 'number') {
                crawl(key+': '+item[key], depth+1);
            } else {
                crawl(item[key], depth+1);
            }
        });
        return;
    }

    var spacer = '';
    for (var i = 0; i < (depth*2); i++) {
        spacer += ' ';
    }
    console.log('%s- %s', spacer, item);
    return;
}
