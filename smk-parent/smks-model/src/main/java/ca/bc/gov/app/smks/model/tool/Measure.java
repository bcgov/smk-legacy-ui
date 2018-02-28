package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

import com.fasterxml.jackson.annotation.JsonIgnore;

@JsonInclude(Include.NON_NULL)
public class Measure extends Tool
{
	public Measure() {}

	protected Measure( Measure about ) {
		super( about );
	}

	public String getType() {
		return Tool.Type.measure.toString();
	}

	public String getTitle() {
		return "Measurement";
	}

	public Measure clone()
	{
		Measure clone = new Measure( this );

		return clone;
	}

}
