package ca.bc.gov.databc.smk.beans;

import java.io.IOException;

import javax.faces.component.UIComponent;
import javax.faces.context.FacesContext;
import javax.faces.convert.Converter;
import javax.faces.convert.FacesConverter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import ca.bc.gov.databc.smks.model.Tool;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

// @FacesConverter( value = "toolConverter" )
public class ToolConverter implements Converter {

	private static Log logger = LogFactory.getLog(ToolConverter.class);

    private ObjectMapper mapper;

    public ToolConverter() {
        // logger.debug("created");
        mapper = new ObjectMapper();
    }

    @Override
    public Object getAsObject(FacesContext context, UIComponent component, String value) {
        try {
            logger.debug("get obj "+value);

            return mapper.readValue( value, Tool.class );
        }
        catch (IOException e) {
            logger.debug(e);
            return null;
        }
    }

    @Override
    public String getAsString(FacesContext context, UIComponent component, Object value) {
        // logger.debug(value);
        if ( !( value instanceof Tool ) ) return "";

        try {
            String json = mapper.writeValueAsString(value);
            logger.debug(value + " get string "+json);
            return json;
        }
        catch (JsonProcessingException e) {
            logger.debug(e);
            return "";
        }
    }
}