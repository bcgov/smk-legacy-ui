package ca.bc.gov.app.smks.service;

import java.net.MalformedURLException;
import java.util.ArrayList;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.PropertySource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import ca.bc.gov.app.smks.dao.LayerCatalogDAO;
import ca.bc.gov.app.smks.model.Layer;
import ca.bc.gov.app.smks.model.MPCMInfoLayer;
import ca.bc.gov.app.smks.model.WMSInfoLayer;

@CrossOrigin
@RestController
@RequestMapping("/LayerLibrary")
@PropertySource("classpath:application.properties")
public class LayerCatalogController 
{
	private static Log logger = LogFactory.getLog(LayerCatalogController.class);
	
	@Autowired
	private LayerCatalogDAO layerCatalogDao;
	
	@RequestMapping(value = "/wms/{id}", method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<?> getWmsLayer(@PathVariable String id) 
	{
		logger.debug(" >> getWmsLayer()");
		ResponseEntity<?> result = null;
		
		logger.debug("    Starting Get WMS Layer from DataBC GeoServer fetch...");
		
		if(id != null && id.length() > 0)
		{
			try 
			{
				WMSInfoLayer layer = layerCatalogDao.createWmsLayer(id);
				logger.debug("    Successfully fetched WMS Layer");
				result = new ResponseEntity<WMSInfoLayer>(layer, HttpStatus.OK);
			}
			catch (MalformedURLException e) 
			{
				logger.error("    ## Error querying WMS GeoServer. URL is invalid: " + e.getMessage());
				result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
			}
			catch (Exception e) 
			{
				logger.error("    ## Error querying WMS layer: " + e.getMessage());
				result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
			}
		}
		else
		{
			result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"ID is invalid\" }", HttpStatus.BAD_REQUEST);
		}
		
		logger.info("    Get WMS Layer completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getWmsLayer()");
		return result;
	}
	
	@RequestMapping(value = "/", method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<?> getLayers() 
	{
		logger.debug(" >> getLayers()");
		ResponseEntity<?> result = null;
		
		try
		{
			logger.debug("    Starting Get All Layers from MPCM fetch...");
			ArrayList<MPCMInfoLayer> layers = layerCatalogDao.createMpcmLayers();
			logger.debug("    Successfully fetched all MPCM catalog Layers");
			result = new ResponseEntity<ArrayList<MPCMInfoLayer>>(layers, HttpStatus.OK);
		}
		catch (Exception e) 
		{
			logger.error("    ## Error querying WMS layer: " + e.getMessage());
			result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
		}
		
		logger.info("    Get Layers completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getLayers()");
		return result;
	}
	
	@RequestMapping(value = "/{id}", method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<?> getLayer(@PathVariable String id) 
	{
		logger.debug(" >> getLayer()");
		ResponseEntity<?> result = null;
		
		logger.debug("    Starting Get Layer from MPCM fetch...");
		
		if(id != null && id.length() > 0)
		{
			try 
			{
				Layer layer = layerCatalogDao.createCatalogLayer(id);
				logger.debug("    Successfully fetched MPCM Catalog Layer");
				result = new ResponseEntity<Layer>(layer, HttpStatus.OK);
			} 
			catch (MalformedURLException e) 
			{
				logger.error("    ## Error querying MPCM layer. REST service URL is invalid: " + e.getMessage());
				result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
			}
			catch (Exception e) 
			{
				logger.error("    ## Error querying MPCM layer: " + e.getMessage());
				result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
			}
		}
		else
		{
			result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"ID is invalid\" }", HttpStatus.BAD_REQUEST);
		}
		
		logger.info("    Get Layer completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getLayer()");
		return result;
	}
}
