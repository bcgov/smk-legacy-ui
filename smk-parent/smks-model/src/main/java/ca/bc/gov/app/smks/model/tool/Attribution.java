package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Attribution extends Tool
{
    private static final long serialVersionUID = -6835502853352254285L;

    public Attribution() 
    {
        // empty constructor
    }

	public Attribution( Attribution attr ) {
		super( attr );
	}

	@Override
	public String getType() {
		return Tool.Type.ATTRIBUTION.toString();
	}

	@Override
	public String getTitle() {
		return "Attribution";
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
