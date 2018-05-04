package ca.bc.gov.app.smks.service;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.FileAttribute;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;

import ca.bc.gov.app.smks.dao.CouchDAO;
import ca.bc.gov.app.smks.model.MapConfigInfo;
import ca.bc.gov.app.smks.model.MapConfiguration;
import net.lingala.zip4j.core.ZipFile;
import net.lingala.zip4j.model.ZipParameters;

@CrossOrigin
@RestController
@RequestMapping("/MapConfigurations")
@PropertySource("classpath:application.properties")
public class PublishedMapConfigController 
{
	private static Log logger = LogFactory.getLog(PublishedMapConfigController.class);

	@Autowired
	private CouchDAO couchDAO;

	@RequestMapping(value = "/Published", method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<?> getAllPublishedMapConfigs()
	{
		logger.debug(" >> getAllPublishedMapConfigs()");
		ResponseEntity<?> result = null;

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

			result = new ResponseEntity<ArrayList<MapConfigInfo>>(configSnippets, HttpStatus.OK);
		}
		catch (Exception e)
		{
			logger.error("    ## Error querying Map Config Resources: " + e.getMessage());
			result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
		}

		logger.info("    Get All Map Configurations completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getAllPublishedMapConfigs()");
		return result;
	}

	@RequestMapping(value = "/Published/{id}", method = RequestMethod.POST)
	@ResponseBody
	public ResponseEntity<?> publishMapConfig(@PathVariable String id)
	{
		logger.debug(" >> publishMapConfig()");
		ResponseEntity<?> result = null;

		try
		{
			logger.debug("    Publishing Map Configuration " + id + "...");

			MapConfiguration resource = couchDAO.getMapConfiguration(id);

			if(resource != null)
			{
				if(resource.isPublished()) throw new Exception("The latest version of this map configuration has already been published");

				// clone the document, and create a new version for the edit state. You can't edit published documents
				MapConfiguration clone = resource.clone();
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

				logger.debug("    Success!");
				result = new ResponseEntity<String>("{ \"status:\" \"Success\", \"id\": \"" + id + "\" }", HttpStatus.CREATED);
			}
			else throw new Exception("Map Configuration ID not found.");
		}
		catch (Exception e)
		{
			logger.error("    ## Error publishing Map Configuration resources " + e.getMessage());
			result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
		}

		logger.info("   Published Map Configuration completed. Response: " + result.getStatusCode().name());
		logger.debug(" << publishMapConfig()");
		return result;
	}

	@RequestMapping(value = "/Published/{id}", method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<?> getPublishedMapConfig(@PathVariable String id)
	{
		logger.debug(" >> getPublishedMapConfig()");
		ResponseEntity<?> result = null;

		try
		{
			logger.debug("    Fetching a published Map Configuration...");
			MapConfiguration resource = couchDAO.getPublishedConfig(id);

			if(resource != null)
			{
				logger.debug("    Success!");
				result = new ResponseEntity<MapConfiguration>(resource, HttpStatus.OK);
			}
			else throw new Exception("Map Configuration ID not found.");
		}
		catch (Exception e)
		{
			logger.error("    ## Error fetching map configuration: " + e.getMessage());
			result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
		}

		logger.info("    Fetch published Map Configuration completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getPublishedMapConfig()");
		return result;
	}

	@RequestMapping(value = "/Published/{id}", method = RequestMethod.DELETE)
	@ResponseBody
	public ResponseEntity<?> deletePublishedMapConfig(@PathVariable String id)
	{
		logger.debug(" >> deletePublishedMapConfig()");
		ResponseEntity<?> result = null;

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

				logger.debug("    Success!");
				result = new ResponseEntity<String>("{ \"status\": \"Success!\" }", HttpStatus.OK);
			}
			else throw new Exception("Map Configuration ID not found.");
		}
		catch (Exception e)
		{
			logger.error("    ## Error un publishing map configuration: " + e.getMessage());
			result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
		}

