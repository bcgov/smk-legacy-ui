package ca.bc.gov.app.smks.service.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.xml.parsers.ParserConfigurationException;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.ektorp.Attachment;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.TransformException;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import org.xml.sax.SAXException;

import com.fasterxml.jackson.core.JsonParser.Feature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import ca.bc.gov.app.smks.SMKException;
import ca.bc.gov.app.smks.StaticContextAccessor;
import ca.bc.gov.app.smks.converter.DocumentConverterFactory;
import ca.bc.gov.app.smks.converter.DocumentConverterFactory.DocumentType;
import ca.bc.gov.app.smks.dao.CouchDAO;
import ca.bc.gov.app.smks.model.Attribute;
import ca.bc.gov.app.smks.model.Layer;
import ca.bc.gov.app.smks.model.MapConfigInfo;
import ca.bc.gov.app.smks.model.MapConfiguration;
import ca.bc.gov.app.smks.model.layer.Vector;
import net.lingala.zip4j.exception.ZipException;

public class MapConfigServiceController
{
    private static Log logger = LogFactory.getLog(MapConfigServiceController.class);

    private static final String MAP_CONFIG_NOT_FOUND_MSG = "Map Configuration ID not found.";
    private static final String SUCCESS = "    Success!";
    private static final String SUCCESS_MESSAGE = "{ \"status\": \"Success!\" }";
    private static final String SHAPE = "shape";
    private static final String KML = "kml";
    private static final String KMZ = "kmz";
    private static final String VECTOR = "vector"; 
    private static final String DEFAULT_CONTENT_TYPE = "application/octet-stream";
    
    public static CouchDAO couchDAO()
    {
        return StaticContextAccessor.getBean(CouchDAO.class);
    }
    
    public static ObjectMapper jsonObjectMapper()
    {
        return StaticContextAccessor.getBean(ObjectMapper.class);
    }
    
    public static Environment env()
    {
        return StaticContextAccessor.getBean(Environment.class);
    }
    
    public static void createMapConfiguration(MapConfiguration request) throws SMKException
    {
        logger.debug("    Creating new Map Configuration...");

        if(request.getName() == null) throw new SMKException("The SMK ID is null. This is a required field");
        if(request.getName().length() == 0) throw new SMKException("The SMK ID is empty. Please fill in a valid field");

        request.setLmfId(request.getName().toLowerCase().replaceAll(" ", "-").replaceAll("[^A-Za-z0-9]", "-"));
        
        request.setLmfRevision(1);
        request.setVersion(env().getProperty("smk.version"));

        // validate the ID, in case it's already in use.
        MapConfiguration existingDocID = couchDAO().getMapConfiguration(request.getLmfId());

        if(existingDocID != null)
        {
            // replace ID with a random guid
            request.setLmfId(UUID.randomUUID().toString());
        }

        couchDAO().createResource(request);
        logger.debug(SUCCESS);
    }
    
    public static List<MapConfigInfo> getMapConfigSnippets()
    {
        logger.debug("    Querying for all Map Resources...");
        Map<String, String> resourceIds = couchDAO().getAllConfigs();
        logger.debug("    Success, found " + resourceIds.size() + " valid results");
        
        List<MapConfigInfo> configSnippets = new ArrayList<MapConfigInfo>();
        for(Map.Entry<String, String> entry : resourceIds.entrySet())
        {
            String key = entry.getKey();
            String value = entry.getValue();
            
            try
            {
                MapConfiguration config = couchDAO().getMapConfiguration(value);
                configSnippets.add(new MapConfigInfo(config));
            }
            catch(Exception e)
            {
                logger.debug("Map Configuration " + key + " could not be loaded because it was invalid");
                
                // Add an empty config snippet
                MapConfigInfo config = new MapConfigInfo();
                config.setId(key);
                config.setName(value);
                config.setRevision(0);
                config.setValid(false);
                
                configSnippets.add(config);
            }
        }
        
        return configSnippets;
    }
    
    public static MapConfiguration getMapConfiguration(String id, String version) throws SMKException
    {
        logger.debug("    Fetching Map Configuration " + id);
        MapConfiguration resource = null;
        if(version != null && version.length() > 0)
        {
            logger.debug("    Getting version " + version);
            resource = couchDAO().getMapConfiguration(id, Integer.parseInt(version));
        }
        else
        {
            logger.debug("    Getting current version");
            resource = couchDAO().getMapConfiguration(id);
        }

        if(resource == null) throw new SMKException("Map Config not found for ID " + id + " and version " + version + " does not exist");
        
        logger.debug(SUCCESS);
        return resource;
    }
    
