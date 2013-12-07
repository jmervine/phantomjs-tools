phantomjs-tools
===============

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
