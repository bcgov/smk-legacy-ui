package ca.bc.gov.app.smks.service;

import java.util.ArrayList;
import java.util.List;

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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import ca.bc.gov.app.smks.dao.CouchDAO;
import ca.bc.gov.app.smks.model.MapConfigInfo;
import ca.bc.gov.app.smks.model.MapConfiguration;

@CrossOrigin
@RestController
@RequestMapping("/MapConfigurations")
@PropertySource("classpath:application.properties")
public class MapConfigController
{
	private static Log logger = LogFactory.getLog(MapConfigController.class);

	@Autowired
	private CouchDAO couchDAO;

	@RequestMapping(value = "/", method = RequestMethod.POST)
	@ResponseBody
	public ResponseEntity<?> createMapConfig(@RequestBody MapConfiguration request)
	{
		logger.debug(" >> createMapConfig()");
		ResponseEntity<?> result = null;

		try
		{
			logger.debug("    Creating new Map Configuration...");

			if(request.getName() == null) throw new Exception("The SMK ID is null. This is a required field");
			if(request.getName().length() == 0) throw new Exception("The SMK ID is empty. Please fill in a valid field");

			if(request.getLmfId() == null) request.setLmfId(request.getName().toLowerCase().replaceAll(" ", "-"));
			if(request.getLmfId().length() == 0) request.setLmfId(request.getName().toLowerCase().replaceAll(" ", "-"));

			request.setLmfRevision(1);

			// validate the ID, in case it's already in use.
			MapConfiguration existingDocID = couchDAO.getMapConfiguration(request.getLmfId());

			if(existingDocID != null) throw new Exception("The SMK ID is already in use. For creating new documents, ensure the ID is unique. If you are attempting to update an existing Map Configuration, please hit the following endpoint: {PUT}/MapConfigurations/{id}");

			// we have a revision of 1 and a valid lmf ID, so create the document

			couchDAO.createResource(request);
			logger.debug("    Success!");
			result = new ResponseEntity<String>("{ \"status\": \"Success\", \"couchId\": \"" + request.getId() + "\", \"lmfId\": \"" + request.getLmfId() + "\" }", HttpStatus.CREATED);
		}
		catch (Exception e)
		{
			logger.error("    ## Error creating Map Configuration resources " + e.getMessage());
			result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
		}

		logger.info("    Create New Map Configuration completed. Response: " + result.getStatusCode().name());
		logger.debug(" << createMapConfig()");
		return result;
	}

