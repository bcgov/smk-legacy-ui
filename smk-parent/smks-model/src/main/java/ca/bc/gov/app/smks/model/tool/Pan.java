package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

import com.fasterxml.jackson.annotation.JsonIgnore;

@JsonInclude(Include.NON_NULL)
public class Pan extends Tool
{
	public Pan() {}

	protected Pan( Pan about ) {
		super( about );
	}

	public String getType() {
		return Tool.Type.pan.toString();
	}

	public String getTitle() {
		return "Panning";
	}

	public Pan clone()
	{
		Pan clone = new Pan( this );

		return clone;
	}

}
