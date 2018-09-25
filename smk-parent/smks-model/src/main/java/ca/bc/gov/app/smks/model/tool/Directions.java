package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Directions extends Tool
{
    private static final long serialVersionUID = 8232404283249540256L;

    public Directions() 
    {
        this.setDescription("Directions tool");
        this.setType(Tool.Type.DIRECTIONS.toString());
    }

    public Directions( Directions directions ) {
		super( directions );
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
