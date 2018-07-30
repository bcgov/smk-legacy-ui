package ca.bc.gov.app.smks.service;

import java.io.IOException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import ca.bc.gov.app.smks.dao.CouchDAO;
import ca.bc.gov.app.smks.service.controller.SharedMapConfigController;

@CrossOrigin
@RestController
@RequestMapping("/")
public class TopLevelService 
{
	private static Log logger = LogFactory.getLog(LayerCatalogService.class);
	
	@Autowired
	private ObjectMapper jsonObjectMapper;
	
	@Autowired
	private CouchDAO couchDAO;
	
	@Autowired
    private SharedMapConfigController sharedMapConfigController;
	
	@GetMapping(value = "/")
	@ResponseBody
	public ResponseEntity<JsonNode> topLevel() throws IOException 
	{
		logger.debug(" >> topLevel()");
		ResponseEntity<JsonNode> result = null;
		
		try
		{
			logger.debug("    Starting Top Level response...");
			
			final HttpHeaders httpHeaders = new HttpHeaders();
			httpHeaders.setContentType(MediaType.APPLICATION_JSON);

			result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue("{ \"version\": \"1.0.0\", \"description\": \"The SMK Service API is a restful service providing access to SMK application configurations.\" }", JsonNode.class), httpHeaders, HttpStatus.OK);
		}
		catch(Exception e)
		{
			logger.error("    ## Error generating top level: " + e.getMessage());
			result = sharedMapConfigController.handleError(e);
		}
		
		logger.info("    Top Level request complete. Response: " + result.getStatusCode().name());
		logger.debug(" << topLevel()");
		return result;
	}
	
	@GetMapping(value = "/Health")
	@ResponseBody
	public ResponseEntity<JsonNode> healthCheck() throws IOException 
	{
		logger.debug(" >> healthCheck()");
		ResponseEntity<JsonNode> result = null;
		
		try
		{
			logger.debug("    Starting health check...");
			
			final HttpHeaders httpHeaders = new HttpHeaders();
			httpHeaders.setContentType(MediaType.APPLICATION_JSON);
			
			String couchStatus = couchDAO != null ? "Service is Available" : "Service Unavailable";
			
			result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue("{ \"serviceStatus\": \"Service is available\", \"couchDBStatus\": \"" + couchStatus + "\" }", JsonNode.class), httpHeaders, HttpStatus.OK);
		}
		catch(Exception e)
		{
			logger.error("    ## Error generating health status: " + e.getMessage());
			result = sharedMapConfigController.handleError(e);
		}
		
		logger.info("    Health check completed. Response: " + result.getStatusCode().name());
		logger.debug(" << healthCheck()");
		return result;
	}
}
