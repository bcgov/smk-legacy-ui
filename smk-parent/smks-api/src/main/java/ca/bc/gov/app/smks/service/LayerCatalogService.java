package ca.bc.gov.app.smks.service;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.PropertySource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import ca.bc.gov.app.smks.SMKException;
import ca.bc.gov.app.smks.converter.DocumentConverterFactory;
import ca.bc.gov.app.smks.dao.LayerCatalogDAO;
import ca.bc.gov.app.smks.model.Layer;
import ca.bc.gov.app.smks.model.MPCMInfoLayer;
import ca.bc.gov.app.smks.model.WMSInfoLayer;

@CrossOrigin
@RestController
@RequestMapping("/LayerLibrary")
@PropertySource("classpath:application.properties")
public class LayerCatalogService 
{
	private static Log logger = LogFactory.getLog(LayerCatalogService.class);	

	@Autowired
    private ObjectMapper jsonObjectMapper;
	
    private static final String SUCCESS = "    Success!";
    
	@Autowired
	private LayerCatalogDAO layerCatalogDao;
	
	@GetMapping(value = "/wms/")
	@ResponseBody
	public ResponseEntity<JsonNode> getWmsConfigurations(@RequestParam(value="url", required=true) String url) throws IOException 
	{
		logger.debug(" >> getWmsConfigurations()");
		ResponseEntity<JsonNode> result = null;
		
		logger.debug("    Starting Get WMS Layer from provided URL...");
		
		if(url != null && url.length() > 0)
		{
			try 
			{
				List<WMSInfoLayer> layers = layerCatalogDao.createWmsLayers(url);
				logger.debug("    Successfully fetched WMS Layers");
				result = new ResponseEntity<JsonNode>(jsonObjectMapper.convertValue(layers, JsonNode.class), HttpStatus.OK);
			}
			catch (MalformedURLException e) 
			{
				logger.error("    ## Error querying WMS Server. URL is invalid: " + e.getMessage());
				result = handleError(e);
			}
			catch (Exception e) 
			{
				logger.error("    ## Error querying WMS Server: " + e.getMessage());
				result = handleError(e);
			}
		}
		else
		{
			result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue("{ \"status\": \"ERROR\", \"message\": \"URL is invalid\" }", JsonNode.class), HttpStatus.BAD_REQUEST);
		}
		
