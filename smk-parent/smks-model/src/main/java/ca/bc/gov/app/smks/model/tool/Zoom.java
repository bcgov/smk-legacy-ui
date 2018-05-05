package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Zoom extends Tool
{
    private boolean mouseWheel = true;
    private boolean doubleClick = true;
    private boolean box = true;
    private boolean control = true;

	public Zoom() {}

	protected Zoom( Zoom zoom ) {
		super( zoom );
		this.setBox( zoom.getBox());
		this.setControl( zoom.getControl());
		this.setDoubleClick( zoom.getDoubleClick());
		this.setMouseWheel( zoom.getMouseWheel());
	}

	public String getTitle() {
		return "Zooming";
	}

	public String getType() {
		return Tool.Type.zoom.toString();
	}

    public String getDescription() {
        return "Zooming options for the viewer.";
    }

    public boolean isConfigured() {
        return true;
    }

	public boolean getMouseWheel() { return mouseWheel; }
	public void setMouseWheel(boolean mouseWheel) { this.mouseWheel = mouseWheel; }

	public boolean getDoubleClick() { return doubleClick; }
	public void setDoubleClick(boolean doubleClick) { this.doubleClick = doubleClick; }

	public boolean getBox() { return box; }
	public void setBox(boolean box) { this.box = box; }

	public boolean getControl() { return control; }
	public void setControl(boolean control) { this.control = control; }

	public Zoom clone()
	{
		Zoom clone = new Zoom( this );

		return clone;
	}

}
