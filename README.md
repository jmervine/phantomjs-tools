phantomjs-tools
===============

This repo contains rough examples of what can be done with [PhantomJS](http://phantomjs.org/) and Node.js together to gather metrics from a web page.

## Node.js Script Runner

### [runner.js](runner.js)

A Node.js runner, allowing for parallelizing multiple runs of the included PhantomJS scripts.

> Note: Non-JSON output is extremely rough and needs some serious work.

##### Setup:

```
npm install
```

##### Usage:

```
  Usage: runner.js [options]

  Options:

    -h, --help              output usage information
    -s , --script [string]  script to be run
    -r , --runs   [number]  number of runs [1]
    -j , --json             output in JSON format
    -m , --median           return median value

  Examples:

    $ ./runner.js -s timer -m -r 9 -j "http://google.com,http://github.com"

    $ ./runner.js -s grep -r 9 ./urls.txt ./strings.txt

    $ ./runner.js -s ./external/external.js -j ./urls.txt ./excluded.txt

  Warning:

  This is optimized for json output, otherwise, display for anything aside
  from simple timer output (e.g. ready and timer) needs a lot of work.
```
## PhantomJS Scripts

### [external.js](external/external.js)

Include a summarized count of external domain requests.

> ### Note:
> The domain of the request is automatically excluded.

See: [urls.txt.example](external/urls.txt.example), [excluded.txt.example](external/excluded.txt.example)

```
Usage: external.js <URL(s)>|<URL file> [<EXCLUDE(s)>|EXCLUDE file>] [--json]
```

### [timing.js](timing/timing.js)

Page load timings.

See: [urls.txt.example](timing/urls.txt.example)

```
Usage: timing.js <URL(s)>|<URL file> [--json]
```

### [grep.js](grep/grep.js)

Searching for strings in a page body.

See: [urls.txt.example](grep/urls.txt.example), [strings.txt.example](grep/strings.txt.example)

```
Usage: grep.js <URL(s)>|<URL file> <STRING(s)>|<STRING(s) file> [--json]
```

### [ready.js](ready/ready.js)

Report `$(document).ready` time.

See: [urls.txt.example](grep/urls.txt.example)

```
Usage: grep.js <URL(s)>|<URL file> [--json]
```
