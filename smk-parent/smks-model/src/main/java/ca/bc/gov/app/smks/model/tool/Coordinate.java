package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Coordinate extends Tool
{
    private static final long serialVersionUID = 3621757210040610392L;

    public Coordinate() 
    {
        this.setTitle("Coordinate");
        this.setDescription("Coordinate Tool");
        this.setType(Tool.Type.COORDINATE.toString());
    }

    public Coordinate( Coordinate coordinate ) {
		super( coordinate );
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
