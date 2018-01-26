package ca.bc.gov.databc.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.databc.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Sidebar extends Tool
{
    private String initialOpen;

	public Sidebar() {}

	protected Sidebar( Sidebar sidebar ) {
		super( sidebar );
		this.setInitialOpen( sidebar.getInitialOpen());
	}

	public String getId() {
		return Tool.Type.sidebar.toString();
	}
	
	public String getInitialOpen() { return initialOpen; }
	public void setInitialOpen(String initialOpen) { this.initialOpen = initialOpen; }

	public Sidebar clone()
	{
		Sidebar clone = new Sidebar( this );

		return clone;
	}
}