	@RequestMapping(value = "/", method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<?> getAllMapConfigs()
	{
		logger.debug(" >> getAllMapConfigs()");
		ResponseEntity<?> result = null;

		try
		{
			logger.debug("    Querying for all Map Resources...");
			List<MapConfiguration> resources = couchDAO.getAllConfigs();
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
		logger.debug(" << getAllMapConfigs()");
		return result;
	}

	@RequestMapping(value = "/{id}", method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<?> getMapConfig(@PathVariable String id, @RequestParam(value="version", required=false) String version)
	{
		logger.debug(" >> getMapConfig()");
		ResponseEntity<?> result = null;

		try
		{
			logger.debug("    Fetching Map Configuration " + id);
			MapConfiguration resource = null;
			if(version != null && version.length() > 0)
			{
				logger.debug("    Getting version " + version);
				resource = couchDAO.getMapConfiguration(id, Integer.parseInt(version));
			}
			else
			{
				logger.debug("    Getting current version");
				resource = couchDAO.getMapConfiguration(id);
			}

			if(resource != null)
			{
				logger.debug("    Success!");
				result = new ResponseEntity<MapConfiguration>(resource, HttpStatus.OK);
			}
			else throw new Exception("Map Config not found for ID " + id + " and version " + version + " does not exist");
		}
		catch (Exception e)
		{
			logger.error("    ## Error querying Map Configuration resource " + id + ": " + e.getMessage());
			result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
		}

		logger.info("    Get Map Configuration completed. Response: " + result.getStatusCode().name());
		logger.debug(" << getMapConfig()");
		return result;
	}

	@RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
	@ResponseBody
	public ResponseEntity<?> deleteMapConfig(@PathVariable String id, @RequestParam(value="version", required=false) String version)
	{
		logger.debug(" >> deleteMapConfig()");
		ResponseEntity<?> result = null;

		try
		{
			logger.debug("    Deleting a Map Configuration...");

			// If we have a published version, cancel the delete and warn about un-publishing first
			MapConfiguration published = couchDAO.getPublishedConfig(id);
			if(published != null) throw new Exception("The Map Configuration has a published version. Please Un-Publish the configuration first via the {DELETE} /MapConfigurations/Published/{id} endpoint before deleting a configuration archive. ");
			else // nothing is published, so lets go forward with the delete process
			{
				// Should we be deleting just the requested config (may be many versions!) or all of the versions?

				// delete only the specified version
				if(version != null && version.length() > 0)
				{
					logger.debug("    Getting version " + version);
					MapConfiguration resource = couchDAO.getMapConfiguration(id, Integer.parseInt(version));

					if(resource != null)
					{
						logger.debug("    Deleting Map Configuration " + id + " version " + version);
						couchDAO.removeResource(resource);
						logger.debug("    Success!");
						result = new ResponseEntity<String>("{ \"status\": \"Success!\" }", HttpStatus.OK);
					}
					else throw new Exception("Map Config not found for ID " + id + " and version " + version + " does not exist");
				}
				// delete everything!
				else
				{
					logger.debug("    Deleting all versions");

					List<MapConfiguration> resources = couchDAO.getAllMapConfigurationVersions(id);
					for(MapConfiguration config : resources)
					{
						couchDAO.removeResource(config);
					}
					result = new ResponseEntity<String>("{ \"status\": \"Success!\" }", HttpStatus.OK);
				}
			}
		}
		catch (Exception e)
		{
			logger.error("    ## Error deleting map configuration: " + e.getMessage());
			result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
		}

		logger.info("    Delete Map Configuration completed. Response: " + result.getStatusCode().name());
		logger.debug(" << deleteMapConfig()");
		return result;
	}

	@RequestMapping(value = "/{id}", method = RequestMethod.PUT)
	@ResponseBody
	public ResponseEntity<?> updateMapConfig(@PathVariable String id, @RequestBody MapConfiguration request)
	{
		logger.debug(" >> updateMapConfig()");
		ResponseEntity<?> result = null;

		try
		{
			logger.debug("    Updating a Map Configuration...");

			if(request.isPublished()) throw new Exception("You cannot update the currently published Map Configuration. Please update the editable version.");

			couchDAO.updateResource(request);
			result = new ResponseEntity<String>("{ \"status\": \"Success!\" }", HttpStatus.OK);
		}
		catch (Exception e)
		{
			logger.error("    ## Error Updating Map Configuration: " + e.getMessage());
			result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
		}

		logger.info("    Update Map Configuration Completed. Response: " + result.getStatusCode().name());
		logger.debug(" << updateMapConfig()");
		return result;
	}

	@RequestMapping(value = "/{config_id}/Attachments", headers=("content-type=multipart/form-data"), method = RequestMethod.POST)
	@ResponseBody
	public ResponseEntity<?> createAttachment(@PathVariable String config_id, @RequestParam("file") MultipartFile request, @RequestParam("id") String id)
	{
		logger.debug(" >> createAttachment()");
		ResponseEntity<?> result = null;

		if(!request.isEmpty() && id != null && id.length() != 0)
		{
			try
			{
				logger.debug("    Creating new Attachment...");

				MapConfiguration resource = couchDAO.getMapConfiguration(config_id);

				if(resource != null)
				{
					Attachment attachment = new Attachment(id, Base64.encodeBase64String(request.getBytes()), request.getContentType());
				    resource.addInlineAttachment(attachment);

				    couchDAO.updateResource(resource);

				    logger.debug("    Success!");
				    result = new ResponseEntity<String>("{ \"status\": \"Success!\" }", HttpStatus.OK);
				}
				else throw new Exception("Map Configuration ID not found.");
			}
			catch (Exception e)
			{
				logger.error("    ## Error fetching all attachment resource: " + e.getMessage());
				result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
			}
		}
		else result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"File or ID was not submitted. Please post your form with a file, and id\" }", HttpStatus.BAD_REQUEST);

		logger.info("    Create New Attachment completed. Response: " + result.getStatusCode().name());
		logger.debug(" >> createAttachment()");
		return result;
	}

	@RequestMapping(value = "/{config_id}/Attachments", method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<?> getAllAttachments(@PathVariable String config_id)
	{
		logger.debug(" >> getAllAttachments()");
		ResponseEntity<?> result = null;

		try
		{
			logger.debug("    Fetching all Attachments...");

			MapConfiguration resource = couchDAO.getMapConfiguration(config_id);

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
		logger.debug(" << getAllAttachments()");
		return result;
	}

	@RequestMapping(value = "/{config_id}/Attachments/{attachment_id}", method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<?> getAttachment(@PathVariable String config_id, @PathVariable String attachment_id)
	{
		logger.debug(" >> getAttachment()");
		ResponseEntity<?> result = null;

		try
		{
			logger.debug("    Fetching an Attachment...");

			MapConfiguration resource = couchDAO.getMapConfiguration(config_id);

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

	@RequestMapping(value = "/{config_id}/Attachments/{attachment_id}", method = RequestMethod.DELETE)
	@ResponseBody
	public ResponseEntity<?> deleteAttachment(@PathVariable String config_id, @PathVariable String attachment_id)
	{
		logger.debug(" >> deleteAttachment()");
		ResponseEntity<?> result = null;

		try
		{
			logger.debug("    Deleting a Map Configuration Attachment...");
			MapConfiguration resource = couchDAO.getMapConfiguration(config_id);

			if(resource != null)
			{
				if(attachment_id != null && attachment_id.length() > 0 && resource.getAttachments().containsKey(attachment_id))
				{
					couchDAO.deleteAttachment(resource, attachment_id);
					logger.debug("    Success!");
					result = new ResponseEntity<String>("{ status: \"Success!\" }", HttpStatus.OK);
				}
				else throw new Exception("Attachment ID not found.");
			}
			else throw new Exception("Map Configuration ID not found.");
		}
		catch (Exception e)
		{
			logger.error("    ## Error deleting attachment: " + e.getMessage());
			result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
		}

		logger.info("    Delete Attachment completed. Response: " + result.getStatusCode().name());
		logger.debug(" << deleteAttachment()");
		return result;
	}

	@RequestMapping(value = "/{config_id}/Attachments/{attachment_id}", headers=("content-type=multipart/form-data"), method = RequestMethod.POST)
	@ResponseBody
	public ResponseEntity<?> updateAttachment(@PathVariable String config_id, @PathVariable String attachment_id, @RequestParam("file") MultipartFile request)
	{
		logger.debug(" >> updateAttachment()");
		ResponseEntity<?> result = null;

		if(!request.isEmpty())
		{
			try
			{
				logger.debug("    Updating Attachment " + attachment_id + "...");

				MapConfiguration resource = couchDAO.getMapConfiguration(config_id);

				if(resource != null)
				{
					couchDAO.deleteAttachment(resource, attachment_id);

					// fetch the updated resource, so we're not out of date
					resource = couchDAO.getResourceByDocId(config_id);

					Attachment attachment = new Attachment(attachment_id, Base64.encodeBase64String(request.getBytes()), request.getContentType());
					resource.addInlineAttachment(attachment);

					couchDAO.updateResource(resource);

				    logger.debug("    Success!");
				    result = new ResponseEntity<String>("{ status: \"Success!\" }", HttpStatus.OK);
				}
				else throw new Exception("Map Configuration ID not found.");
			}
			catch (Exception e)
			{
				logger.error("    ## Error fetching all attachment resource: " + e.getMessage());
				result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }", HttpStatus.BAD_REQUEST);
			}
		}
		else result = new ResponseEntity<String>("{ \"status\": \"ERROR\", \"message\": \"File or ID was not submitted. Please post your form with a file, and id\" }", HttpStatus.BAD_REQUEST);

		logger.info("    Update Attachment completed. Response: " + result.getStatusCode().name());
		logger.debug(" << updateAttachment()");
		return result;
	}
}
