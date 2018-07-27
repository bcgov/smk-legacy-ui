package ca.bc.gov.app.smks.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.xml.parsers.ParserConfigurationException;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.ektorp.Attachment;
import org.ektorp.AttachmentInputStream;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.TransformException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.xml.sax.SAXException;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonParser.Feature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import ca.bc.gov.app.smks.SMKException;
import ca.bc.gov.app.smks.converter.DocumentConverterFactory;
import ca.bc.gov.app.smks.converter.DocumentConverterFactory.DocumentType;
import ca.bc.gov.app.smks.dao.CouchDAO;
import ca.bc.gov.app.smks.model.Attribute;
import ca.bc.gov.app.smks.model.Layer;
import ca.bc.gov.app.smks.model.MapConfigInfo;
import ca.bc.gov.app.smks.model.MapConfiguration;
import ca.bc.gov.app.smks.model.layer.Vector;
import net.lingala.zip4j.exception.ZipException;

@CrossOrigin
@RestController
@RequestMapping("/MapConfigurations")
@PropertySource("classpath:application.properties")
public class MapConfigService
{
	private static Log logger = LogFactory.getLog(MapConfigService.class);

	@Autowired
    private ObjectMapper jsonObjectMapper;
	
	private static final String MAP_CONFIG_NOT_FOUND_MSG = "Map Configuration ID not found.";
	private static final String SUCCESS = "    Success!";
	private static final String SUCCESS_MESSAGE = "{ \"status\": \"Success!\" }";
	private static final String SHAPE = "shape";
	private static final String KML = "kml";
	private static final String KMZ = "kmz";
	private static final String VECTOR = "vector"; 
	private static final String DEFAULT_CONTENT_TYPE = "application/octet-stream";
	
	@Autowired
	private CouchDAO couchDAO;

	@Autowired
    private Environment env;
	
	@PostMapping(value = "/")
	@ResponseBody
	public ResponseEntity<JsonNode> createMapConfig(@RequestBody MapConfiguration request) throws JsonParseException, JsonMappingException, IOException
	{
		logger.debug(" >> createMapConfig()");
		ResponseEntity<JsonNode> result = null;

		try
		{
			logger.debug("    Creating new Map Configuration...");

			if(request.getName() == null) throw new SMKException("The SMK ID is null. This is a required field");
			if(request.getName().length() == 0) throw new SMKException("The SMK ID is empty. Please fill in a valid field");

			request.setLmfId(request.getName().toLowerCase().replaceAll(" ", "-").replaceAll("[^A-Za-z0-9]", "-"));
			
			request.setLmfRevision(1);
			request.setVersion(env.getProperty("smk.version"));

			// validate the ID, in case it's already in use.
			MapConfiguration existingDocID = couchDAO.getMapConfiguration(request.getLmfId());

			if(existingDocID != null)
			{
				// replace ID with a random guid
				request.setLmfId(UUID.randomUUID().toString());
			}

			couchDAO.createResource(request);
			logger.debug(SUCCESS);
			result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue("{ \"status\": \"Success\", \"couchId\": \"" + request.getId() + "\", \"lmfId\": \"" + request.getLmfId() + "\" }", JsonNode.class), HttpStatus.CREATED);
		}
		catch (Exception e)
		{
			logger.error("    ## Error creating Map Configuration resources " + e.getMessage());
			result = new ResponseEntity<JsonNode>(getErrorMessageAsJson(e), HttpStatus.BAD_REQUEST);
		}

