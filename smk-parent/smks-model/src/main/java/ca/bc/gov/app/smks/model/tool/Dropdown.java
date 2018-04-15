package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Dropdown extends Tool
{
	public Dropdown() {}

	protected Dropdown( Dropdown dropdown ) {
		super( dropdown );
	}

	public String getType() 
	{
		return Tool.Type.dropdown.toString();
	}

	public String getTitle() {
		return "Dropdown";
	}

	public Dropdown clone()
	{
		Dropdown clone = new Dropdown( this );

		return clone;
	}
}
