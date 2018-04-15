package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Menu extends Tool
{
	public Menu() {}

	protected Menu( Menu menu ) {
		super( menu );
	}

	public String getType() 
	{
		return Tool.Type.menu.toString();
	}

	public String getTitle() {
		return "Menu";
	}

	public Menu clone()
	{
		Menu clone = new Menu( this );

		return clone;
	}
}
