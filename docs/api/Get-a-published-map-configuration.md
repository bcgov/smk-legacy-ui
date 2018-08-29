# Fetch a published Map Configuration
## `GET /MapConfigurations/Published/{id}`

Executing a GET at the /MapConfiguration/Published/{ID} enpoint with a published map configuration ID will return the configuration details.

Example of curl
command:

``` bash
$ curl 'http://localhost:8080/MapConfigurations/Published/my-application' -i \
    -H 'Accept: application/json'
```

Example of HTTPie
command:

``` bash
$ http GET 'http://localhost:8080/MapConfigurations/Published/my-application' \
    'Accept:application/json'
```

Path Parameters:

|           |                              |
| --------- | ---------------------------- |
| Parameter | Description                  |
| `id`      | The SMK Map Configuration ID |

Example of http request:

``` http
GET /MapConfigurations/Published/my-application HTTP/1.1
Accept: application/json
Host: localhost:8080
```

Example of http response:

``` http
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Content-Length: 498

{"lmfId":"my-application","lmfRevision":1,"name":"My Application Edited","published":true,"surround":{"type":"default","title":"My Application"},"viewer":{"type":"leaflet","location":{"extent":[null,null,null,null],"center":[-139.1782,47.6039],"zoom":5.0},"baseMap":"Imagery"},"tools":[{"type":"menu","enabled":true,"title":"Menu","showPanel":true},{"type":"dropdown","enabled":true,"title":"","showPanel":true}],"_id":"ad593c1e44230b8894a465a049090521","_rev":"7-1c601def198c4106ea9fac171ad32475"}
```

Response
body:

``` options=
{"lmfId":"my-application","lmfRevision":1,"name":"My Application Edited","published":true,"surround":{"type":"default","title":"My Application"},"viewer":{"type":"leaflet","location":{"extent":[null,null,null,null],"center":[-139.1782,47.6039],"zoom":5.0},"baseMap":"Imagery"},"tools":[{"type":"menu","enabled":true,"title":"Menu","showPanel":true},{"type":"dropdown","enabled":true,"title":"","showPanel":true}],"_id":"ad593c1e44230b8894a465a049090521","_rev":"7-1c601def198c4106ea9fac171ad32475"}
```

For details on the published map config resource, see the Map Config
resource documentation