    public static void deleteMapConfiguration(String id) throws SMKException
    {
        deleteMapConfiguration(id, null);
    }
    
    public static void deleteMapConfiguration(String id, String version) throws SMKException
    {
        logger.debug("    Deleting a Map Configuration...");
        // If we have a published version, cancel the delete and warn about un-publishing first
        MapConfiguration published = couchDAO().getPublishedConfig(id);
        if(published != null) throw new SMKException("The Map Configuration has a published version. Please Un-Publish the configuration first via the {DELETE} /MapConfigurations/Published/{id} endpoint before deleting a configuration archive. ");

        // Should we be deleting just the requested config (may be many versions!) or all of the versions?
        // delete only the specified version
        if(version != null && version.length() > 0)
        {
            logger.debug("    Getting version " + version);
            MapConfiguration resource = couchDAO().getMapConfiguration(id, Integer.parseInt(version));

            if(resource == null) throw new SMKException("Map Config not found for ID " + id + " and version " + version + " does not exist");
            
            logger.debug("    Deleting Map Configuration " + id + " version " + version);
            couchDAO().removeResource(resource);
            logger.debug(SUCCESS);
        }
        // delete everything!
        else
        {
            logger.debug("    Deleting all versions");

            List<MapConfiguration> resources = couchDAO().getAllMapConfigurationVersions(id);
            for(MapConfiguration config : resources)
            {
                couchDAO().removeResource(config);
            }
        }
    }
    
    public static void updateMapConfiguration(String id, MapConfiguration request) throws SMKException
    {
        logger.debug("    Updating a Map Configuration...");

        if(request.isPublished()) throw new SMKException("You cannot update the currently published Map Configuration. Please update the editable version.");
        
        MapConfiguration resource = couchDAO().getMapConfiguration(id);

         // find out if we're removing layers. If so, we may have to remove attachments as well
        boolean layerRemoved = false;
        for(Layer originalLayer : resource.getLayers())
        {
            if(originalLayer.getType().equals(VECTOR))
            {
                boolean exists = false;
                
                for(Layer layer : request.getLayers())
                {
                    if(layer.getId().equals(originalLayer.getId()))
                    {
                        exists = true;
                        break;
                    }
                }
                
                if(!exists)
                {
                    // remove attachment for this layer, it doesn't exist anymore.
                    deleteAttachment(id, originalLayer.getId());
                    layerRemoved = true;
                }
            }
        }
        
        // refresh, in case we've turfed any layer attachments
        if(layerRemoved) resource = couchDAO().getMapConfiguration(id);
        
        // Clone, to prevent removal of the attachments
        resource.setCreatedBy(request.getCreatedBy());
        resource.setId(request.getId());
        resource.setLayers(request.getLayers());
        resource.setLmfId(request.getLmfId());
        resource.setLmfRevision(request.getLmfRevision());
        resource.setName(request.getName());
        resource.setProject(request.getProject());
        resource.setPublished(request.isPublished());
        resource.setSurround(request.getSurround());
        resource.setTools(request.getTools());
        resource.setViewer(request.getViewer());
        resource.setVersion(request.getVersion());

        // Update!
        couchDAO().updateResource(resource);
    }
    
    public static void createAttachment(String configId, String id, byte[] docBytes, String contentType, String type) throws SMKException, SAXException, IOException, ParserConfigurationException, ZipException, FactoryException, TransformException
    {
        logger.debug("    Creating new Attachment...");

        MapConfiguration resource = couchDAO().getMapConfiguration(configId);

        if(resource == null) throw new SMKException(MAP_CONFIG_NOT_FOUND_MSG);

        if(contentType.equals("application/vnd.google-earth.kml+xml")) type = KML;
        else if(contentType.equals("application/vnd.google-earth.kmz")) type = KMZ;
        else if(contentType.equals("application/zip") || contentType.equals("application/x-zip-compressed")) type = SHAPE;
        
        createNewAttachmentResource(configId, id, docBytes, contentType, type, resource);
    }
    
