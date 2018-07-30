package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Pan extends Tool
{
    private static final long serialVersionUID = 2596068091296209558L;

    public Pan() 
    {
        this.setTitle("Panning");
        this.setDescription("Panning Tool");
        this.setType(Tool.Type.PAN.toString());
    }

    public Pan( Pan pan ) {
		super( pan );
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
