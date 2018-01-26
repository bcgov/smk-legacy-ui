package ca.bc.gov.databc.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.databc.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Identify extends Tool
{
	public Identify() {}

	protected Identify( Identify about ) {
		super( about );
	}

	public String getId() {
		return Tool.Type.identify.toString();
	}

	public Identify clone()
	{
		Identify clone = new Identify( this );

		return clone;
	}

}
