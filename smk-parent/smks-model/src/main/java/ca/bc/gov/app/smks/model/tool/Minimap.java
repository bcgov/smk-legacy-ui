package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Minimap extends Tool
{
    private static final long serialVersionUID = -6174751714538415677L;

    private String baseMap;

	public Minimap() 
	{
	    this.setTitle("Mini Map");
	    this.setDescription("Select the base map for the mini map.");
	    this.setType(Tool.Type.MINIMAP.toString());
	}

	public Minimap( Minimap minimap ) {
		super( minimap );
		this.baseMap = minimap.getBaseMap();
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
    
	public String getBaseMap() { return baseMap; }
	public void setBaseMap( String baseMap ) { this.baseMap = baseMap; }
}
