package ca.bc.gov.databc.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.databc.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Markup extends Tool
{
	public Markup() {}

	protected Markup( Markup about ) {
		super( about );
	}

	public String getId() {
		return Tool.Type.markup.toString();
	}

	public Markup clone()
	{
		Markup clone = new Markup( this );

		return clone;
	}

}
