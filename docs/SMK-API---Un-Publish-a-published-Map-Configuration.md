# `DELETE` /MapConfiguration/Published/{id} - Un-Publish a published Map Configuration

Executing a DELETE at the /MapConfiguration/Published/{ID} enpoint with a published map configuration ID will un-publish the configuration, removing it from availability in the published listing.

This will not delete the configuration.

Example of curl
command:

``` bash
$ curl 'http://localhost:8080/MapConfigurations/Published/my-application' -i -X DELETE \
    -H 'Accept: application/json'
```

Example of HTTPie
command:

``` bash
$ http DELETE 'http://localhost:8080/MapConfigurations/Published/my-application' \
    'Accept:application/json'
```

Path Parameters:

|           |                              |
| --------- | ---------------------------- |
| Parameter | Description                  |
| `id`      | The SMK Map Configuration ID |

Example of http request:

``` http
DELETE /MapConfigurations/Published/my-application HTTP/1.1
Accept: application/json
Host: localhost:8080
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
