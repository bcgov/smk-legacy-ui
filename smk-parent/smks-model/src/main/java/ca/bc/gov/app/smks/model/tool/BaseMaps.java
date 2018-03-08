package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

import com.fasterxml.jackson.annotation.JsonIgnore;

@JsonInclude(Include.NON_NULL)
public class BaseMaps extends Tool
{
	private String[] choices;

	public BaseMaps() {}

	protected BaseMaps( BaseMaps about ) {
		super( about );
		
		if(about.choices == null) this.choices = new String[0];
		else this.choices = about.choices.clone();
	}

	public String getType() {
		return Tool.Type.baseMaps.toString();
	}

	public String getTitle() {
		return "Base Maps Panel";
	}

    public String getDescription() {
        return "Select the base maps available as choices.";
    }

    public boolean isConfigured() {
        return true;
    }

	public String[] getChoices() {
		return choices;
	}
	public void setChoices( String[] choices ) { this.choices = choices; }

	public BaseMaps clone()
	{
		BaseMaps clone = new BaseMaps( this );
		
		return clone;
	}

}
