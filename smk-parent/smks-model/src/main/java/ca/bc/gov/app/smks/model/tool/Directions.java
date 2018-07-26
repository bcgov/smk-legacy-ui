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
        // empty constructor
    }

    public Directions( Directions about ) {
		super( about );
	}

	@Override
	public String getType() {
		return Tool.Type.DIRECTIONS.toString();
	}

	@Override
	public String getTitle() {
		return "Directions";
	}

    @Override
    public boolean equals( Object other ) {
        return super.equals(other);
    }
}
