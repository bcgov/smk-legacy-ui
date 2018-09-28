package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Toolbar extends Tool
{
    private static final long serialVersionUID = 6029976604620602622L;

    public Toolbar() 
    {
        this.setDescription("Toolbar");
        this.setType(Tool.Type.TOOLBAR.toString());
    }

    public Toolbar( Toolbar toolbar ) {
        super( toolbar );
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
