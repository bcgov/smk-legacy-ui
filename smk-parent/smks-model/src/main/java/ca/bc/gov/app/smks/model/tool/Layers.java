package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonIgnore;

import ca.bc.gov.app.smks.model.Tool;

import com.fasterxml.jackson.annotation.JsonIgnore;

@JsonInclude(Include.NON_NULL)
public class Layers extends Tool
{
	public Layers() {}

	protected Layers( Layers about ) {
		super( about );
	}

	public String getType() {
		return Tool.Type.layers.toString();
	}

	public String getTitle() {
		return "Layers Panel";
	}

	public Layers clone()
	{
		Layers clone = new Layers( this );

		return clone;
	}

}
