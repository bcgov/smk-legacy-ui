package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Menu extends Tool
{
    private static final long serialVersionUID = 7160370252214201631L;

    public Menu() 
    {
        this.setTitle("Menu");
        this.setDescription("Menu");
        this.setType(Tool.Type.MENU.toString());
    }

    public Menu( Menu menu ) {
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
