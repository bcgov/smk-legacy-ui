package ca.bc.gov.databc.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonIgnore;

import ca.bc.gov.databc.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Scale extends Tool
{
    private boolean showFactor;
    private boolean showBar;

	public Scale() {}

	protected Scale( Scale scale ) {
		super( scale );
		this.setShowBar( scale.getShowBar());
		this.setShowFactor( scale.getShowFactor());
	}

	public String getType() {
		return Tool.Type.scale.toString();
	}

	public String getTitle() {
		return "Scale";
	}

    public String getDescription() {
        return "Scale options for the map.";
    }

    public boolean isConfigured() {
        return true;
    }

	public boolean getShowFactor() { return showFactor; }
	public void setShowFactor(boolean showFactor) { this.showFactor = showFactor; }

	public boolean getShowBar() { return showBar; }
	public void setShowBar(boolean showBar) { this.showBar = showBar; }

	public Scale clone()
	{
		Scale clone = new Scale( this );

		return clone;
	}
}
