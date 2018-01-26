package ca.bc.gov.databc.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.databc.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Select extends Tool
{
	public Select() {}

	protected Select( Select about ) {
		super( about );
	}

	public String getId() {
		return Tool.Type.select.toString();
	}

	public Select clone()
	{
		Select clone = new Select( this );

		return clone;
	}

}
