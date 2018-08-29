# Retrieve an Attachment for a Map Configuration
## `GET /MapConfiguration/{id}/Attachments/{attachment_id}`

Executing a GET at the MapConfiguration/{id}/Attachments/{attachment_id} endpoint will return the attachment document, in whatever content type is indicated by the attachment.
 

Example of curl
command:

``` bash
$ curl 'http://localhost:8080/MapConfigurations/my-application/Attachments/my-attachment' -i \
    -H 'Accept: application/json'
```

Example of HTTPie
command:

``` bash
$ http GET 'http://localhost:8080/MapConfigurations/my-application/Attachments/my-attachment' \
    'Accept:application/json'
```

Path
Parameters:

| Parameter       | Description                                           |
| --------------- | ----------------------------------------------------- |
| `config_id`     | The SMK Map Configuration ID                          |
| `attachment_id` | The attachment ID for a map configurations attachment |

Example of http request:

``` http
GET /MapConfigurations/my-application/Attachments/my-attachment HTTP/1.1
Accept: application/json
Host: localhost:8080
```

Example of http response:

``` http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 318

{"type":"FeatureCollection","features":[{"type":"Feature","id":"test","properties":{"_style":4,"name":"TestBox","description":"This is a test box."},"geometry":{"type":"Polygon","coordinates":[[[-123.631897,48.679514],[-123.298874,48.694445],[-123.30574,48.541927],[-123.666916,48.485524],[-123.631897,48.679514]]]}}]}
```

Response
body:

``` options=
{"type":"FeatureCollection","features":[{"type":"Feature","id":"test","properties":{"_style":4,"name":"TestBox","description":"This is a test box."},"geometry":{"type":"Polygon","coordinates":[[[-123.631897,48.679514],[-123.298874,48.694445],[-123.30574,48.541927],[-123.666916,48.485524],[-123.631897,48.679514]]]}}]}
```
