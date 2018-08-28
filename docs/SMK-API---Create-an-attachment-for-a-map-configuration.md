# 

Additional request parameters are:

Attachment ID *my-attachment* Attachment Type
*kml|kmz|shape|vector|image*

If the type is excluded, the SMK service will attempt to determine the
attachment type. If the attachment type is:

application/vnd.google-earth.kml+xml - SMK will attempt to convert KML
to geojson application/vnd.google-earth.kmz - SMK will attempt to unzip
the KMZ, and convert contained KML to geojson application/zip - SMK will
attempt to unzip the zip file, and convert contained shapefile to
geojson

All other types will be stored directly as standard attachments with no
conversion.

If you are uploading an attachment to use as a custom marker image, you
must ensure your markerUrl in the layer configuration contains the
matching attachment ID.

> **Note**
> 
> Supplying KML, KMZ, or Shapefile attachments will trigger an automatic
> conversion of the suppllied attachment to GeoJSON. The source
> attachment will not be preserved.

Example of curl
command:

``` bash
$ curl -v -F key1=value1 -F upload=@localfilename 'http://localhost:8080/MapConfigurations/my-application/Attachments/?id=my-attachment&type=vector' -i -X POST \
    -H 'Accept: application/json'
```

Example of HTTPie
command:

``` bash
$ http POST'http://localhost:8080/MapConfigurations/my-application/Attachments/?id=my-attachment&type=vector' \
    'file@attachment.json' \
    'Accept:application/json'
```

Path Parameters:

|             |                              |
| ----------- | ---------------------------- |
| Parameter   | Description                  |
| `config_id` | The SMK Map Configuration ID |

Request
Parameters:

|           |                                                                                                                                                                                                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Parameter | Description                                                                                                                                                                                                                                                                                |
| `id`      | The desired ID for the attachment. Usually this is the layer name. If this is for the header image, the ID must be *surroundImage*. If this is a custom marker, the ID must be the layer id postfixed with *-marker*                                                                       |
| type      | The type of file upload for this attachment. This can be determined by the content type, but because some content types overlap, this can be used as a helper to ensure the correct processing occurs (particularly for application/octet-stream). Valid types are kml, kmz, shape, vector |
| file      | A multipart formdata object containing the file information (kml, zip, image, etc.)                                                                                                                                                                                                        |

Example of http
request:

``` http
POST /MapConfigurations/my-application/Attachments/?id=my-attachment&type=vector HTTP/1.1
(--- file stream not shown ---)
Accept: application/json
Host: localhost:8080
```

Example of http response:

``` http
HTTP/1.1 201 CREATED
Content-Type: application/json;charset=ISO-8859-1
Content-Length: 22

{ status: "Success!" }
```

Response body:

``` options=
{ status: "Success!" }
```
