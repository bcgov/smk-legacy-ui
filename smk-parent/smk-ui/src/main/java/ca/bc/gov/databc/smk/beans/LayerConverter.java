package ca.bc.gov.databc.smk.beans;

import java.io.IOException;

import javax.faces.component.UIComponent;
import javax.faces.context.FacesContext;
import javax.faces.convert.Converter;
import javax.faces.convert.FacesConverter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import ca.bc.gov.databc.smks.model.WMSInfoLayer;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.commons.codec.binary.Base64;

// @FacesConverter( value = "toolConverter" )
public class LayerConverter implements Converter {

	private static Log logger = LogFactory.getLog(LayerConverter.class);

    private ObjectMapper mapper;

    public LayerConverter() {
        // logger.debug("created");
        mapper = new ObjectMapper();
    }

    @Override
    public Object getAsObject(FacesContext context, UIComponent component, String value) {
        try {
            byte[] dec = Base64.decodeBase64( value );

            WMSInfoLayer info = (WMSInfoLayer)mapper.readValue( dec, WMSInfoLayer.class );
            // logger.debug("get obj " + mapper.writeValueAsString(info));

            return info;
        }
        catch (IOException e) {
            logger.debug(e);
            return null;
        }
    }

    @Override
    public String getAsString(FacesContext context, UIComponent component, Object value) {
        // logger.debug(value);
        if ( !( value instanceof WMSInfoLayer ) ) return "";

        try {
            String json = mapper.writeValueAsString(value);
            // logger.debug(value + " get string "+json);
            return Base64.encodeBase64String( json.getBytes() );
        }
        catch (JsonProcessingException e) {
            logger.debug(e);
            return "";
        }
    }
}