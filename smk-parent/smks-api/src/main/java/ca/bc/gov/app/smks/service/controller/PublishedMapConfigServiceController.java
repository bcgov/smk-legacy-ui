package ca.bc.gov.app.smks.service.controller;

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

import com.fasterxml.jackson.databind.ObjectMapper;

import ca.bc.gov.app.smks.SMKException;
import ca.bc.gov.app.smks.StaticContextAccessor;
import ca.bc.gov.app.smks.dao.CouchDAO;
import ca.bc.gov.app.smks.model.MapConfigInfo;
import ca.bc.gov.app.smks.model.MapConfiguration;
import net.lingala.zip4j.core.ZipFile;
import net.lingala.zip4j.exception.ZipException;
import net.lingala.zip4j.model.ZipParameters;

public class PublishedMapConfigServiceController
{
    private static Log logger = LogFactory.getLog(PublishedMapConfigServiceController.class);

    private static final String MAP_CONFIG_NOT_FOUND_MSG = "Map Configuration ID not found.";
    private static final String SUCCESS = "    Success!";
    private static final String EXPORT_ATTACHMENT_NAME = "export";
    
    public static CouchDAO couchDAO()
    {
        return StaticContextAccessor.getBean(CouchDAO.class);
    }
    
    public static ObjectMapper jsonObjectMapper()
    {
        return StaticContextAccessor.getBean(ObjectMapper.class);
    }
    
    public static List<MapConfigInfo> getAllPublishedMapConfigurationSnippets()
    {
        logger.debug("    Querying for all published Map Resources...");
        List<MapConfiguration> resources = getAllPublishedMapConfigurations();
        logger.debug("    Success, found " + resources.size() + " results");

        List<MapConfigInfo> configSnippets = new ArrayList<MapConfigInfo>();
        for(MapConfiguration config : resources)
        {
            configSnippets.add(new MapConfigInfo(config));
        }
        
        return configSnippets;
    }
    
    public static List<MapConfiguration> getAllPublishedMapConfigurations()
    {
        return couchDAO().getPublishedConfigs();
    }
    
    public static MapConfiguration getPublishedMapConfiguration(String id)
    {
        return couchDAO().getPublishedConfig(id);
    }
    
    public static void deletePublishedMapConfiguration(String id) throws SMKException
    {
        logger.debug("    Un-publishing a published Map Configuration...");
        MapConfiguration resource = couchDAO().getPublishedConfig(id);

        if(resource == null) throw new SMKException(MAP_CONFIG_NOT_FOUND_MSG);
        
        // we don't actually delete a map configuration that's been published
        // instead, we just set it to un-published. It can be deleted the old fashioned way.
        resource.setPublished(false);
        couchDAO().updateResource(resource);

        logger.debug(SUCCESS);
    }
    
    public static List<String> getPublishedMapConfigAttachmentSnippets(String configId) throws SMKException
    {
        logger.debug("    Fetching all Published Attachments for " + configId + "...");

        MapConfiguration resource = getPublishedMapConfiguration(configId);

        if(resource == null) throw new SMKException(MAP_CONFIG_NOT_FOUND_MSG);
        
        List<String> attachments = new ArrayList<String>();

        for(String key : resource.getAttachments().keySet())
        {
            Attachment attachment = resource.getAttachments().get(key);
            attachments.add("{ \"id\": \"" + key + "\", \"content-type\": \"" + attachment.getContentType() + "\", \"content-length\": \"" + attachment.getContentLength() + "\"  }");
        }

        logger.debug(SUCCESS);
        
        return attachments;
    }
    