		logger.info("    Delete/Un-Publish published Map Configuration completed. Response: " + result.getStatusCode().name());
		logger.debug(" << deletePublishedMapConfig()");
		return result;
	}

	@RequestMapping(value = "/Published/{config_id}/Attachments/", method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<?> getAllPublishedAttachments(@PathVariable String config_id)
	{
		logger.debug(" >> getAllPublishedAttachments()");
		ResponseEntity<?> result = null;

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

				logger.debug("    Success!");
				result = new ResponseEntity<ArrayList<String>>(attachments, HttpStatus.OK);
			}
			else throw new Exception("Map Configuration ID not found.");
		}
		catch (Exception e)
		{
			logger.error("    ## Error fetching all attachment resource: " + e.getMessage());
			result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
		}

		logger.info("    Get All Attachments completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getAllPublishedAttachments()");
		return result;
	}

	@RequestMapping(value = "/Published/{config_id}/Attachments/{attachment_id}", method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<?> getPublishedAttachment(@PathVariable String config_id, @PathVariable String attachment_id)
	{
		logger.debug(" >> getAttachment()");
		ResponseEntity<?> result = null;

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

				logger.debug("    Success!");
				result = new ResponseEntity<byte[]>(media, httpHeaders, HttpStatus.OK);
			}
			else throw new Exception("Map Configuration ID not found.");
		}
		catch (Exception e)
		{
			logger.error("    ## Error fetching attachment resource: " + e.getMessage());
			result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
		}

		logger.info("    Get Attachment completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getAttachment()");
		return result;
	}
	
	// application exporting
	
	private final static String EXPORT_ATTACHMENT_NAME = "export";
	// Fetch the exported version of this publish. If it doesn't exist yet, create the export
	@RequestMapping(value = "/Published/{id}/Export/", method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<?> getMapConfigExport(@PathVariable String id)
	{
		logger.debug(" >> getMapConfigExport()");
		ResponseEntity<?> result = null;

		try
		{
			logger.debug("    Fetching a published Map Configuration...");
			MapConfiguration resource = couchDAO.getPublishedConfig(id);

			if(resource != null)
			{
				logger.debug("    Success!");
				AttachmentInputStream attachment = null;
				// check if the attachment for export exists. If it does, return it. If it doesn't, create a new one
				try
				{
					logger.debug("    Load export attachment");
					attachment = couchDAO.getAttachment(resource, EXPORT_ATTACHMENT_NAME);
					
					if(attachment == null) throw new Exception("Attachment Not Found");
				}
				catch(Exception e)
				{
					//Failed to fetch export
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
					exportTemplateZip.createNewFile();
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
				    ObjectMapper mapper = new ObjectMapper();
				    File mapConfigTempFile = new File(tempLocationPath + "map_config.json");
				    mapConfigTempFile.createNewFile();
				    mapper.writeValue(mapConfigTempFile, resource);
				    String configString = mapper.writeValueAsString(resource);
				    
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
								attachmentFile.createNewFile();

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
					    	file.delete();
					    }
					    //delete temp folder
					    Files.delete(tempAttchPath.toPath());
				    }
				    // trim out the trailing comma, if we have attachments
				    if(smkConfigDocumentNames.length() > 0 && smkConfigDocumentNames.endsWith(",")) smkConfigDocumentNames = smkConfigDocumentNames.substring(0, smkConfigDocumentNames.length() - 1);
				    
				    // create index.html with refs to config and attachments, and insert
				    File indexHtml = new File(tempLocationPath + "index.html");
				    indexHtml.createNewFile();
				    
				    String indexCode = "<html><head><title>" + resource.getSurround().getTitle() + "</title></head><body><div id=\"smk-map-frame\"></div><script src=\"smk-bootstrap.js\" smk-standalone=\"true\">return " + configString + "</script></body></html>";
				    
				    PrintWriter out = new PrintWriter(indexHtml);
				    out.write(indexCode);
				    out.flush();
				    
				    zipFile.addFile(indexHtml, new ZipParameters());

				    out.close();
				    out = null;
				    
				    // done creating temp zip,
				    
				    File exportableZip = zipFile.getFile();
			        InputStream exportStream = new FileInputStream(exportableZip);
				    
					//add zip to published document as an attachment file called "export"
			        resource = couchDAO.getPublishedConfig(id);
					Attachment newAttachment = new Attachment(EXPORT_ATTACHMENT_NAME, Base64.encodeBase64String(IOUtils.toByteArray(exportStream)), "application/octet-stream");
				    resource.addInlineAttachment(newAttachment);

				    // Commit the changes and reload the resource and the attachment, then submit the export file back to the caller
				    couchDAO.updateResource(resource);
				    resource = couchDAO.getPublishedConfig(id);
				    
				    attachment = couchDAO.getAttachment(resource, EXPORT_ATTACHMENT_NAME);
				    
				    // finish cleanup
			        exportStream.close();
				    exportStream = null;
				    zipFile = null;
				    indexHtml.delete();
				    exportTemplateZip.delete();
				    mapConfigTempFile.delete();
				    exportableZip.delete();
				    tempPath.delete();
				    tempPath = null;
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

					logger.debug("    Success!");
					result = new ResponseEntity<byte[]>(media, httpHeaders, HttpStatus.OK);
				} 
				else throw new Exception("Export not found and could not be created.");
			}
			else throw new Exception("Map Configuration ID not found.");
		}
		catch (Exception e)
		{
			logger.error("    ## Error fetching map configuration: " + e.getMessage());
			result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
		}

		logger.info("    Fetch published Map Configuration completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getMapConfigExport()");
		return result;
	}
}
