package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Query extends Tool
{
    private static final long serialVersionUID = -8358469360934843369L;

    public Query() 
    {
        this.setTitle("Query");
        this.setDescription("Query Tool");
        this.setType(Tool.Type.QUERY.toString());
    }

    public Query( Query query ) {
		super( query );
	}

    @Override
    public String getInstance() 
    {
        return instance;
    }

    @Override
    public void setInstance(String instance) 
    {
        this.instance = instance;
    }

    @Override
    public String getIcon() 
    {
        return icon;
    }

    @Override
    public void setIcon(String icon) 
    {
        this.icon = icon;
    }
    
    @Override
    public boolean equals( Object other ) {
        return super.equals(other);
    }
    
    @Override
    public int hashCode() {
        return getType().hashCode();
    }
}
