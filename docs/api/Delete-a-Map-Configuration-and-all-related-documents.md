# Delete a Map Configuration
## `DELETE /MapConfigurations/{ID}`
Executing a DELETE at the /MapConfigurations/{ID} endpoint will permenantly delete the Map Configuration, including all attachments.

> **Note**
>
> If your Map Configuration has been published, you will not be able to delete. 
> If you want to completely remove your configuration, you must unpublish first (see {DELETE} /MapConfiguration/Published/{ID})

> **Warning**
> 
> This operation cannot be undone.

Example of curl
command:

``` bash
$ curl 'http://localhost:8080/MapConfigurations/my-application' -i -X DELETE \
    -H 'Accept: application/json'
```

Example of HTTPie command:

``` bash
$ http DELETE 'http://localhost:8080/MapConfigurations/my-application' \
    'Accept:application/json'
```

Path Parameters:

| Parameter | Description                  |
| --------- | ---------------------------- |
| `id`      | The SMK Map Configuration ID |

Example of http request:

``` http
DELETE /MapConfigurations/my-application HTTP/1.1
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
