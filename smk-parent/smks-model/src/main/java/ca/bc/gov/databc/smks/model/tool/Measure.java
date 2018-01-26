package ca.bc.gov.databc.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.databc.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Measure extends Tool
{
	public Measure() {}

	protected Measure( Measure about ) {
		super( about );
	}

	public String getId() {
		return Tool.Type.measure.toString();
	}

	public Measure clone()
	{
		Measure clone = new Measure( this );

		return clone;
	}

}
