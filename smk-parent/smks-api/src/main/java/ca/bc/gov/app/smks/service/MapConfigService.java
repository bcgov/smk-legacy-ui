package ca.bc.gov.app.smks.service;

import java.io.IOException;
import java.util.List;

import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.ektorp.AttachmentInputStream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.PropertySource;
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

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import ca.bc.gov.app.smks.SMKException;
import ca.bc.gov.app.smks.dao.CouchDAO;
import ca.bc.gov.app.smks.model.MapConfigInfo;
import ca.bc.gov.app.smks.model.MapConfiguration;
import ca.bc.gov.app.smks.service.controller.MapConfigServiceController;

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
	
	@Autowired
	private CouchDAO couchDAO;

	@PostMapping(value = "/")
	@ResponseBody
	public ResponseEntity<JsonNode> createMapConfig(@RequestBody MapConfiguration request) throws JsonParseException, JsonMappingException, IOException
	{
		logger.debug(" >> createMapConfig()");
		ResponseEntity<JsonNode> result = null;

		try
		{
		    MapConfigServiceController.createMapConfiguration(request);
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
			List<MapConfigInfo> configSnippets = MapConfigServiceController.getMapConfigSnippets();

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

	@GetMapping(value = "/{id}")
	@ResponseBody
	public ResponseEntity<JsonNode> getMapConfig(@PathVariable String id, @RequestParam(value="version", required=false) String version) throws JsonParseException, JsonMappingException, IOException
	{
		logger.debug(" >> getMapConfig()");
		ResponseEntity<JsonNode> result = null;

		try
		{
			MapConfiguration resource = MapConfigServiceController.getMapConfiguration(id, version);
			result = new ResponseEntity<JsonNode>(jsonObjectMapper.convertValue(resource, JsonNode.class), HttpStatus.OK);
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
		    MapConfigServiceController.deleteMapConfiguration(id, version);
		    result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue(SUCCESS_MESSAGE, JsonNode.class), HttpStatus.OK);
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
		    MapConfigServiceController.updateMapConfiguration(id, request);
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
			    byte[] docBytes = request.getBytes();
		        String contentType = request.getContentType();
			    
		        MapConfigServiceController.createAttachment(configId, id, docBytes, contentType, type);
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

	@GetMapping(value = "/{configId}/Attachments")
	@ResponseBody
	public ResponseEntity<JsonNode> getAllAttachments(@PathVariable String configId) throws JsonParseException, JsonMappingException, IOException
	{
		logger.debug(" >> getAllAttachments()");
		ResponseEntity<JsonNode> result = null;

		try
		{
			List<String> attachments = MapConfigServiceController.getAllAttachmentSnippets(configId);
			result = new ResponseEntity<JsonNode>(jsonObjectMapper.convertValue(attachments, JsonNode.class), HttpStatus.OK);
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
		    MapConfigServiceController.deleteAttachment(configId, attachmentId);
			result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue("{ status: \"Success!\" }", JsonNode.class), HttpStatus.OK);
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
			    MapConfigServiceController.updateAttachment(configId, attachmentId, request.getBytes(), request.getContentType());
			    result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue("{ status: \"Success!\" }", JsonNode.class), HttpStatus.OK);
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