    private static void createNewAttachmentResource(String configId, String id, byte[] docBytes, String contentType, String type, MapConfiguration resource) throws SAXException, IOException, ParserConfigurationException, ZipException, FactoryException, TransformException
    {
        // convert resource to geojson if it's a vector type
        if(type.equals(KML)) { type = VECTOR; docBytes = DocumentConverterFactory.convertDocument(docBytes, DocumentType.KML); contentType = DEFAULT_CONTENT_TYPE; }
        else if(type.equals(KMZ)) { type = VECTOR; docBytes = DocumentConverterFactory.convertDocument(docBytes, DocumentType.KMZ); contentType = DEFAULT_CONTENT_TYPE; }
        else if(type.equals(SHAPE)) { type = VECTOR; docBytes = DocumentConverterFactory.convertDocument(docBytes, DocumentType.SHAPE); contentType = DEFAULT_CONTENT_TYPE; }
        
        Attachment attachment = new Attachment(id, Base64.encodeBase64String(docBytes), contentType);
        resource.addInlineAttachment(attachment);
        
        // if this is a geojson blob, make sure we have verified the properties set
        if(type.equals(VECTOR))
        {
            processVectorAttributes(id, resource, docBytes);
        }

        MapConfiguration updatedResource = couchDAO().getMapConfiguration(configId);
        resource.setRevision(updatedResource.getRevision());
        couchDAO().updateResource(resource);

        logger.debug(SUCCESS);
    }
    
    private static void processVectorAttributes(String id, MapConfiguration resource, byte[] docBytes) throws IOException
    {
        Vector layer = (Vector)resource.getLayerByID(id);
        
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.configure(Feature.ALLOW_UNQUOTED_CONTROL_CHARS, true);
        
        JsonNode node = objectMapper.readValue(docBytes, JsonNode.class);

        List<String> fieldNames = new ArrayList<String>();
        
        for (final JsonNode featureNode : node.get("features")) 
        {
            JsonNode properties = featureNode.get("properties");

            for (Iterator<String> iter = properties.fieldNames(); iter.hasNext(); ) 
            {
                String fieldName = iter.next();
                
                if(!fieldName.equals("description") && !fieldNames.contains(fieldName))
                {
                    fieldNames.add(fieldName);
                }
            }
        }
        
        //clear the attribute list
        layer.getAttributes().clear();
        
        // add the new list
        for(String field : fieldNames)
        {
            Attribute attr = new Attribute();
            attr.setId(field);
            attr.setName(field);
            attr.setTitle(field.replace("-", " "));
            attr.setVisible(true);
            
            layer.getAttributes().add(attr);
        }
    }
    
    public static void deleteAttachment(String id, String attachmentId) throws SMKException
    {
        logger.debug("    Deleting a Map Configuration Attachment...");
        MapConfiguration resource = couchDAO().getMapConfiguration(id);

        if(resource == null) throw new SMKException(MAP_CONFIG_NOT_FOUND_MSG);
        if(attachmentId == null || attachmentId.length() == 0) throw new SMKException("Invalid Attachment ID");
        if(!resource.getAttachments().containsKey(attachmentId)) throw new SMKException("Attachment ID not found.");   

        couchDAO().deleteAttachment(resource, attachmentId);
        logger.debug(SUCCESS);
    }
    
    public static List<String> getAllAttachmentSnippets(String configId) throws SMKException
    {
        logger.debug("    Fetching all Attachments...");

        MapConfiguration resource = couchDAO().getMapConfiguration(configId);

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
    
    public static void updateAttachment(String configId, String attachmentId, byte[] request, String contentType) throws SMKException
    {
        logger.debug("    Updating Attachment " + attachmentId + "...");

        MapConfiguration resource = couchDAO().getMapConfiguration(configId);

        if(resource == null) throw new SMKException(MAP_CONFIG_NOT_FOUND_MSG);
        
        couchDAO().deleteAttachment(resource, attachmentId);

        // fetch the updated resource, so we're not out of date
        resource = couchDAO().getMapConfiguration(configId);

        Attachment attachment = new Attachment(attachmentId, Base64.encodeBase64String(request), contentType);
        resource.addInlineAttachment(attachment);

        couchDAO().updateResource(resource);

        logger.debug(SUCCESS);
    }
}
