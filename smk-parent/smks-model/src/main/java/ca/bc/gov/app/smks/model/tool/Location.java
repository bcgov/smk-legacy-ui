package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Location extends Tool
{
    public Location() {}

    protected Location( Location location ) {
        super( location );
    }

    public String getType() 
    {
        return Tool.Type.location.toString();
    }

    public String getTitle() {
        return "Location";
    }

    public Location clone()
    {
        Location clone = new Location( this );

        return clone;
    }
}
