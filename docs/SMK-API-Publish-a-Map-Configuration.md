# `POST` MapConfigurations/Publish/{id} - Publish a Map Configuration

Executing a POST at the MapConfiguration/Publish endpoint with a Map Configuration id will create a published version of the map configuration.

A published map configuration is no longer editable, and considered stable for exporting and viewing. 
Any edits made will be on a new version of the map configuration document. 
A published map configuration cannot be altered in any way.

Example of curl
command:

``` bash
$ curl 'http://localhost:8080/MapConfigurations/Published/my-application' -i -X POST \
    -H 'Accept: application/json'
```

Example of HTTPie
command:

``` bash
$ http POST 'http://localhost:8080/MapConfigurations/Published/my-application' \
    'Accept:application/json'
```

Request Parameters:

|           |                              |
| --------- | ---------------------------- |
| Parameter | Description                  |
| `id`      | The SMK Map Configuration ID |

Example of http request:

``` http
POST /MapConfigurations/Published/my-application HTTP/1.1
Accept: application/json
Host: localhost:8080
```

Example of http response:

``` http
HTTP/1.1 201 Created
Content-Type: application/json;charset=ISO-8859-1
Content-Length: 47

{ "status:" "Success", "id": "my-application" }
```

Response body:

``` options=
{ "status:" "Success", "id": "my-application" }
```
