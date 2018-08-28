The Simple Map Kit Map Configuration and Creation Service (SMKS-API) is a RESULTful service for assisting with the creation and management of map configuration resources used by the SMK Client javascript application.

The Service API is used by the SMK Admin UI, and the client in standalone mode. 
When a Map Configuration is exported, the service is no longer needed and your application will not connect back to it.

# HTTP verbs

The SMK API Service tries to adhere as closely as possible to standard
HTTP and REST conventions in its use of HTTP verbs.

| Verb     | Usage                                            |
| -------- | ------------------------------------------------ |
| `GET`    | Used to retrieve a resource or list of resources |
| `POST`   | Used to create a new resource                    |
| `PUT`    | Used to update an existing resource              |
| `DELETE` | Used to delete an existing resource              |

# HTTP status codes

The SMK API service tries to adhere as closely as possible to standard
HTTP and REST conventions in its use of HTTP status
codes.

| Status code       | Usage                                    |
| ----------------- |------------------------------------------------- |
| `200 OK`          | Standard response for successful HTTP requests. The actual response will depend on the request method used. In a GET request, the response will contain an entity corresponding to the requested resource. In a POST request, the response will contain an entity describing or containing the result of the action. |
| `201 Created`     | The request has been fulfilled and resulted in a new resource being created.                                                                                                                                                                                                                                         |
| `204 No Content`  | The server successfully processed the request, but is not returning any content.                                                                                                                                                                                                                                     |
| `400 Bad Request` | The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).                                                                                                           |
| `404 Not Found`   | The requested resource could not be found but may be available again in the future. Subsequent requests by the client are permissible.                                                                                                                                                                               |

# Map Configuration Endpoints

| Method       | Path | Description |
| ---------- | ------------ | ----------- |
| `POST`   | [`/MapConfigurations`](api/Create-a-map-configuration)    | Create a new Map Configuration                                                                                                                      |
| `GET`    | [`/MapConfigurations`](api/Get-a-list-of-map-configurations) | Fetch a listing of all existing edit version map configurations. Published configurations will not be returned                                      |
| `GET`    | [`/MapConfigurations/{id}`](api/Get-a-map-configuration-by-ID) | Fetch a map configuration document by ID. This will return the current editable version of a configuration. This will not return a published config |
| `PUT`    | [`/MapConfigurations/{id}`](api/Update-a-Map-Configuration) | Update an editable (unpublished) map configuration document                                                                                         |
| `DELETE` | [`/MapConfigurations/{ID}`](api/Delete-a-Map-Configuration-and-all-related-documents) | Delete an editable (unpublished) map configuration document                                                                                         |

# Published Map Configuration Endpoints

| Method       | Path | Description |
| ---------- | ------------ | ----------- |
| `POST`   | [`/MapConfigurations/Publish/{id}`](api/Publish-a-Map-Configuration)      | Publish a Map Configuration                                                                                                                                  |
| `GET`    | [`/MapConfigurations/Published/`](api/Get-all-published-map-configurations) | Fetch a listing of all existing published map configurations. Editable configurations will not be returned                                                   |
| `GET`    | [`/MapConfigurations/Published/{id}`](api/Get-a-published-map-configuration) | Fetch a published map configuration document by ID. This will return the current published version of a configuration. This will not return an edited config |
| `DELETE` |  [`/MapConfiguration/Published/{id}`](api/Un-Publish-a-published-Map-Configuration)  | Un-publish a published map configuration. This will not delete the existing editable configuration                                                           |

# Map Configuration Attachments Endpoints

| Method       | Path | Description |
| ---------- | ------------ | ----------- |
| `POST`   | [`/MapConfigurations/{id}/Attachments/`](api/Create-an-attachment-for-a-map-configuration) | Create a new attachment for a map configuration                                                                          |
| `POST`   |[`/MapConfigurations/{id}/Attachments/{ATTACHMENT_ID}`](api/Update-a-Map-Configurations-attachment) | Replace an existing attachment with a new attachment document                                                            |
| `GET`    | [`/MapConfigurations/{id}/Attachments/`](api/Get-all-map-configuration-attachments) | Fetch a listing of all existing map configuration attachments, including vector layers, custom markers, and header image |
| `GET`    |[`/MapConfiguration/{id}/Attachments/{attachment_id}`](api/Get-a-specific-map-configurations-attachment)| Fetch a map configuration attachment by ATTACHMENT ID                                                                    |
| `DELETE` |[`/MapConfiguration/{id}/Attachments/{attachment_id}`](api/Delete-a-map-configurations-attachment)| Permenantly delete a map configurations attachment                                                                       |

> **Note**
> 
> Published documents also include Attachment endpoints, but only the GET methods are available. 
> They follow the same rules and structure as editable map configuration documents.

