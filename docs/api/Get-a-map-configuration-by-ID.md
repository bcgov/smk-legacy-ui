# Retrieve the latest versions of a SMK Map Configurations (non-published only)
## `GET /MapConfigurations/{id}`

Executing a GET at the /MapConfigurations/{id} endpoint with the SMK id will return the related Map Configuration document

> **Note**
> 
> The document returned will be the latest version, not the published version. 
> To get the published version, you must call the /Published/ endpoints.

> **Note**
> 
> It is possible to fetch previous version from this endpoint by including a query parameter of *version* with the desired version number. 
> This is not the preferred method of getting the current published configuration.

Example of curl command:

``` bash
$ curl 'http://localhost:8080/MapConfigurations/my-application' -i \
    -H 'Accept: application/json'
```

Example of HTTPie command:

``` bash
$ http GET 'http://localhost:8080/MapConfigurations/my-application' \
    'Accept:application/json'
```

Path Parameters:

| Parameter | Description                  |
| --------- | ---------------------------- |
| `id`      | The SMK Map Configuration ID |

Example of http request:

``` http
GET /MapConfigurations/my-application HTTP/1.1
Accept: application/json
Host: localhost:8080
```

Example of http response:

``` http
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Content-Length: 474

{"lmfId":"my-application","lmfRevision":1,"name":"My Application","surround":{"type":"default","title":"My Application"},"viewer":{"type":"leaflet","location":{"extent":[null,null,null,null],"center":[-139.1782,47.6039],"zoom":5.0},"baseMap":"Imagery"},"tools":[{"type":"menu","enabled":true,"title":"Menu","showPanel":true},{"type":"dropdown","enabled":true,"title":"","showPanel":true}],"_id":"ad593c1e44230b8894a465a049090521","_rev":"1-945e9f32e52727f4e75b9f603cb498cf"}
```

Response
body:

``` options=
{"lmfId":"my-application","lmfRevision":1,"name":"My Application","surround":{"type":"default","title":"My Application"},"viewer":{"type":"leaflet","location":{"extent":[null,null,null,null],"center":[-139.1782,47.6039],"zoom":5.0},"baseMap":"Imagery"},"tools":[{"type":"menu","enabled":true,"title":"Menu","showPanel":true},{"type":"dropdown","enabled":true,"title":"","showPanel":true}],"_id":"ad593c1e44230b8894a465a049090521","_rev":"1-945e9f32e52727f4e75b9f603cb498cf"}
```
