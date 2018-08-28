# `POST` /MapConfigurations/{id}/Attachments/{ATTACHMENT_ID} - Replace an existing attachment for a Map Configuration

Executing a PUT at the MapConfiguration/{config_id}/Attachments endpoint with a formdata multipart file containing the desired attachment binary will replace the existing attachment document for this configuration.


Example of curl
command:

``` bash
$ curl -v -F key1=value1 -F upload=@localfilename 'http://localhost:8080/MapConfigurations/my-application/Attachments/my-attachment' -i -X POST\
    -H 'Accept: application/json'
```

Example of HTTPie
command:

``` bash
$ http POST'http://localhost:8080/MapConfigurations/my-application/Attachments/my-attachment' \
    'file@attachment.json' \
    'Accept:application/json'
```

Path Parameters:

| Parameter   | Description                  |
| ----------- | ---------------------------- |
| `config_id` | The SMK Map Configuration ID |

Request
Parameters:

| Parameter | Description                                                                         |
| --------- | ----------------------------------------------------------------------------------- |
| file      | A multipart formdata object containing the file information (kml, zip, image, etc.) |

Example of http
request:

``` http
POST /MapConfigurations/my-application/Attachments/my-attachment HTTP/1.1
(--- file stream not shown ---)
Accept: application/json
Host: localhost:8080
```

Example of http response:

``` http
HTTP/1.1 200 OK
Content-Type: application/json;charset=ISO-8859-1
Content-Length: 22

{ status: "Success!" }
```

Response body:

``` options=
{ status: "Success!" }
```
