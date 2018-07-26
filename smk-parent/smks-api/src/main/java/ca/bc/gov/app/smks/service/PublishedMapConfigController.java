package ca.bc.gov.app.smks.service;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.ektorp.Attachment;
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

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import ca.bc.gov.app.smks.SMKException;
import ca.bc.gov.app.smks.dao.CouchDAO;
import ca.bc.gov.app.smks.model.MapConfigInfo;
import ca.bc.gov.app.smks.model.MapConfiguration;
import net.lingala.zip4j.core.ZipFile;
import net.lingala.zip4j.exception.ZipException;
import net.lingala.zip4j.model.ZipParameters;

@CrossOrigin
@RestController
@RequestMapping("/MapConfigurations")
@PropertySource("classpath:application.properties")
public class PublishedMapConfigController 
{
	private static Log logger = LogFactory.getLog(PublishedMapConfigController.class);

	@Autowired
    private ObjectMapper jsonObjectMapper;
	
    private static final String SUCCESS = "    Success!";
    private static final String ERR_MESSAGE = "{ \"status\": \"ERROR\", \"message\": \"";
    private static final String SUCCESS_MESSAGE = "{ \"status\": \"Success!\" }";
	    
	@Autowired
	private CouchDAO couchDAO;

	@GetMapping(value = "/Published")
	@ResponseBody
	public ResponseEntity<JsonNode> getAllPublishedMapConfigs() throws JsonParseException, JsonMappingException, IOException
	{
		logger.debug(" >> getAllPublishedMapConfigs()");
		ResponseEntity<JsonNode> result = null;

		try
		{
			logger.debug("    Querying for all published Map Resources...");
			List<MapConfiguration> resources = couchDAO.getPublishedConfigs();
			logger.debug("    Success, found " + resources.size() + " results");

			ArrayList<MapConfigInfo> configSnippets = new ArrayList<MapConfigInfo>();
			for(MapConfiguration config : resources)
			{
				configSnippets.add(new MapConfigInfo(config));
			}

			result = new ResponseEntity<JsonNode>(jsonObjectMapper.convertValue(configSnippets, JsonNode.class), HttpStatus.OK);
		}
		catch (Exception e)
		{
			logger.error("    ## Error querying Map Config Resources: " + e.getMessage());
			result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue(ERR_MESSAGE + e.getMessage() + "\" }", JsonNode.class), HttpStatus.BAD_REQUEST);
		}

