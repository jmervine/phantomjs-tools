phantomjs-tools
===============

### external.js

Include a summarized count of external domain requests.

> Note:
>
> Update `local_domains` Array in the script to exclude domains.
>
> Additionally, the domain of the request is automatically
> excluded.

See: [urls.txt.example](urls.txt.example)

```
Usage: external.js <some URL>|<some file>
```

Sample output:

```
Regarding: http://www.google.com
> took 1211 msec

External Requests:
 - ssl.gstatic.com [2]

Regarding: http://www.github.com
> took 4337 msec

External Requests:
 - github.global.ssl.fastly.net [16]
 - github.com [14]
 - ssl.google-analytics.com [4]
 - collector-cdn.github.com [2]
 - collector.githubapp.com [2]
```

### timing.js

Page load timings.

See: [urls.txt.example](urls.txt.example)

```
Usage: external.js <some URL>|<some file>
```

Sample output:

```
Regarding: http://www.google.com
> took 1108 msec

Regarding: http://www.github.com
> took 2985 msec
```
