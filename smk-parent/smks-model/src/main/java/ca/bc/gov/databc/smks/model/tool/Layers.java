package ca.bc.gov.databc.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.databc.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Layers extends Tool
{
	public Layers() {}

	protected Layers( Layers about ) {
		super( about );
	}

	public String getId() {
		return Tool.Type.layers.toString();
	}

	public Layers clone()
	{
		Layers clone = new Layers( this );

		return clone;
	}

}
