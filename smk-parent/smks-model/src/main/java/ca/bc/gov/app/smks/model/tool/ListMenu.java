package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class ListMenu extends Tool
{
    private static final long serialVersionUID = 8842583227567571814L;

    public ListMenu() 
    {
        this.setDescription("ListMenu");
        this.setType(Tool.Type.LIST_MENU.toString());
    }

    public ListMenu( ListMenu menu ) {
        super( menu );
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
