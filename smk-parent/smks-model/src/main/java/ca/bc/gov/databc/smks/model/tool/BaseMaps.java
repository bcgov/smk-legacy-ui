package ca.bc.gov.databc.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.databc.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class BaseMaps extends Tool
{
	public BaseMaps() {}

	protected BaseMaps( BaseMaps about ) {
		super( about );
	}

	public String getId() {
		return Tool.Type.baseMaps.toString();
	}

	public BaseMaps clone()
	{
		BaseMaps clone = new BaseMaps( this );

		return clone;
	}

}
