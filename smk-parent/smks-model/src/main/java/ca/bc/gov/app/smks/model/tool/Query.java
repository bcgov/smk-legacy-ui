package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Query extends Tool
{
	public Query() {}

	protected Query( Query query ) {
		super( query );
	}

	public String getType() 
	{
		return Tool.Type.query.toString();
	}

	public String getTitle() {
		return "Query";
	}

    public String getInstance() 
    {
        return instance;
    }

    public void setInstance(String instance) 
    {
        this.instance = instance;
    }

    public String getIcon() 
    {
        return icon;
    }

    public void setIcon(String icon) 
    {
        this.icon = icon;
    }
    
	public Query clone()
	{
		Query clone = new Query( this );

		return clone;
	}
}
