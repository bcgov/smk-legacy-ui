package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Layers extends Tool
{
    private static final long serialVersionUID = -4283508441394064225L;

    public Layers() 
    {
        // empty constructor
    }

    public Layers( Layers layers ) {
		super( layers );
	}

	@Override
	public String getType() {
		return Tool.Type.LAYERS.toString();
	}

	@Override
	public String getTitle() {
		return "Layers Panel";
	}
	
    @Override
    public boolean equals( Object other ) {
        return super.equals(other);
    }
}
