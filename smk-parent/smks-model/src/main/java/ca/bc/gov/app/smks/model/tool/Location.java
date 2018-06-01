package ca.bc.gov.app.smks.model.tool;

import ca.bc.gov.app.smks.model.Tool;

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