package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Location extends Tool
{
    private static final long serialVersionUID = -4487798853622384925L;

    public Location() 
    {
        this.setDescription("Location tools");
        this.setType(Tool.Type.LOCATION.toString());
    }

    public Location( Location location ) {
        super( location );
    }

    @Override
    public boolean equals( Object other ) {
        return super.equals(other);
    }
    
    @Override
    public int hashCode() {
        return getType().hashCode();
    }
}
