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
        // empty constructor
    }

    public Coordinate( Coordinate about ) {
		super( about );
	}

	@Override
	public String getType() {
		return Tool.Type.COORDINATE.toString();
	}

	@Override
	public String getTitle() {
		return "Coordinate";
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
