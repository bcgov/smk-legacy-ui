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
        this.setTitle("Layers Panel");
        this.setDescription("Layers Panel");
        this.setType(Tool.Type.LAYERS.toString());
    }

    public Layers( Layers layers ) {
		super( layers );
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
