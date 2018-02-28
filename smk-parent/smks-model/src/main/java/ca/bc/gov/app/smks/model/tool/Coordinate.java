package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

import com.fasterxml.jackson.annotation.JsonIgnore;

@JsonInclude(Include.NON_NULL)
public class Coordinate extends Tool
{
	public Coordinate() {}

	protected Coordinate( Coordinate about ) {
		super( about );
	}

	public String getType() {
		return Tool.Type.coordinate.toString();
	}

	public String getTitle() {
		return "Coordinate";
	}

	public Coordinate clone()
	{
		Coordinate clone = new Coordinate( this );

		return clone;
	}

}
