package ca.bc.gov.databc.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonIgnore;

import ca.bc.gov.databc.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Identify extends Tool
{
	public Identify() {}

	protected Identify( Identify about ) {
		super( about );
	}

	public String getType() {
		return Tool.Type.identify.toString();
	}

	public String getTitle() {
		return "Identify Panel";
	}

	public Identify clone()
	{
		Identify clone = new Identify( this );

		return clone;
	}

}
