package ca.bc.gov.databc.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.databc.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Pan extends Tool
{
	public Pan() {}

	protected Pan( Pan about ) {
		super( about );
	}

	public String getId() {
		return Tool.Type.pan.toString();
	}

	public Pan clone()
	{
		Pan clone = new Pan( this );

		return clone;
	}

}