		logger.info("    Get WMS Layers completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getWmsConfigurations()");
		return result;
	}
	
	@GetMapping(value = "/wms/{id}")
	@ResponseBody
	public ResponseEntity<JsonNode> getWmsLayer(@PathVariable String id) throws IOException 
	{
		logger.debug(" >> getWmsLayer()");
		ResponseEntity<JsonNode> result = null;
		
		logger.debug("    Starting Get WMS Layer from DataBC GeoServer fetch...");
		
		if(id != null && id.length() > 0)
		{
			try 
			{
				WMSInfoLayer layer = layerCatalogDao.createWmsLayer(id);
				logger.debug("    Successfully fetched WMS Layer");
				result = new ResponseEntity<JsonNode>(jsonObjectMapper.convertValue(layer, JsonNode.class), HttpStatus.OK);
			}
			catch (MalformedURLException e) 
			{
				logger.error("    ## Error querying WMS GeoServer. URL is invalid: " + e.getMessage());
				result = handleError(e);
			}
			catch (Exception e) 
			{
				logger.error("    ## Error querying WMS layer: " + e.getMessage());
				result = handleError(e);
			}
		}
		else
		{
			result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue("{ \"status\": \"ERROR\", \"message\": \"ID is invalid\" }", JsonNode.class), HttpStatus.BAD_REQUEST);
		}
		
		logger.info("    Get WMS Layer completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getWmsLayer()");
		return result;
	}
	
	@GetMapping(value = "/")
	@ResponseBody
	public ResponseEntity<JsonNode> getLayers() throws IOException 
	{
		logger.debug(" >> getLayers()");
		ResponseEntity<JsonNode> result = null;
		
		try
		{
			logger.debug("    Starting Get All Layers from MPCM fetch...");
			List<MPCMInfoLayer> layers = layerCatalogDao.createMpcmLayers();
			logger.debug("    Successfully fetched all MPCM catalog Layers");
			result = new ResponseEntity<JsonNode>(jsonObjectMapper.convertValue(layers, JsonNode.class), HttpStatus.OK);
		}
		catch (Exception e) 
		{
			logger.error("    ## Error querying WMS layer: " + e.getMessage());
			result = handleError(e);
		}
		
		logger.info("    Get Layers completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getLayers()");
		return result;
	}
	
	@GetMapping(value = "/{id}")
	@ResponseBody
	public ResponseEntity<JsonNode> getLayer(@PathVariable String id) throws IOException 
	{
		logger.debug(" >> getLayer()");
		ResponseEntity<JsonNode> result = null;
		
		logger.debug("    Starting Get Layer from MPCM fetch...");
		
		if(id != null && id.length() > 0)
		{
			try 
			{
				Layer layer = layerCatalogDao.createCatalogLayer(id);
				logger.debug("    Successfully fetched MPCM Catalog Layer");
				result = new ResponseEntity<JsonNode>(jsonObjectMapper.convertValue(layer, JsonNode.class), HttpStatus.OK);
			} 
			catch (MalformedURLException e) 
			{
				logger.error("    ## Error querying MPCM layer. REST service URL is invalid: " + e.getMessage());
				result = handleError(e);
			}
			catch (Exception e) 
			{
				logger.error("    ## Error querying MPCM layer: " + e.getMessage());
				result = handleError(e);
			}
		}
		else
		{
			result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue("{ \"status\": \"ERROR\", \"message\": \"ID is invalid\" }", JsonNode.class), HttpStatus.BAD_REQUEST);
		}
		
		logger.info("    Get Layer completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getLayer()");
		return result;
	}
	
    @GetMapping(value = "/ImageToBase64")
    @ResponseBody
    public ResponseEntity<JsonNode> getImageAsBase64(@RequestParam("url") String imageUrl) throws IOException
    {
        logger.debug(" >> getImageAsBase64()");
        ResponseEntity<JsonNode> result = null;

        try
        {
            logger.debug("    Fetching image Base64 String from " + imageUrl);
            
            String base64 = DocumentConverterFactory.getImageBase64StringFromUrl(imageUrl);
            
            result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue("{ \"image\": \"" + base64 + "\"}", JsonNode.class), HttpStatus.OK);
        }
        catch (Exception e)
        {
            logger.error("    ## Error parsing KML file: " + e.getMessage());
            result = handleError(e);
        }

        logger.info("    Building image Base64 complete. Response: " + result.getStatusCode().name());
        logger.debug(" << getImageAsBase64()");
        return result;
    }
    
    @PostMapping(value = "/ProcessKML", headers=("content-type=multipart/form-data"))
    @ResponseBody
    public ResponseEntity<JsonNode> processKML(@RequestParam("file") MultipartFile request) throws IOException
    {
        logger.debug(" >> processKML()");
        ResponseEntity<JsonNode> result = null;

        if(!request.isEmpty())
        {
            try
            {
                logger.debug("    Processing KML/KMZ data...");

                byte[] docBytes = request.getBytes();                
                String contentType = request.getContentType();
                JsonNode resultingJson = null;
                
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
                    throw new SMKException("Valid GEOJson could not be generated from this KML");
                }
                else
                {
                    logger.debug(SUCCESS);
                    result = new ResponseEntity<JsonNode>(resultingJson, HttpStatus.OK);
                }
            }
            catch (Exception e)
            {
                logger.error("    ## Error creating resources from source KML: " + e.getMessage());
                result = handleError(e);
            }
        }
        else result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue("{ \"status\": \"ERROR\", \"message\": \"File or ID was not submitted. Please post your form with a file, and id\" }", JsonNode.class), HttpStatus.BAD_REQUEST);

        logger.info("    Create layers from KML completed. Response: " + result.getStatusCode().name());
        logger.debug(" >> processKML()");
        return result;
    }
    
    private ResponseEntity<JsonNode> handleError(Exception e) throws IOException
    {
        return new ResponseEntity<JsonNode>(getErrorMessageAsJson(e), HttpStatus.BAD_REQUEST);
    }
    
    private JsonNode getErrorMessageAsJson(Exception e) throws IOException
    {
        return jsonObjectMapper.readValue(("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }").replaceAll("\\r\\n|\\r|\\n", " "), JsonNode.class);
    }
}
