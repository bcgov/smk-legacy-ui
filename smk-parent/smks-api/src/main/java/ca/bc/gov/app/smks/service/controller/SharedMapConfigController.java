package ca.bc.gov.app.smks.service.controller;

import java.io.IOException;

import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.ektorp.AttachmentInputStream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import ca.bc.gov.app.smks.SMKException;
import ca.bc.gov.app.smks.dao.CouchDAO;
import ca.bc.gov.app.smks.model.MapConfiguration;

public class SharedMapConfigController
{
    private static Log logger = LogFactory.getLog(SharedMapConfigController.class);
    
    private static final String MAP_CONFIG_NOT_FOUND_MSG = "Map Configuration ID not found.";
    private static final String SUCCESS = "    Success!";
    
    @Autowired
    private CouchDAO couchDAO;

    @Autowired
    private ObjectMapper jsonObjectMapper;
    
    public SharedMapConfigController()
    {
        // empty constructor
    }
    
    public ResponseEntity<JsonNode> handleError(Exception e) throws IOException
    {
        return new ResponseEntity<JsonNode>(getErrorMessageAsJson(e), HttpStatus.BAD_REQUEST);
    }
    
    public JsonNode getErrorMessageAsJson(Exception e) throws IOException
    {
        return jsonObjectMapper.readValue(("{ \"status\": \"ERROR\", \"message\": \"" + e.getMessage() + "\" }").replaceAll("\\r\\n|\\r|\\n", " "), JsonNode.class);
    }
    
    public ResponseEntity<byte[]> handleGetAttachment(MapConfiguration resource, String attachmentId) throws SMKException, IOException
    {
        logger.debug("    Fetching an Attachment...");

        if(resource == null) throw new SMKException(MAP_CONFIG_NOT_FOUND_MSG);
            
        AttachmentInputStream attachment = couchDAO.getAttachment(resource, attachmentId);
        
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
        
        return new ResponseEntity<byte[]>(media, httpHeaders, HttpStatus.OK);
    }
}
