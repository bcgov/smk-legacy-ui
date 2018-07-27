package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class BaseMaps extends Tool
{
    private static final long serialVersionUID = 2640742132722567481L;
 
    private String[] choices;

	public BaseMaps() {}

	public BaseMaps( BaseMaps about ) {
		super( about );
		
		if(about.choices == null) this.choices = new String[0];
		else this.choices = about.choices.clone();
	}

	@Override
	public String getType() {
		return Tool.Type.BASEMAPS.toString();
	}

	@Override
	public String getTitle() {
		return "Base Maps Panel";
	}

	@Override
    public String getDescription() {
        return "Select the base maps available as choices.";
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
