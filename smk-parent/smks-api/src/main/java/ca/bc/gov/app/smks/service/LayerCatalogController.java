package ca.bc.gov.app.smks.service;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.node.ObjectNode;

import ca.bc.gov.app.smks.converter.DocumentConverterFactory;
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
	
	@RequestMapping(value = "/wms/", method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<?> getWmsConfigurations(@RequestParam(value="url", required=true) String url) 
	{
		logger.debug(" >> getWmsConfigurations()");
		ResponseEntity<?> result = null;
		
		logger.debug("    Starting Get WMS Layer from provided URL...");
		
		if(url != null && url.length() > 0)
		{
			try 
			{
				List<WMSInfoLayer> layers = layerCatalogDao.createWmsLayers(url);
				logger.debug("    Successfully fetched WMS Layers");
				result = new ResponseEntity<List<WMSInfoLayer>>(layers, HttpStatus.OK);
			}
			catch (MalformedURLException e) 
			{
				logger.error("    ## Error querying WMS Server. URL is invalid: " + e.getMessage());
				result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
			}
			catch (Exception e) 
			{
				logger.error("    ## Error querying WMS Server: " + e.getMessage());
				result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
			}
		}
		else
		{
			result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"URL is invalid\" }", HttpStatus.BAD_REQUEST);
		}
		
		logger.info("    Get WMS Layers completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getWmsConfigurations()");
		return result;
	}
	
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
	
    @RequestMapping(value = "/ImageToBase64", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getImageAsBase64(@RequestParam("url") String imageUrl)
    {
        logger.debug(" >> getImageAsBase64()");
        ResponseEntity<?> result = null;

        try
        {
            logger.debug("    Fetching image Base64 String from " + imageUrl);
            
            String base64 = DocumentConverterFactory.getImageBase64StringFromUrl(imageUrl);
            
            result = new ResponseEntity<String>("{ \"image\": \"" + base64 + "\"}", HttpStatus.OK);
        }
        catch (Exception e)
        {
            logger.error("    ## Error parsing KML file: " + e.getMessage());
            result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
        }

        logger.info("    Building image Base64 complete. Response: " + result.getStatusCode().name());
        logger.debug(" << getImageAsBase64()");
        return result;
    }
    
    @RequestMapping(value = "/ProcessKML", headers=("content-type=multipart/form-data"), method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> processKML(@RequestParam("file") MultipartFile request)
    {
        logger.debug(" >> processKML()");
        ResponseEntity<?> result = null;

        if(!request.isEmpty())
        {
            try
            {
                logger.debug("    Processing KML/KMZ data...");

                byte[] docBytes = request.getBytes();                
                String contentType = request.getContentType();
                ObjectNode resultingJson = null;
                
                if(contentType.equals("application/vnd.google-earth.kml+xml"))
                {
                    // get a list of layers as JSON, including image for markers and GeoJSON source data
                    resultingJson = DocumentConverterFactory.createlayersFromKML(docBytes);
                }
                else if(contentType.equals("application/vnd.google-earth.kmz"))
                {
                    resultingJson = DocumentConverterFactory.createlayersFromKMZ(docBytes);
                }

                if(resultingJson == null)
                {
                    throw new Exception("Valid GEOJson could not be generated from this KML");
                }
                else
                {
                    logger.debug("    Success!");
                    result = new ResponseEntity<ObjectNode>(resultingJson, HttpStatus.OK);
                }
            }
            catch (Exception e)
            {
                logger.error("    ## Error creating resources from source KML: " + e.getMessage());
                result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
            }
        }
        else result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"File or ID was not submitted. Please post your form with a file, and id\" }", HttpStatus.BAD_REQUEST);

        logger.info("    Create layers from KML completed. Response: " + result.getStatusCode().name());
        logger.debug(" >> processKML()");
        return result;
    }
}
