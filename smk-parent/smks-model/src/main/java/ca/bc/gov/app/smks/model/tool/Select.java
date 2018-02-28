package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

import com.fasterxml.jackson.annotation.JsonIgnore;

@JsonInclude(Include.NON_NULL)
public class Select extends Tool
{
	public Select() {}

	protected Select( Select about ) {
		super( about );
	}

	public String getType() {
		return Tool.Type.select.toString();
	}

	public String getTitle() {
		return "Selection Panel";
	}

	public Select clone()
	{
		Select clone = new Select( this );

		return clone;
	}

}
