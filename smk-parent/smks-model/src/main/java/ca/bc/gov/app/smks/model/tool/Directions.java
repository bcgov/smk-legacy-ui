package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

import com.fasterxml.jackson.annotation.JsonIgnore;

@JsonInclude(Include.NON_NULL)
public class Directions extends Tool
{
	public Directions() {}

	protected Directions( Directions about ) {
		super( about );
	}

	public String getType() {
		return Tool.Type.directions.toString();
	}

	public String getTitle() {
		return "Directions";
	}

	public Directions clone()
	{
		Directions clone = new Directions( this );

		return clone;
	}

}
