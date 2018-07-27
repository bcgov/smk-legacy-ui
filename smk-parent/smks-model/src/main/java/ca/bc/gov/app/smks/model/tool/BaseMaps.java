package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class BaseMaps extends Tool
{
    private static final long serialVersionUID = 2640742132722567481L;
 
    private String[] choices;

	public BaseMaps() 
	{
	    this.setTitle("Base Maps Panel");
	    this.setDescription("Select the base maps available as choices.");
	    this.setType(Tool.Type.BASEMAPS.toString());
	}

	public BaseMaps( BaseMaps basemaps ) {
		super( basemaps );
		
		if(basemaps.choices == null) this.choices = new String[0];
		else this.choices = basemaps.choices.clone();		
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
    
	public String[] getChoices() {
		return choices;
	}
	public void setChoices( String[] choices ) { this.choices = choices; }
}
