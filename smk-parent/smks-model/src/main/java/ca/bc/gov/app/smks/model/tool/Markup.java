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
	    // empty constructor
	}

    public Markup( Markup markup ) {
		super( markup );
	}

	@Override
	public String getType() {
		return Tool.Type.MARKUP.toString();
	}

	@Override
	public String getTitle() {
		return "Markup";
	}

    @Override
    public boolean equals( Object other ) {
        return super.equals(other);
    }
}
