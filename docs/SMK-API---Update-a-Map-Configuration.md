# `PUT` /MapConfigurations/{id} - Update a SMK Map Configuration (not for published configurations)

> **Note**
> The document must include the correct "_rev" and "_id" system values. 
> If these are missing, the update will fail. 
> You can get the latest values by fetching the current resource from {GET} /MapConfigurations/{id} prior to updating

> **Warning**
> 
> It is not possible to set the "Published" flag to true via this endpoint. 
> Attempting to do so will throw an exception.

Example of curl
command:

``` bash
$ curl 'http://localhost:8080/MapConfigurations/my-application' -i -X PUT \
    -H 'Content-Type: application/json' \
    -H 'Accept: application/json' \
    -d '{"lmfId":"my-application","lmfRevision":1,"name":"My Application Edited","surround":{"type":"default","title":"My Application"},"viewer":{"type":"leaflet","location":{"extent":[null,null,null,null],"center":[-139.1782,47.6039],"zoom":5.0},"baseMap":"Imagery"},"tools":[{"type":"menu","enabled":true,"title":"Menu","showPanel":true},{"type":"dropdown","enabled":true,"title":"","showPanel":true}],"_id":"ad593c1e44230b8894a465a049090521","_rev":"1-945e9f32e52727f4e75b9f603cb498cf"}'
```

Example of HTTPie
command:

``` bash
$ echo '{"lmfId":"my-application","lmfRevision":1,"name":"My Application Edited","surround":{"type":"default","title":"My Application"},"viewer":{"type":"leaflet","location":{"extent":[null,null,null,null],"center":[-139.1782,47.6039],"zoom":5.0},"baseMap":"Imagery"},"tools":[{"type":"menu","enabled":true,"title":"Menu","showPanel":true},{"type":"dropdown","enabled":true,"title":"","showPanel":true}],"_id":"ad593c1e44230b8894a465a049090521","_rev":"1-945e9f32e52727f4e75b9f603cb498cf"}' | http PUT 'http://localhost:8080/MapConfigurations/my-application' \
    'Content-Type:application/json' \
    'Accept:application/json'
```

Path Parameters:

| Parameter | Description                  |
| --------- | ---------------------------- |
| `id`      | The SMK Map Configuration ID |

Example of http request:

``` http
PUT /MapConfigurations/my-application HTTP/1.1
Content-Type: application/json
Accept: application/json
Host: localhost:8080
Content-Length: 481

{"lmfId":"my-application","lmfRevision":1,"name":"My Application Edited","surround":{"type":"default","title":"My Application"},"viewer":{"type":"leaflet","location":{"extent":[null,null,null,null],"center":[-139.1782,47.6039],"zoom":5.0},"baseMap":"Imagery"},"tools":[{"type":"menu","enabled":true,"title":"Menu","showPanel":true},{"type":"dropdown","enabled":true,"title":"","showPanel":true}],"_id":"ad593c1e44230b8894a465a049090521","_rev":"1-945e9f32e52727f4e75b9f603cb498cf"}
```

Request
Body:

``` options=
{"lmfId":"my-application","lmfRevision":1,"name":"My Application Edited","surround":{"type":"default","title":"My Application"},"viewer":{"type":"leaflet","location":{"extent":[null,null,null,null],"center":[-139.1782,47.6039],"zoom":5.0},"baseMap":"Imagery"},"tools":[{"type":"menu","enabled":true,"title":"Menu","showPanel":true},{"type":"dropdown","enabled":true,"title":"","showPanel":true}],"_id":"ad593c1e44230b8894a465a049090521","_rev":"1-945e9f32e52727f4e75b9f603cb498cf"}
```

Example of http response:

``` http
HTTP/1.1 200 OK
Content-Type: application/json;charset=ISO-8859-1
Content-Length: 24

{ "status": "Success!" }
```

Response body:

``` options=
{ "status": "Success!" }
```
