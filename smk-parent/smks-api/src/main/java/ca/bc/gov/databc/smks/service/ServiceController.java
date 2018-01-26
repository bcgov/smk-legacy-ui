package ca.bc.gov.databc.smks.service;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import ca.bc.gov.databc.smks.dao.CouchDAO;

@CrossOrigin
@RestController
@RequestMapping("/")
public class ServiceController 
{
	private static Log logger = LogFactory.getLog(LayerCatalogController.class);
	
	@Autowired
	private CouchDAO couchDAO;
	
	@RequestMapping(value = "/", method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<?> topLevel() 
	{
		logger.debug(" >> topLevel()");
		ResponseEntity<?> result = null;
		
		try
		{
			logger.debug("    Starting Top Level response...");
			
			final HttpHeaders httpHeaders = new HttpHeaders();
			httpHeaders.setContentType(MediaType.APPLICATION_JSON);

			result = new ResponseEntity<String>("{ \"version\": \"1.0.0\", \"description\": \"The SMK Service API is a restful service providing access to SMK application configurations.\" }", httpHeaders, HttpStatus.OK);
		}
		catch(Exception e)
		{
			logger.error("    ## Error generating top level: " + e.getMessage());
			result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
		}
		
		logger.info("    Top Level request complete. Response: " + result.getStatusCode().name());
		logger.debug(" << topLevel()");
		return result;
	}
	
	@RequestMapping(value = "/Health", method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<?> healthCheck() 
	{
		logger.debug(" >> healthCheck()");
		ResponseEntity<?> result = null;
		
		try
		{
			logger.debug("    Starting health check...");
			
			final HttpHeaders httpHeaders = new HttpHeaders();
			httpHeaders.setContentType(MediaType.APPLICATION_JSON);
			
			String couchStatus = couchDAO != null ? "Service is Available" : "Service Unavailable";
			
			result = new ResponseEntity<String>("{ \"serviceStatus\": \"Service is available\", \"couchDBStatus\": \"" + couchStatus + "\" }", httpHeaders, HttpStatus.OK);
		}
		catch(Exception e)
		{
			logger.error("    ## Error generating health status: " + e.getMessage());
			result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
		}
		
		logger.info("    Health check completed. Response: " + result.getStatusCode().name());
		logger.debug(" << healthCheck()");
		return result;
	}
}
