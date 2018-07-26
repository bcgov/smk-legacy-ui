package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Minimap extends Tool
{
    private static final long serialVersionUID = -6174751714538415677L;

    private String baseMap;

	public Minimap() {}

	public Minimap( Minimap minimap ) {
		super( minimap );
		this.baseMap = minimap.getBaseMap();
	}

	@Override
	public String getType() {
		return Tool.Type.MINIMAP.toString();
	}

	@Override
	public String getTitle() {
		return "Mini Map";
	}

	@Override
    public String getDescription() {
        return "Select the base map for the mini map.";
    }

    @Override
    public boolean isConfigured() {
        return true;
    }

    @Override
    public boolean equals( Object other ) {
        return super.equals(other);
    }
    
	public String getBaseMap() { return baseMap; }
	public void setBaseMap( String baseMap ) { this.baseMap = baseMap; }
}
