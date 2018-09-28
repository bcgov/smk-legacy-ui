package ca.bc.gov.app.smks.model;

import java.io.Serializable;
import java.lang.reflect.InvocationTargetException;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;

import ca.bc.gov.app.smks.model.tool.About;
import ca.bc.gov.app.smks.model.tool.Attribution;
import ca.bc.gov.app.smks.model.tool.BaseMaps;
import ca.bc.gov.app.smks.model.tool.Coordinate;
import ca.bc.gov.app.smks.model.tool.Directions;
import ca.bc.gov.app.smks.model.tool.Dropdown;
import ca.bc.gov.app.smks.model.tool.Identify;
import ca.bc.gov.app.smks.model.tool.Layers;
import ca.bc.gov.app.smks.model.tool.ListMenu;
import ca.bc.gov.app.smks.model.tool.Location;
import ca.bc.gov.app.smks.model.tool.Markup;
import ca.bc.gov.app.smks.model.tool.Measure;
import ca.bc.gov.app.smks.model.tool.Menu;
import ca.bc.gov.app.smks.model.tool.Minimap;
import ca.bc.gov.app.smks.model.tool.Pan;
import ca.bc.gov.app.smks.model.tool.Query;
import ca.bc.gov.app.smks.model.tool.Scale;
import ca.bc.gov.app.smks.model.tool.Search;
import ca.bc.gov.app.smks.model.tool.Select;
import ca.bc.gov.app.smks.model.tool.ShortcutMenu;
import ca.bc.gov.app.smks.model.tool.Zoom;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
@JsonSubTypes( {
    @Type( name = "measure",		value = Measure.class ),
    @Type( name = "scale",			value = Scale.class ),
    @Type( name = "coordinate",		value = Coordinate.class ),
    @Type( name = "minimap",		value = Minimap.class ),
    @Type( name = "markup",			value = Markup.class ),
    @Type( name = "directions",		value = Directions.class ),
    @Type( name = "pan",			value = Pan.class ),
    @Type( name = "attribution",	value = Attribution.class ),
    @Type( name = "zoom",			value = Zoom.class ),
    @Type( name = "about",			value = About.class ),
    @Type( name = "baseMaps",		value = BaseMaps.class ),
    @Type( name = "layers",			value = Layers.class ),
    @Type( name = "identify",		value = Identify.class ),
    @Type( name = "select",			value = Select.class ),
    @Type( name = "search",			value = Search.class ),
    @Type( name = "dropdown",		value = Dropdown.class ),
    @Type( name = "menu",			value = Menu.class ),
    @Type( name = "query",			value = Query.class ),
    @Type( name = "location",       value = Location.class),
    @Type( name = "list-menu",       value = ListMenu.class),
    @Type( name = "shortcut-menu",       value = ShortcutMenu.class)
} )
@JsonInclude(Include.NON_DEFAULT)
public class Tool implements Serializable 
{
    private static final long serialVersionUID = 6278753941169947059L;

    public enum Type {
        UNKNOWN( Tool.class ),
        MEASURE( Measure.class ),
        SCALE( Scale.class ),
        COORDINATE( Coordinate.class ),
        MINIMAP( Minimap.class ),
        MARKUP( Markup.class ),
        MENU( Menu.class ),
        DROPDOWN( Dropdown.class ),
        QUERY( Query.class ),
        DIRECTIONS( Directions.class ),
        PAN( Pan.class ),
        ATTRIBUTION( Attribution.class ),
        ZOOM( Zoom.class ),
        ABOUT( About.class ),
        BASEMAPS( BaseMaps.class ),
        LAYERS( Layers.class ),
        IDENTIFY( Identify.class ),
        SELECT( Select.class ),
        LOCATION( Location.class ),
        SEARCH( Search.class ),
        LIST_MENU( ListMenu.class ),
        SHORTCUT_MENU( ShortcutMenu.class );

        private final Class<?> toolClass;

        private Type( Class<?> c ) {
            toolClass = c;
        }

        public Tool create() {
            try {
                return (Tool)toolClass.getConstructor(null).newInstance();
            } catch (InstantiationException | IllegalAccessException | IllegalArgumentException
                    | InvocationTargetException | NoSuchMethodException | SecurityException e) {
                return null;
            }
        }
    }

    protected boolean enabled;
    protected String title;
    protected String description;
    protected String type;
    protected String icon;
    protected int order;
    protected String instance;
    protected String position;
    
    public Tool() 
    {
    	description = "";
    	type = Type.UNKNOWN.toString();
        enabled = true;
    }

    protected Tool( Tool tool ) 
    {
    	title = tool.title;
    	description = tool.description;
    	type = tool.type;
    	enabled = tool.enabled;
    	icon = tool.icon;
    	order = tool.order;
    	instance = tool.instance;
    	position = tool.position;
    }

    public String getIcon() 
    {
		return icon;
	}

	public void setIcon(String icon) 
    {
		this.icon = icon;
	}

	@JsonIgnore
	public int getOrder() 
    {
		return order;
	}

	@JsonIgnore
	public void setOrder(int order) 
    {
		this.order = order;
	}

	public String getInstance() 
	{
		return instance;
	}

	public void setInstance(String instance) 
	{
		this.instance = instance;
	}
	
	public void setTitle(String title) 
	{
		this.title = title;
	}

    public String getTitle() 
    {
        return title;
    }
    
	@JsonIgnore
    public String getType() {
        return type;
    }

	public void setType(String type)
	{
	    this.type = type;
	}
	
    @JsonIgnore
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description)
    {
        this.description = description;
    }

    @JsonIgnore
    public boolean isConfigured() {
        return false;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public void setPosition(String position) {
        this.position = position;
    }
    
    public String getPosition() {
        return this.position;
    }

    @Override
    public boolean equals( Object other ) {
        if ( other == null ) return false;
        if ( other == this ) return true;
        if ( !( other instanceof Tool ) ) return false;

        return ( ( Tool )other ).getType().equals( getType() );
    }

    @Override
    public int hashCode() {
        return getType().hashCode();
    }

}
