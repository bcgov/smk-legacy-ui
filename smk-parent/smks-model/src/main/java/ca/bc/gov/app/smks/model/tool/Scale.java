package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Scale extends Tool
{
    private static final long serialVersionUID = -5716048422439174445L;

    private boolean showFactor = true;
    private boolean showBar = true;

	public Scale()
	{
	    this.setDescription("Scale options for the map.");
	    this.setType(Tool.Type.SCALE.toString());
	}

	public Scale( Scale scale ) 
	{
		super( scale );
		this.setShowBar( scale.getShowBar());
		this.setShowFactor( scale.getShowFactor());
	}
	
    @Override
    public boolean isConfigured() {
        return true;
    }

    @Override
    public boolean equals( Object other ) {
        return super.equals(other);
    }
    
    @Override
    public int hashCode() {
        return getType().hashCode();
    }
    
	public boolean getShowFactor() { return showFactor; }
	public void setShowFactor(boolean showFactor) { this.showFactor = showFactor; }

	public boolean getShowBar() { return showBar; }
	public void setShowBar(boolean showBar) { this.showBar = showBar; }
}
