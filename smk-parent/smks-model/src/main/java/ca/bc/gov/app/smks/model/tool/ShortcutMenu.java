package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class ShortcutMenu extends Tool
{
    private static final long serialVersionUID = -32550568558820657L;

    public ShortcutMenu() 
    {
        this.setDescription("ShortcutMenu");
        this.setType(Tool.Type.SHORTCUT_MENU.toString());
    }

    public ShortcutMenu( ShortcutMenu menu ) {
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
