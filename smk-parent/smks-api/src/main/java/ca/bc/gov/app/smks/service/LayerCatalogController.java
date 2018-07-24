package ca.bc.gov.app.smks.service;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Base64;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import ca.bc.gov.app.smks.dao.LayerCatalogDAO;
import ca.bc.gov.app.smks.model.Layer;
import ca.bc.gov.app.smks.model.MPCMInfoLayer;
import ca.bc.gov.app.smks.model.MapConfiguration;
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
            
            // get content type
            URL url = new URL(imageUrl);
            HttpURLConnection connection = (HttpURLConnection)  url.openConnection();
            connection.setRequestMethod("HEAD");
            connection.connect();
            String contentType = connection.getContentType();
            
            BufferedInputStream bis = new BufferedInputStream(url.openConnection().getInputStream());
            
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            byte[] buffer = new byte[1024];
            int read = 0;
            
            while ((read = bis.read(buffer, 0, buffer.length)) != -1) 
            {
                baos.write(buffer, 0, read);
            }
            baos.flush();
            
            result = new ResponseEntity<String>("{ \"image\": \"data:" + contentType + ";base64," + Base64.getEncoder().encodeToString(baos.toByteArray()) + "\"}", HttpStatus.OK);
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
}