    public static void publishMapConfiguration(String id) throws IOException, SMKException
    {
        logger.debug("    Publishing Map Configuration " + id + "...");
        
        MapConfiguration resource = couchDAO().getMapConfiguration(id);

        if(resource == null) throw new SMKException(MAP_CONFIG_NOT_FOUND_MSG);
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
                AttachmentInputStream attachmentStream = couchDAO().getAttachment(resource, key);
                byte[] media = IOUtils.toByteArray(attachmentStream);

                // clone it and add it to the new doc
                Attachment clonedAttachment = new Attachment(attachmentStream.getId(), Base64.encodeBase64String(media), attachmentStream.getContentType());

                clone.addInlineAttachment(clonedAttachment);
            }

        }

        // "un" publish the previous version, if it exists
        MapConfiguration existinPublishedResource = couchDAO().getPublishedConfig(id);
        if(existinPublishedResource != null)
        {
            existinPublishedResource.setPublished(false);
            couchDAO().updateResource(existinPublishedResource);
        }
        
        // set the publish flag on the current resource commit
        resource.setPublished(true);
        couchDAO().updateResource(resource);
        // create the cloned new editable version
        couchDAO().createResource(clone);

        logger.debug(SUCCESS);
    }
    
    public static AttachmentInputStream processConfigExport(String id) throws SMKException, IOException, ZipException
    {
        logger.debug("    Fetching a published Map Configuration...");
        MapConfiguration resource = couchDAO().getPublishedConfig(id);

        if(resource == null) throw new SMKException(MAP_CONFIG_NOT_FOUND_MSG);
        
        logger.debug(SUCCESS);
        AttachmentInputStream attachment = null;
        // check if the attachment for export exists. If it does, return it. If it doesn't, create a new one
        try
        {
            logger.debug("    Load export attachment");
            attachment = couchDAO().getAttachment(resource, EXPORT_ATTACHMENT_NAME);
            
            if(attachment == null) throw new SMKException("Attachment Not Found");
        }
        catch(Exception e)
        {
            attachment = createExportFile(resource, id);
        }

        logger.debug(SUCCESS);
        return attachment;
    }
    
    private static AttachmentInputStream createExportFile(MapConfiguration resource, String id) throws SMKException, IOException, ZipException
    {
        // Failed to fetch export
        AttachmentInputStream result = null;
        
        logger.debug("    No export exists. Generation new export attachment...");
        
        //copy template into temp
        ClassLoader classLoader = PublishedMapConfigServiceController.class.getClassLoader();
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
        File mapConfigTempFile = new File(tempLocationPath + "map-config.json");
        mapConfigTempFile.createNewFile();
        
        jsonObjectMapper().writeValue(mapConfigTempFile, resource);
        
        zipFile.addFile(mapConfigTempFile, params);
        
        String smkConfigDocumentNames = mapConfigTempFile.getName() + ",";
        
        // copy all attachments, if any exist
        if(resource.getAttachments() != null)
        {
            processExportAttachments(tempLocationPath, resource, smkConfigDocumentNames, zipFile, params);
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
            resource = couchDAO().getPublishedConfig(id);
            Attachment newAttachment = new Attachment(EXPORT_ATTACHMENT_NAME, Base64.encodeBase64String(IOUtils.toByteArray(exportStream)), "application/octet-stream");
            resource.addInlineAttachment(newAttachment);

            // Commit the changes and reload the resource and the attachment, then submit the export file back to the caller
            couchDAO().updateResource(resource);
            resource = couchDAO().getPublishedConfig(id);
            
            result = couchDAO().getAttachment(resource, EXPORT_ATTACHMENT_NAME);
        }
        catch(Exception ex)
        {
            logger.error("    ## Error building export zip file: " + ex.getMessage());
            throw new SMKException("Export not found and could not be created.", ex);
        }
        finally
        {
            // finish cleanup
            if(exportStream != null) exportStream.close();
            exportStream = null;
            zipFile = null;

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
    
    private static void processExportAttachments(String tempLocationPath, MapConfiguration resource, String smkConfigDocumentNames, ZipFile zipFile, ZipParameters params) throws IOException, ZipException
    {
        File tempAttchPath = new File(tempLocationPath + "attachments" + File.separator);
        tempAttchPath.mkdirs();
        ArrayList<File> tempFiles = new ArrayList<File>();
        
        for(String key : resource.getAttachments().keySet())
        {
            AttachmentInputStream attch = couchDAO().getAttachment(resource, key);
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
}
