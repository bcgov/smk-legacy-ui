package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonIgnore;

import ca.bc.gov.app.smks.model.Tool;

import com.fasterxml.jackson.annotation.JsonIgnore;

@JsonInclude(Include.NON_NULL)
public class Markup extends Tool
{
	public Markup() {}

	protected Markup( Markup about ) {
		super( about );
	}

	public String getType() {
		return Tool.Type.markup.toString();
	}

	public String getTitle() {
		return "Markup";
	}

	public Markup clone()
	{
		Markup clone = new Markup( this );

		return clone;
	}

}
