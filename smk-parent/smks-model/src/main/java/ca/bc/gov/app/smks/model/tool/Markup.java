package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Markup extends Tool
{
    private static final long serialVersionUID = 8087942532656040075L;

    public Markup() 
	{
	    setTitle("Markup");
	    this.setDescription("Markup Tools");
	    this.setType(Tool.Type.MARKUP.toString());
	}

    public Markup( Markup markup ) {
		super( markup );
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
