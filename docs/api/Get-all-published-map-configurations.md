# Fetch all published Map Configurations
## `GET /MapConfigurations/Published/`
Executing a GET at the MapConfiguration/Published endpoint will return a listing of all published SMK Map Configurations.

Example of curl command:

``` bash
$ curl 'http://localhost:8080/MapConfigurations/Published/' -i \
    -H 'Accept: application/json'
```

Example of HTTPie command:

``` bash
$ http GET 'http://localhost:8080/MapConfigurations/Published/' \
    'Accept:application/json'
```

Example of http request:

``` http
GET /MapConfigurations/Published/ HTTP/1.1
Accept: application/json
Host: localhost:8080
```

Example of http response:

``` http
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Content-Length: 82

[{"name":"My Application Edited","id":"my-application","revision":1,"valid":true}]
```

Response
body:

``` options=
[{"name":"My Application Edited","id":"my-application","revision":1,"valid":true}]
```
