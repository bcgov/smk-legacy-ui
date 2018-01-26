package ca.bc.gov.databc.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.databc.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Directions extends Tool
{
	public Directions() {}

	protected Directions( Directions about ) {
		super( about );
	}

	public String getId() {
		return Tool.Type.directions.toString();
	}

	public Directions clone()
	{
		Directions clone = new Directions( this );

		return clone;
	}

}
