package ca.bc.gov.databc.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonIgnore;

import ca.bc.gov.databc.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Minimap extends Tool
{
    private String baseMap;

	public Minimap() {}

	protected Minimap( Minimap about ) {
		super( about );
	}

	public String getType() {
		return Tool.Type.minimap.toString();
	}

	public String getTitle() {
		return "Mini Map";
	}

    public String getDescription() {
        return "Select the base map for the mini map.";
    }

    public boolean isConfigured() {
        return true;
    }

	public String getBaseMap() { return baseMap; }
	public void setBaseMap( String baseMap ) { this.baseMap = baseMap; }

	public Minimap clone()
	{
		Minimap clone = new Minimap( this );

		return clone;
	}

}
