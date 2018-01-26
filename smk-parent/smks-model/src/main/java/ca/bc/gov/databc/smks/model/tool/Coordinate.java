package ca.bc.gov.databc.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.databc.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Coordinate extends Tool
{
	public Coordinate() {}

	protected Coordinate( Coordinate about ) {
		super( about );
	}

	public String getId() {
		return Tool.Type.coordinate.toString();
	}

	public Coordinate clone()
	{
		Coordinate clone = new Coordinate( this );

		return clone;
	}

}