		logger.info("    Get All Map Configurations completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getAllPublishedMapConfigs()");
		return result;
	}

	@PostMapping(value = "/Published/{id}")
	@ResponseBody
	public ResponseEntity<JsonNode> publishMapConfig(@PathVariable String id) throws JsonParseException, JsonMappingException, IOException
	{
		logger.debug(" >> publishMapConfig()");
		ResponseEntity<JsonNode> result = null;

		try
		{
			logger.debug("    Publishing Map Configuration " + id + "...");

			MapConfiguration resource = couchDAO.getMapConfiguration(id);

			if(resource != null)
			{
				if(resource.isPublished()) throw new SMKException("The latest version of this map configuration has already been published");

				// clone the document, and create a new version for the edit state. You can't edit published documents
				MapConfiguration clone = new MapConfiguration(resource);
				clone.setLmfRevision(resource.getLmfRevision() + 1);
				clone.setPublished(false);

				// clone the attachments

				if(resource.getAttachments() != null && resource.getAttachments().size() > 0)
				{
					for(String key : resource.getAttachments().keySet())
					{
						// get the attachment byte stream
						AttachmentInputStream attachmentStream = couchDAO.getAttachment(resource, key);
						byte[] media = IOUtils.toByteArray(attachmentStream);

						// clone it and add it to the new doc
						Attachment clonedAttachment = new Attachment(attachmentStream.getId(), Base64.encodeBase64String(media), attachmentStream.getContentType());

						clone.addInlineAttachment(clonedAttachment);
					}

				}

				// "un" publish the previous version, if it exists
				MapConfiguration existinPublishedResource = couchDAO.getPublishedConfig(id);
				if(existinPublishedResource != null)
				{
					existinPublishedResource.setPublished(false);
					couchDAO.updateResource(existinPublishedResource);
				}
				
				// set the publish flag on the current resource commit
				resource.setPublished(true);
				couchDAO.updateResource(resource);
				// create the cloned new editable version
				couchDAO.createResource(clone);

				logger.debug(SUCCESS);
				result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue("{ \"status:\" \"Success\", \"id\": \"" + id + "\" }", JsonNode.class), HttpStatus.CREATED);
			}
			else throw new SMKException("Map Configuration ID not found.");
		}
		catch (Exception e)
		{
			logger.error("    ## Error publishing Map Configuration resources " + e.getMessage());
			result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue(ERR_MESSAGE + e.getMessage() + "\" }", JsonNode.class), HttpStatus.BAD_REQUEST);
		}

		logger.info("   Published Map Configuration completed. Response: " + result.getStatusCode().name());
		logger.debug(" << publishMapConfig()");
		return result;
	}

	@GetMapping(value = "/Published/{id}")
	@ResponseBody
	public ResponseEntity<JsonNode> getPublishedMapConfig(@PathVariable String id) throws JsonParseException, JsonMappingException, IOException
	{
		logger.debug(" >> getPublishedMapConfig()");
		ResponseEntity<JsonNode> result = null;

		try
		{
			logger.debug("    Fetching a published Map Configuration...");
			MapConfiguration resource = couchDAO.getPublishedConfig(id);

			if(resource != null)
			{
				logger.debug(SUCCESS);
				result = new ResponseEntity<JsonNode>(jsonObjectMapper.convertValue(resource, JsonNode.class), HttpStatus.OK);
			}
			else throw new SMKException("Map Configuration ID not found.");
		}
		catch (Exception e)
		{
			logger.error("    ## Error fetching map configuration: " + e.getMessage());
			result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue(ERR_MESSAGE + e.getMessage() + "\" }", JsonNode.class), HttpStatus.BAD_REQUEST);
		}

		logger.info("    Fetch published Map Configuration completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getPublishedMapConfig()");
		return result;
	}

	@DeleteMapping(value = "/Published/{id}")
	@ResponseBody
	public ResponseEntity<JsonNode> deletePublishedMapConfig(@PathVariable String id) throws JsonParseException, JsonMappingException, IOException
	{
		logger.debug(" >> deletePublishedMapConfig()");
		ResponseEntity<JsonNode> result = null;

		try
		{
			logger.debug("    Un-publishing a published Map Configuration...");
			MapConfiguration resource = couchDAO.getPublishedConfig(id);

			if(resource != null)
			{
				// we don't actually delete a map configuration that's been published
				// instead, we just set it to un-published. It can be deleted the old fashioned way.
				resource.setPublished(false);
				couchDAO.updateResource(resource);

				logger.debug(SUCCESS);
				result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue(SUCCESS_MESSAGE, JsonNode.class), HttpStatus.OK);
			}
			else throw new SMKException("Map Configuration ID not found.");
		}
		catch (Exception e)
		{
			logger.error("    ## Error un publishing map configuration: " + e.getMessage());
			result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue(ERR_MESSAGE + e.getMessage() + "\" }", JsonNode.class), HttpStatus.BAD_REQUEST);
		}

		logger.info("    Delete/Un-Publish published Map Configuration completed. Response: " + result.getStatusCode().name());
		logger.debug(" << deletePublishedMapConfig()");
		return result;
	}

	@GetMapping(value = "/Published/{config_id}/Attachments/")
	@ResponseBody
	public ResponseEntity<JsonNode> getAllPublishedAttachments(@PathVariable String config_id) throws JsonParseException, JsonMappingException, IOException
	{
		logger.debug(" >> getAllPublishedAttachments()");
		ResponseEntity<JsonNode> result = null;

		try
		{
			logger.debug("    Fetching all Published Attachments for " + config_id + "...");

			MapConfiguration resource = couchDAO.getPublishedConfig(config_id);

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
			else throw new SMKException("Map Configuration ID not found.");
		}
		catch (Exception e)
		{
			logger.error("    ## Error fetching all attachment resource: " + e.getMessage());
			result = new ResponseEntity<JsonNode>(jsonObjectMapper.readValue(ERR_MESSAGE + e.getMessage() + "\" }", JsonNode.class), HttpStatus.BAD_REQUEST);
		}

		logger.info("    Get All Attachments completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getAllPublishedAttachments()");
		return result;
	}

	@GetMapping(value = "/Published/{config_id}/Attachments/{attachment_id}")
	@ResponseBody
	public ResponseEntity<byte[]> getPublishedAttachment(@PathVariable String config_id, @PathVariable String attachment_id)
	{
		logger.debug(" >> getAttachment()");
		ResponseEntity<byte[]> result = null;

		try
		{
			logger.debug("    Fetching an Attachment...");

			MapConfiguration resource = couchDAO.getPublishedConfig(config_id);

			if(resource != null)
			{
				AttachmentInputStream attachment = couchDAO.getAttachment(resource, attachment_id);
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
			else throw new SMKException("Map Configuration ID not found.");
		}
		catch (Exception e)
		{
			logger.error("    ## Error fetching attachment resource: " + e.getMessage());
			result = new ResponseEntity<byte[]>((ERR_MESSAGE + e.getMessage() + "\" }").getBytes(), HttpStatus.BAD_REQUEST);
		}

		logger.info("    Get Attachment completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getAttachment()");
		return result;
	}
	
	// application exporting
	
	private final static String EXPORT_ATTACHMENT_NAME = "export";
	// Fetch the exported version of this publish. If it doesn't exist yet, create the export
	@GetMapping(value = "/Published/{id}/Export/")
	@ResponseBody
	public ResponseEntity<byte[]> getMapConfigExport(@PathVariable String id)
	{
		logger.debug(" >> getMapConfigExport()");
		ResponseEntity<byte[]> result = null;

		try
		{
			logger.debug("    Fetching a published Map Configuration...");
			MapConfiguration resource = couchDAO.getPublishedConfig(id);

			if(resource != null)
			{
				logger.debug(SUCCESS);
				AttachmentInputStream attachment = null;
				// check if the attachment for export exists. If it does, return it. If it doesn't, create a new one
				try
				{
					logger.debug("    Load export attachment");
					attachment = couchDAO.getAttachment(resource, EXPORT_ATTACHMENT_NAME);
					
					if(attachment == null) throw new SMKException("Attachment Not Found");
				}
				catch(Exception e)
				{
				    attachment = createExportFile(resource, id);
				}
				
				if(attachment != null)
				{
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
				else throw new SMKException("Export not found and could not be created.");
			}
			else throw new SMKException("Map Configuration ID not found.");
		}
		catch (Exception e)
		{
			logger.error("    ## Error fetching map configuration: " + e.getMessage());
			result = new ResponseEntity<byte[]>((ERR_MESSAGE + e.getMessage() + "\" }").getBytes(), HttpStatus.BAD_REQUEST);
		}

		logger.info("    Fetch published Map Configuration completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getMapConfigExport()");
		return result;
	}
	
	private AttachmentInputStream createExportFile(MapConfiguration resource, String id) throws SMKException, IOException, ZipException
	{
        // Failed to fetch export
	    AttachmentInputStream result = null;
	    
        logger.debug("    No export exists. Generation new export attachment...");
        
        //copy template into temp
        ClassLoader classLoader = getClass().getClassLoader();
        File tempExportZip = new File(classLoader.getResource("smk-client.war").getFile());
        InputStream targetStream = new FileInputStream(tempExportZip);
        
        String tempLocationPath = System.getProperty("java.io.tmpdir"); 
        if(!tempLocationPath.endsWith(File.separator)) tempLocationPath += File.separator;
        tempLocationPath += UUID.randomUUID() + File.separator;
        
        File tempPath = new File(tempLocationPath);
        tempPath.mkdirs();
        
        File exportTemplateZip = new File(tempLocationPath + "export.war");
        if(!exportTemplateZip.createNewFile())
        {
            logger.debug("    Failed to create temp export file...");
        }
        logger.debug("    Copying zip to temp file '" + exportTemplateZip.getName() + "'...");
        FileOutputStream os = new FileOutputStream(exportTemplateZip);
        IOUtils.copy(targetStream, os);
        
        os.close();
        os = null;
        targetStream.close();
        targetStream = null;
        
        //copy config json and all attachments into template temp
        ZipParameters params = new ZipParameters();
        ZipFile zipFile = new ZipFile(exportTemplateZip);
        
        // create config json
        ObjectMapper jsonObjectMapper = new ObjectMapper();
        File mapConfigTempFile = new File(tempLocationPath + "map-config.json");
        if(!mapConfigTempFile.createNewFile())
        {
            logger.debug("    Failed to create temp config file...");
        }
        jsonObjectMapper.writeValue(mapConfigTempFile, resource);
        
        zipFile.addFile(mapConfigTempFile, params);
        
        String smkConfigDocumentNames = mapConfigTempFile.getName() + ",";
        // copy all attachments
        if(resource.getAttachments() != null)
        {
            File tempAttchPath = new File(tempLocationPath + "attachments" + File.separator);
            tempAttchPath.mkdirs();
            ArrayList<File> tempFiles = new ArrayList<File>();
            
            for(String key : resource.getAttachments().keySet())
            {
                AttachmentInputStream attch = couchDAO.getAttachment(resource, key);
                byte[] data = IOUtils.toByteArray(attch);
                
                if(data != null)
                {
                    InputStream dataStream = new ByteArrayInputStream(data);

                    String contentType = attch.getContentType();
                    String postfix = "";
                    
                    if(contentType.equals("image/gif")) postfix = "gif";
                    else if(contentType.equals("image/jpg")) postfix = "jpg";
                    else if(contentType.equals("image/jpeg")) postfix = "jpg";
                    else if(contentType.equals("image/bmp")) postfix = "bmp";
                    else if(contentType.equals("image/png")) postfix = "png";
                    else if(contentType.equals("application/vnd.google-earth.kml+xml")) postfix = "kml";
                    else postfix = "json";
                    
                    File attachmentFile = new File(tempAttchPath.getPath() + File.separator + key + "." + postfix);
                    if(!attachmentFile.createNewFile())
                    {
                        logger.debug("    Failed to create attachment temp file...");
                    }

                    tempFiles.add(attachmentFile);
                    
                    FileOutputStream attchFileStream = new FileOutputStream(attachmentFile);
                    IOUtils.copy(dataStream, attchFileStream);
                    
                    dataStream.close();
                    dataStream = null;
                    attchFileStream.close();
                    attchFileStream = null;
                    
                    smkConfigDocumentNames += attachmentFile.getName() + ",";
                }
            }
            
            zipFile.addFolder(tempAttchPath.getPath(), params);
            
            //delete temp files
            for(File file : tempFiles)
            {
                if(!file.delete())
                {
                    logger.debug("    Failed to delete temp file...");
                }
            }
            //delete temp folder
            Files.delete(tempAttchPath.toPath());
        }
        // trim out the trailing comma, if we have attachments
        if(smkConfigDocumentNames.length() > 0 && smkConfigDocumentNames.endsWith(",")) smkConfigDocumentNames = smkConfigDocumentNames.substring(0, smkConfigDocumentNames.length() - 1);

        // done creating temp zip,
        
        InputStream exportStream = null;
        File exportableZip = null;
        
        try
        {
            exportableZip = zipFile.getFile();
            exportStream = new FileInputStream(exportableZip);
            
            //add zip to published document as an attachment file called "export"
            resource = couchDAO.getPublishedConfig(id);
            Attachment newAttachment = new Attachment(EXPORT_ATTACHMENT_NAME, Base64.encodeBase64String(IOUtils.toByteArray(exportStream)), "application/octet-stream");
            resource.addInlineAttachment(newAttachment);

            // Commit the changes and reload the resource and the attachment, then submit the export file back to the caller
            couchDAO.updateResource(resource);
            resource = couchDAO.getPublishedConfig(id);
            
            result = couchDAO.getAttachment(resource, EXPORT_ATTACHMENT_NAME);
        }
        catch(Exception ex)
        {
            logger.error("    ## Error building export zip file: " + ex.getMessage());
            throw new SMKException("Export not found and could not be created.", ex);
        }
        finally
        {
            // finish cleanup
            exportStream.close();
            exportStream = null;
            zipFile = null;
            //indexHtml.delete();
            if(!exportTemplateZip.delete())
            {
                logger.debug("    Failed to delete export template zip file...");
            }
            
            if(!mapConfigTempFile.delete())
            {
                logger.debug("    Failed to delete temp map config file...");
            }
            
            if(!exportableZip.delete())
            {
                logger.debug("    Failed to delete export zip file...");
            }
            
            if(!tempPath.delete())
            {
                logger.debug("    Failed to delete temp paths...");
            }
            
            tempPath = null;   
        }
        
        return result;
	}
}
