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

| Status code       | Usage                                                                                                                                                                                                                                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `200 OK`          | Standard response for successful HTTP requests. The actual response will depend on the request method used. In a GET request, the response will contain an entity corresponding to the requested resource. In a POST request, the response will contain an entity describing or containing the result of the action. |
| `201 Created`     | The request has been fulfilled and resulted in a new resource being created.                                                                                                                                                                                                                                         |
| `204 No Content`  | The server successfully processed the request, but is not returning any content.                                                                                                                                                                                                                                     |
| `400 Bad Request` | The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).                                                                                                           |
| `404 Not Found`   | The requested resource could not be found but may be available again in the future. Subsequent requests by the client are permissible.                                                                                                                                                                               |

# Map Configuration Endpoints

| Type       | Link                                                            | Description                                                                                                                                         |
| ---------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST`   | SMK-API---Create-a-map-configuration\[/MapConfigurations/\]     | Create a new Map Configuration                                                                                                                      |
| `GET`    | SMK-API-Get-a-list-of-map-configurations\[/MapConfigurations/\] | Fetch a listing of all existing edit version map configurations. Published configurations will not be returned                                      |
| `GET`    |                                                                 | Fetch a map configuration document by ID. This will return the current editable version of a configuration. This will not return a published config |
| `PUT`    |                                                                 | Update an editable (unpublished) map configuration document                                                                                         |
| `DELETE` |                                                                 | Delete an editable (unpublished) map configuration document                                                                                         |

# Published Map Configuration Endpoints

| Type       | Link                                                                            | Description                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `POST`   | SMK-API-Publish-a-Map-Configuration\[/MapConfigurations/Published/\]            | Publish a Map Configuration                                                                                                                                  |
| `GET`    | SMK-API---Get-all-published-map-configurations\[/MapConfigurations/Published/\] | Fetch a listing of all existing published map configurations. Editable configurations will not be returned                                                   |
| `GET`    |                                                                                 | Fetch a published map configuration document by ID. This will return the current published version of a configuration. This will not return an edited config |
| `DELETE` |                                                                                 | Un-publish a published map configuration. This will not delete the existing editable configuration                                                           |

# Map Configuration Attachments Endpoints

| Type       | Link | Description                                                                                                              |
| ---------- | ---- | ------------------------------------------------------------------------------------------------------------------------ |
| `POST`   |      | Create a new attachment for a map configuration                                                                          |
| `POST`   |      | Replace an existing attachment with a new attachment document                                                            |
| `GET`    |      | Fetch a listing of all existing map configuration attachments, including vector layers, custom markers, and header image |
| `GET`    |      | Fetch a map configuration attachment by ATTACHMENT ID                                                                    |
| `DELETE` |      | Permenantly delete a map configurations attachment                                                                       |

> **Note**
> 
> published documents also include Attachment endpoints, but only the
> GET methods are available. They follow the same rules and structure as
> editable map configuration documents.

Complete resource model details SMK-API-Resource-Model\[can be found
here\]