		logger.info("    Create New Map Configuration completed. Response: " + result.getStatusCode().name());
		logger.debug(" << createMapConfig()");
		return result;
	}

	@GetMapping(value = "/")
	@ResponseBody
	public ResponseEntity<JsonNode> getAllMapConfigs() throws JsonParseException, JsonMappingException, IOException
	{
		logger.debug(" >> getAllMapConfigs()");
		ResponseEntity<JsonNode> result = null;

		try
		{
			logger.debug("    Querying for all Map Resources...");
			Map<String, String> resourceIds = couchDAO.getAllConfigs();
			logger.debug("    Success, found " + resourceIds.size() + " valid results");

			ArrayList<MapConfigInfo> configSnippets = getMapConfigSnippets(resourceIds);

			result = new ResponseEntity<JsonNode>(jsonObjectMapper.convertValue(configSnippets, JsonNode.class), HttpStatus.OK);
		}
		catch (Exception e)
		{
			logger.error("    ## Error querying Map Config Resources: " + e.getMessage());
			result = new ResponseEntity<JsonNode>(getErrorMessageAsJson(e), HttpStatus.BAD_REQUEST);
		}

		logger.info("    Get All Map Configurations completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getAllMapConfigs()");
		return result;
	}

	private ArrayList<MapConfigInfo> getMapConfigSnippets(Map<String, String> resourceIds)
	{
        ArrayList<MapConfigInfo> configSnippets = new ArrayList<MapConfigInfo>();
        for(Map.Entry<String, String> entry : resourceIds.entrySet())
        {
            String key = entry.getKey();
            String value = entry.getValue();
            
            try
            {
                MapConfiguration config = couchDAO.getMapConfiguration(value);
                configSnippets.add(new MapConfigInfo(config));
            }
            catch(Exception e)
            {
                logger.debug("Map Configuration " + key + " could not be loaded because it was invalid");
                
                // Add an empty config snippet
                MapConfigInfo config = new MapConfigInfo();
                config.setId(key);
                config.setName(value);
                config.setRevision(0);
                config.setValid(false);
                
                configSnippets.add(config);
            }
        }
        
        return configSnippets;
	}
	
	@GetMapping(value = "/{id}")
	@ResponseBody
	public ResponseEntity<JsonNode> getMapConfig(@PathVariable String id, @RequestParam(value="version", required=false) String version) throws JsonParseException, JsonMappingException, IOException
	{
		logger.debug(" >> getMapConfig()");
		ResponseEntity<JsonNode> result = null;

		try
		{
			logger.debug("    Fetching Map Configuration " + id);
			MapConfiguration resource = null;
			if(version != null && version.length() > 0)
			{
				logger.debug("    Getting version " + version);
				resource = couchDAO.getMapConfiguration(id, Integer.parseInt(version));
			}
			else
			{
				logger.debug("    Getting current version");
				resource = couchDAO.getMapConfiguration(id);
			}

			if(resource != null)
			{
				logger.debug(SUCCESS);
				result = new ResponseEntity<JsonNode>(jsonObjectMapper.convertValue(resource, JsonNode.class), HttpStatus.OK);
			}
			else throw new SMKException("Map Config not found for ID " + id + " and version " + version + " does not exist");
		}
		catch (Exception e)
		{
			logger.error("    ## Error querying Map Configuration resource " + id + ": " + e.getMessage());
			result = new ResponseEntity<JsonNode>(getErrorMessageAsJson(e), HttpStatus.BAD_REQUEST);
		}

		logger.info("    Get Map Configuration completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getMapConfig()");
		return result;
	}

	@DeleteMapping(value = "/{id}")
	@ResponseBody
	public ResponseEntity<JsonNode> deleteMapConfig(@PathVariable String id, @RequestParam(value="version", required=false) String version) throws JsonParseException, JsonMappingException, IOException
	{
		logger.debug(" >> deleteMapConfig()");
		ResponseEntity<JsonNode> result = null;

		try
		{
			logger.debug("    Deleting a Map Configuration...");

			// If we have a published version, cancel the delete and warn about un-publishing first
			MapConfiguration published = couchDAO.getPublishedConfig(id);
			if(published != null) throw new SMKException("The Map Configuration has a published version. Please Un-Publish the configuration first via the {DELETE} /MapConfigurations/Published/{id} endpoint before deleting a configuration archive. ");
			else // nothing is published, so lets go forward with the delete process
			{
				// Should we be deleting just the requested config (may be many versions!) or all of the versions?

				// delete only the specified version
				if(version != null && version.length() > 0)
				{
					logger.debug("    Getting version " + version);
					MapConfiguration resource = couchDAO.getMapConfiguration(id, Integer.parseInt(version));

					if(resource != null)
					{
						logger.debug("    Deleting Map Configuration " + id + " version " + version);
						couchDAO.removeResource(resource);
						logger.debug(SUCCESS);
						result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue(SUCCESS_MESSAGE, JsonNode.class), HttpStatus.OK);
					}
					else throw new SMKException("Map Config not found for ID " + id + " and version " + version + " does not exist");
				}
				// delete everything!
				else
				{
					logger.debug("    Deleting all versions");

					List<MapConfiguration> resources = couchDAO.getAllMapConfigurationVersions(id);
					for(MapConfiguration config : resources)
					{
						couchDAO.removeResource(config);
					}
					result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue(SUCCESS_MESSAGE, JsonNode.class), HttpStatus.OK);
				}
			}
		}
		catch (Exception e)
		{
			logger.error("    ## Error deleting map configuration: " + e.getMessage());
			result = new ResponseEntity<JsonNode>(getErrorMessageAsJson(e), HttpStatus.BAD_REQUEST);
		}

		logger.info("    Delete Map Configuration completed. Response: " + result.getStatusCode().name());
		logger.debug(" << deleteMapConfig()");
		return result;
	}

	@PutMapping(value = "/{id}")
	@ResponseBody
	public ResponseEntity<JsonNode> updateMapConfig(@PathVariable String id, @RequestBody MapConfiguration request) throws JsonParseException, JsonMappingException, IOException
	{
		logger.debug(" >> updateMapConfig()");
		ResponseEntity<JsonNode> result = null;

		try
		{
			logger.debug("    Updating a Map Configuration...");

			if(request.isPublished()) throw new SMKException("You cannot update the currently published Map Configuration. Please update the editable version.");
			
			MapConfiguration resource = couchDAO.getMapConfiguration(id);

		     // find out if we're removing layers. If so, we may have to remove attachments as well
			boolean layerRemoved = false;
            for(Layer originalLayer : resource.getLayers())
            {
                if(originalLayer.getType().equals(VECTOR))
                {
                    boolean exists = false;
                    
                    for(Layer layer : request.getLayers())
                    {
                        if(layer.getId().equals(originalLayer.getId()))
                        {
                            exists = true;
                            break;
                        }
                    }
                    
                    if(!exists)
                    {
                        // remove attachment for this layer, it doesn't exist anymore.
                        deleteAttachment(id, originalLayer.getId());
                        layerRemoved = true;
                    }
                }
            }
			
            // refresh, in case we've turfed any layer attachments
            if(layerRemoved) resource = couchDAO.getMapConfiguration(id);
            
            // Clone, to prevent removal of the attachments
			resource.setCreatedBy(request.getCreatedBy());
			resource.setId(request.getId());
			resource.setLayers(request.getLayers());
			resource.setLmfId(request.getLmfId());
			resource.setLmfRevision(request.getLmfRevision());
			resource.setName(request.getName());
			resource.setProject(request.getProject());
			resource.setPublished(request.isPublished());
			resource.setSurround(request.getSurround());
			resource.setTools(request.getTools());
			resource.setViewer(request.getViewer());
			resource.setVersion(request.getVersion());

			// Update!
			couchDAO.updateResource(resource);
			result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue(SUCCESS_MESSAGE, JsonNode.class), HttpStatus.OK);
		}
		catch (Exception e)
		{
			logger.error("    ## Error Updating Map Configuration: " + e.getMessage());
			result = new ResponseEntity<JsonNode>(getErrorMessageAsJson(e), HttpStatus.BAD_REQUEST);
		}

		logger.info("    Update Map Configuration Completed. Response: " + result.getStatusCode().name());
		logger.debug(" << updateMapConfig()");
		return result;
	}

	@PostMapping(value = "/{configId}/Attachments", headers=("content-type=multipart/form-data"))
	@ResponseBody
	public ResponseEntity<JsonNode> createAttachment(@PathVariable String configId, @RequestParam("file") MultipartFile request, @RequestParam("id") String id, @RequestParam("type") String type) throws JsonParseException, JsonMappingException, IOException
	{
		logger.debug(" >> createAttachment()");
		ResponseEntity<JsonNode> result = null;

		if(!request.isEmpty() && id != null && id.length() != 0)
		{
			try
			{
				logger.debug("    Creating new Attachment...");

				MapConfiguration resource = couchDAO.getMapConfiguration(configId);

				if(resource == null) throw new SMKException(MAP_CONFIG_NOT_FOUND_MSG);
				
		        byte[] docBytes = request.getBytes();
		        String contentType = request.getContentType();

		        if(contentType.equals("application/vnd.google-earth.kml+xml")) type = KML;
		        else if(contentType.equals("application/vnd.google-earth.kmz")) type = KMZ;
		        else if(contentType.equals("application/zip") || contentType.equals("application/x-zip-compressed")) type = SHAPE;
		        
			    createNewAttachment(configId, id, docBytes, contentType, type, resource);
			    
			    result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue(SUCCESS_MESSAGE, JsonNode.class), HttpStatus.OK);
			}
			catch (Exception e)
			{
				logger.error("    ## Error creating attachment resource: " + e.getMessage());
				result = new ResponseEntity<JsonNode>(getErrorMessageAsJson(e), HttpStatus.BAD_REQUEST);
			}
		}
		else result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue("{ \"status\": \"ERROR\", \"message\": \"File or ID was not submitted. Please post your form with a file, and id\" }", JsonNode.class), HttpStatus.BAD_REQUEST);

		logger.info("    Create New Attachment completed. Response: " + result.getStatusCode().name());
		logger.debug(" >> createAttachment()");
		return result;
	}

	private void createNewAttachment(String configId, String id, byte[] docBytes, String contentType, String type, MapConfiguration resource) throws SAXException, IOException, ParserConfigurationException, ZipException, FactoryException, TransformException
	{
	    // convert resource to geojson if it's a vector type
        if(type.equals(KML)) { type = VECTOR; docBytes = DocumentConverterFactory.convertDocument(docBytes, DocumentType.KML); contentType = DEFAULT_CONTENT_TYPE; }
        else if(type.equals(KMZ)) { type = VECTOR; docBytes = DocumentConverterFactory.convertDocument(docBytes, DocumentType.KMZ); contentType = DEFAULT_CONTENT_TYPE; }
        else if(type.equals(SHAPE)) { type = VECTOR; docBytes = DocumentConverterFactory.convertDocument(docBytes, DocumentType.SHAPE); contentType = DEFAULT_CONTENT_TYPE; }
        
        Attachment attachment = new Attachment(id, Base64.encodeBase64String(docBytes), contentType);
        resource.addInlineAttachment(attachment);
        
        // if this is a geojson blob, make sure we have verified the properties set
        if(type.equals(VECTOR))
        {
            processVectorAttributes(id, resource, docBytes);
        }

        MapConfiguration updatedResource = couchDAO.getMapConfiguration(configId);
        resource.setRevision(updatedResource.getRevision());
        couchDAO.updateResource(resource);

        logger.debug(SUCCESS);
	}
	
	public void processVectorAttributes(String id, MapConfiguration resource, byte[] docBytes) throws IOException
	{
	    Vector layer = (Vector)resource.getLayerByID(id);
        
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.configure(Feature.ALLOW_UNQUOTED_CONTROL_CHARS, true);
        
        JsonNode node = objectMapper.readValue(docBytes, JsonNode.class);

        List<String> fieldNames = new ArrayList<String>();
        
        for (final JsonNode featureNode : node.get("features")) 
        {
            JsonNode properties = featureNode.get("properties");

            for (Iterator<String> iter = properties.fieldNames(); iter.hasNext(); ) 
            {
                String fieldName = iter.next();
                
                if(!fieldName.equals("description") && !fieldNames.contains(fieldName))
                {
                    fieldNames.add(fieldName);
                }
            }
        }
        
        //clear the attribute list
        layer.getAttributes().clear();
        
        // add the new list
        for(String field : fieldNames)
        {
            Attribute attr = new Attribute();
            attr.setId(field);
            attr.setName(field);
            attr.setTitle(field.replace("-", " "));
            attr.setVisible(true);
            
            layer.getAttributes().add(attr);
        }
	}
	
	@GetMapping(value = "/{configId}/Attachments")
	@ResponseBody
	public ResponseEntity<JsonNode> getAllAttachments(@PathVariable String configId) throws JsonParseException, JsonMappingException, IOException
	{
		logger.debug(" >> getAllAttachments()");
		ResponseEntity<JsonNode> result = null;

		try
		{
			logger.debug("    Fetching all Attachments...");

			MapConfiguration resource = couchDAO.getMapConfiguration(configId);

			if(resource != null)
			{
				ArrayList<String> attachments = new ArrayList<String>();

				for(String key : resource.getAttachments().keySet())
				{
					Attachment attachment = resource.getAttachments().get(key);
					attachments.add("{ \"id\": \"" + key + "\", \"content-type\": \"" + attachment.getContentType() + "\", \"content-length\": \"" + attachment.getContentLength() + "\"  }");
				}

				logger.debug(SUCCESS);
				result = new ResponseEntity<JsonNode>(jsonObjectMapper.convertValue(attachments, JsonNode.class), HttpStatus.OK);
			}
			else throw new SMKException(MAP_CONFIG_NOT_FOUND_MSG);
		}
		catch (Exception e)
		{
			logger.error("    ## Error fetching all attachment resource: " + e.getMessage());
			result = new ResponseEntity<JsonNode>(getErrorMessageAsJson(e), HttpStatus.BAD_REQUEST);
		}

		logger.info("    Get All Attachments completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getAllAttachments()");
		return result;
	}

	@GetMapping(value = "/{configId}/Attachments/{attachmentId}")
	@ResponseBody
	public ResponseEntity<byte[]> getAttachment(@PathVariable String configId, @PathVariable String attachmentId) throws IOException
	{
		logger.debug(" >> getAttachment()");
		ResponseEntity<byte[]> result = null;

		try
		{
			logger.debug("    Fetching an Attachment...");

			MapConfiguration resource = couchDAO.getMapConfiguration(configId);

			if(resource != null)
			{
				AttachmentInputStream attachment = couchDAO.getAttachment(resource, attachmentId);
				byte[] media = IOUtils.toByteArray(attachment);

				final HttpHeaders httpHeaders= new HttpHeaders();
				MediaType contentType = MediaType.TEXT_PLAIN;

				if(attachment.getContentType() != null && attachment.getContentType().length() > 0)
				{
					String[] contentTypeVals = attachment.getContentType().split("/");
					contentType = new MediaType(contentTypeVals[0], contentTypeVals[1]);
				}

			    httpHeaders.setContentType(contentType);

				logger.debug(SUCCESS);
				result = new ResponseEntity<byte[]>(media, httpHeaders, HttpStatus.OK);
			}
			else throw new SMKException(MAP_CONFIG_NOT_FOUND_MSG);
		}
		catch (Exception e)
		{
			logger.error("    ## Error fetching attachment resource: " + e.getMessage());
			result = new ResponseEntity<byte[]>(getErrorMessageAsJson(e).toString().getBytes(), HttpStatus.BAD_REQUEST);
		}

		logger.info("    Get Attachment completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getAttachment()");
		return result;
	}

	@DeleteMapping(value = "/{configId}/Attachments/{attachmentId}")
	@ResponseBody
	public ResponseEntity<JsonNode> deleteAttachment(@PathVariable String configId, @PathVariable String attachmentId) throws JsonParseException, JsonMappingException, IOException
	{
		logger.debug(" >> deleteAttachment()");
		ResponseEntity<JsonNode> result = null;

		try
		{
			logger.debug("    Deleting a Map Configuration Attachment...");
			MapConfiguration resource = couchDAO.getMapConfiguration(configId);

			if(resource != null)
			{
				if(attachmentId != null && attachmentId.length() > 0 && resource.getAttachments().containsKey(attachmentId))
				{
					couchDAO.deleteAttachment(resource, attachmentId);
					logger.debug(SUCCESS);
					result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue("{ status: \"Success!\" }", JsonNode.class), HttpStatus.OK);
				}
				else throw new SMKException("Attachment ID not found.");
			}
			else throw new SMKException(MAP_CONFIG_NOT_FOUND_MSG);
		}
		catch (Exception e)
		{
			logger.error("    ## Error deleting attachment: " + e.getMessage());
			result = new ResponseEntity<JsonNode>(getErrorMessageAsJson(e), HttpStatus.BAD_REQUEST);
		}

		logger.info("    Delete Attachment completed. Response: " + result.getStatusCode().name());
		logger.debug(" << deleteAttachment()");
		return result;
	}

	@PostMapping(value = "/{configId}/Attachments/{attachmentId}", headers=("content-type=multipart/form-data"))
	@ResponseBody
	public ResponseEntity<JsonNode> updateAttachment(@PathVariable String configId, @PathVariable String attachmentId, @RequestParam("file") MultipartFile request) throws JsonParseException, JsonMappingException, IOException
	{
		logger.debug(" >> updateAttachment()");
		ResponseEntity<JsonNode> result = null;

		if(!request.isEmpty())
		{
			try
			{
				logger.debug("    Updating Attachment " + attachmentId + "...");

				MapConfiguration resource = couchDAO.getMapConfiguration(configId);

				if(resource != null)
				{
					couchDAO.deleteAttachment(resource, attachmentId);

					// fetch the updated resource, so we're not out of date
					resource = couchDAO.getMapConfiguration(configId);

					Attachment attachment = new Attachment(attachmentId, Base64.encodeBase64String(request.getBytes()), request.getContentType());
					resource.addInlineAttachment(attachment);

					couchDAO.updateResource(resource);

				    logger.debug(SUCCESS);
				    result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue("{ status: \"Success!\" }", JsonNode.class), HttpStatus.OK);
				}
				else throw new SMKException(MAP_CONFIG_NOT_FOUND_MSG);
			}
			catch (Exception e)
			{
				logger.error("    ## Error fetching all attachment resource: " + e.getMessage());
				result = new ResponseEntity<JsonNode>(getErrorMessageAsJson(e), HttpStatus.BAD_REQUEST);
			}
		}
		else result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue("{ \"status\": \"ERROR\", \"message\": \"File or ID was not submitted. Please post your form with a file, and id\" }", JsonNode.class), HttpStatus.BAD_REQUEST);

		logger.info("    Update Attachment completed. Response: " + result.getStatusCode().name());
		logger.debug(" << updateAttachment()");
		return result;
	}
	
	private JsonNode getErrorMessageAsJson(Exception e) throws JsonParseException, JsonMappingException, IOException
    {
        return jsonObjectMapper.readValue(("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }").replaceAll("\\r\\n|\\r|\\n", " "), JsonNode.class);
    }	
}
