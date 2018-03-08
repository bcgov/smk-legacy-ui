package ca.bc.gov.databc.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonIgnore;

import ca.bc.gov.databc.smks.model.Tool;

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
