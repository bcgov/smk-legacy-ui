package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Dropdown extends Tool
{
    private static final long serialVersionUID = -5375300580602552422L;

    public Dropdown() 
	{
	    // empty constructor
	}

    public Dropdown( Dropdown dropdown ) {
		super( dropdown );
	}

	@Override
	public String getType() 
	{
		return Tool.Type.DROPDOWN.toString();
	}

	@Override
	public String getTitle() {
		return "";
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
