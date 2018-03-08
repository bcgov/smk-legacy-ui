package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonIgnore;

import ca.bc.gov.app.smks.model.Tool;

import com.fasterxml.jackson.annotation.JsonIgnore;

@JsonInclude(Include.NON_NULL)
public class Attribution extends Tool
{
	public Attribution() {}

	protected Attribution( Attribution about ) {
		super( about );
	}

	public String getType() {
		return Tool.Type.attribution.toString();
	}

	public String getTitle() {
		return "Attribution";
	}

	public Attribution clone()
	{
		Attribution clone = new Attribution( this );

		return clone;
	}

}
