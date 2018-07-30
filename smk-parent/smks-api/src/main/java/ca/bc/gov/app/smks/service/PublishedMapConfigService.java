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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import ca.bc.gov.app.smks.SMKException;
import ca.bc.gov.app.smks.dao.CouchDAO;
import ca.bc.gov.app.smks.model.MapConfigInfo;
import ca.bc.gov.app.smks.model.MapConfiguration;
import ca.bc.gov.app.smks.service.controller.PublishedMapConfigServiceController;
import ca.bc.gov.app.smks.service.controller.SharedMapConfigController;

@CrossOrigin
@RestController
@RequestMapping("/MapConfigurations")
@PropertySource("classpath:application.properties")
public class PublishedMapConfigService 
{
	private static Log logger = LogFactory.getLog(PublishedMapConfigService.class);

	@Autowired
    private PublishedMapConfigServiceController publishedMapConfigServiceController;
	
	@Autowired
	private SharedMapConfigController sharedMapConfigController;
	
	@Autowired
    private ObjectMapper jsonObjectMapper;
	
	private static final String MAP_CONFIG_NOT_FOUND_MSG = "Map Configuration ID not found.";
    private static final String SUCCESS = "    Success!";
    private static final String SUCCESS_MESSAGE = "{ \"status\": \"Success!\" }";
    
	@Autowired
	private CouchDAO couchDAO;

	@GetMapping(value = "/Published")
	@ResponseBody
	public ResponseEntity<JsonNode> getAllPublishedMapConfigs() throws IOException
	{
		logger.debug(" >> getAllPublishedMapConfigs()");
		ResponseEntity<JsonNode> result = null;

		try
		{
			List<MapConfigInfo> configSnippets = publishedMapConfigServiceController.getAllPublishedMapConfigurationSnippets();
			result = new ResponseEntity<JsonNode>(jsonObjectMapper.convertValue(configSnippets, JsonNode.class), HttpStatus.OK);
		}
		catch (Exception e)
		{
			logger.error("    ## Error querying Map Config Resources: " + e.getMessage());
			result = sharedMapConfigController.handleError(e);
		}

		logger.info("    Get All Map Configurations completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getAllPublishedMapConfigs()");
		return result;
	}

	@PostMapping(value = "/Published/{id}")
	@ResponseBody
	public ResponseEntity<JsonNode> publishMapConfig(@PathVariable String id) throws IOException
	{
		logger.debug(" >> publishMapConfig()");
		ResponseEntity<JsonNode> result = null;

		try
		{
			publishedMapConfigServiceController.publishMapConfiguration(id);
			result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue("{ \"status:\" \"Success\", \"id\": \"" + id + "\" }", JsonNode.class), HttpStatus.CREATED);
		}
		catch (Exception e)
		{
			logger.error("    ## Error publishing Map Configuration resources " + e.getMessage());
			result = sharedMapConfigController.handleError(e);
		}

		logger.info("   Published Map Configuration completed. Response: " + result.getStatusCode().name());
		logger.debug(" << publishMapConfig()");
		return result;
	}

	@GetMapping(value = "/Published/{id}")
	@ResponseBody
	public ResponseEntity<JsonNode> getPublishedMapConfig(@PathVariable String id) throws IOException
	{
		logger.debug(" >> getPublishedMapConfig()");
		ResponseEntity<JsonNode> result = null;

		try
		{
			logger.debug("    Fetching a published Map Configuration...");
			MapConfiguration resource = publishedMapConfigServiceController.getPublishedMapConfiguration(id);

			if(resource == null) throw new SMKException(MAP_CONFIG_NOT_FOUND_MSG);
			
			logger.debug(SUCCESS);
			result = new ResponseEntity<JsonNode>(jsonObjectMapper.convertValue(resource, JsonNode.class), HttpStatus.OK);
		}
		catch (Exception e)
		{
			logger.error("    ## Error fetching map configuration: " + e.getMessage());
			result = sharedMapConfigController.handleError(e);
		}

		logger.info("    Fetch published Map Configuration completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getPublishedMapConfig()");
		return result;
	}

	@DeleteMapping(value = "/Published/{id}")
	@ResponseBody
	public ResponseEntity<JsonNode> deletePublishedMapConfig(@PathVariable String id) throws IOException
	{
		logger.debug(" >> deletePublishedMapConfig()");
		ResponseEntity<JsonNode> result = null;

		try
		{
		    publishedMapConfigServiceController.deletePublishedMapConfiguration(id);
			result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue(SUCCESS_MESSAGE, JsonNode.class), HttpStatus.OK);

		}
		catch (Exception e)
		{
			logger.error("    ## Error un publishing map configuration: " + e.getMessage());
			result = sharedMapConfigController.handleError(e);
		}

		logger.info("    Delete/Un-Publish published Map Configuration completed. Response: " + result.getStatusCode().name());
		logger.debug(" << deletePublishedMapConfig()");
		return result;
	}

	@GetMapping(value = "/Published/{configId}/Attachments/")
	@ResponseBody
	public ResponseEntity<JsonNode> getAllPublishedAttachments(@PathVariable String configId) throws IOException
	{
		logger.debug(" >> getAllPublishedAttachments()");
		ResponseEntity<JsonNode> result = null;

		try
		{
			List<String> attachments = publishedMapConfigServiceController.getPublishedMapConfigAttachmentSnippets(configId);
			result = new ResponseEntity<JsonNode>(jsonObjectMapper.convertValue(attachments, JsonNode.class), HttpStatus.OK);
		}
		catch (Exception e)
		{
			logger.error("    ## Error fetching all attachment resource: " + e.getMessage());
			result = sharedMapConfigController.handleError(e);
		}

		logger.info("    Get All Attachments completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getAllPublishedAttachments()");
		return result;
	}

	@GetMapping(value = "/Published/{configId}/Attachments/{attachmentId}")
	@ResponseBody
	public ResponseEntity<byte[]> getPublishedAttachment(@PathVariable String configId, @PathVariable String attachmentId) throws IOException
	{
		logger.debug(" >> getAttachment()");
		ResponseEntity<byte[]> result = null;

		try
		{
			MapConfiguration resource = couchDAO.getPublishedConfig(configId);
			result = sharedMapConfigController.handleGetAttachment(resource, attachmentId);
		}
		catch (Exception e)
		{
			logger.error("    ## Error fetching attachment resource: " + e.getMessage());
			result = new ResponseEntity<byte[]>(sharedMapConfigController.getErrorMessageAsJson(e).toString().getBytes(), HttpStatus.BAD_REQUEST);
		}

		logger.info("    Get Attachment completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getAttachment()");
		return result;
	}
	
	// application exporting
	// Fetch the exported version of this publish. If it doesn't exist yet, create the export
	@GetMapping(value = "/Published/{id}/Export/")
	@ResponseBody
	public ResponseEntity<byte[]> getMapConfigExport(@PathVariable String id) throws IOException
	{
		logger.debug(" >> getMapConfigExport()");
		ResponseEntity<byte[]> result = null;

		try
		{
			logger.debug(SUCCESS);
			AttachmentInputStream attachment = publishedMapConfigServiceController.processConfigExport(id);
			
			if(attachment == null) throw new SMKException("Export not found and could not be created.");
			
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
		catch (Exception e)
		{
			logger.error("    ## Error fetching map configuration: " + e.getMessage());
			result = new ResponseEntity<byte[]>(sharedMapConfigController.getErrorMessageAsJson(e).toString().getBytes(), HttpStatus.BAD_REQUEST);
		}

		logger.info("    Fetch published Map Configuration completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getMapConfigExport()");
		return result;
	}
}
