# Delete an Attachment for a Map Configuration
## `DELETE /MapConfiguration/{id}/Attachments/{attachment_id}`
Executing a DELETE at the /MapConfiguration/{id}/Attachments/{attachment_id} endpoint will attempt to delete the attachment. 
Ensure you have updated any links in layer configurations to this attachment, if necessary.

> **Note**
> 
> Deleting a layer with attached vector information will automatically
> trigger an attachment delete.

Example of curl
command:

``` bash
$ curl 'http://localhost:8080/MapConfigurations/my-application/Attachments/my-attachment' -i -X DELETE \
    -H 'Accept: application/json'
```

Example of HTTPie
command:

``` bash
$ http DELETE 'http://localhost:8080/MapConfigurations/my-application/Attachments/my-attachment' \
    'Accept:application/json'
```

Path
Parameters:

| Parameter       | Description                                           |
| --------------- | ----------------------------------------------------- |
| `config_id`     | The SMK Map Configuration ID                          |
| `attachment_id` | The attachment ID for a map configurations attachment |

Example of http
request:

``` http
DELETE /MapConfigurations/my-application/Attachments/my-attachment HTTP/1.1
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
