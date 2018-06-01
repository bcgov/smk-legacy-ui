package ca.bc.gov.app.smks.model;

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
    @Type( name = "location",       value = Location.class)
} )
@JsonInclude(Include.NON_DEFAULT)
public class Tool implements Cloneable
{
    public enum Type {
        unknown( Tool.class ),
        measure( Measure.class ),
        scale( Scale.class ),
        coordinate( Coordinate.class ),
        minimap( Minimap.class ),
        markup( Markup.class ),
        menu( Menu.class ),
        dropdown( Dropdown.class ),
        query( Query.class ),
        directions( Directions.class ),
        pan( Pan.class ),
        attribution( Attribution.class ),
        zoom( Zoom.class ),
        about( About.class ),
        baseMaps( BaseMaps.class ),
        layers( Layers.class ),
        identify( Identify.class ),
        select( Select.class ),
        location( Location.class ),
        search( Search.class );

        private final Class<?> CLASS;

        private Type( Class<?> c ) {
            CLASS = c;
        }

        public Tool create() {
            try {
                return (Tool)CLASS.getConstructor(null).newInstance();
            } catch (InstantiationException | IllegalAccessException | IllegalArgumentException
                    | InvocationTargetException | NoSuchMethodException | SecurityException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
                return null;
            }
        }
    }

    protected boolean enabled;
    protected String title;
    protected String icon;
    protected int order;
    protected String instance;
    protected String position;
    protected boolean showPanel; 
    
    public Tool() {
    	title = "Unknown"; 
        enabled = true;
        showPanel = true;
    }

    protected Tool( Tool tool ) 
    {
    	title = tool.title;
    	enabled = tool.enabled;
    	icon = tool.icon;
    	order = tool.order;
    	instance = tool.instance;
    	position = tool.position;
    	showPanel = tool.showPanel;
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
        return Type.unknown.toString();
    }

    @JsonIgnore
    public String getDescription() {
        return "This is the base class";
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
    
    public boolean getShowPanel()
    {
        return this.showPanel;
    }
    
    public void setShowPanel(boolean showPanel)
    {
        this.showPanel = showPanel;
    }
    
    public Tool clone()
    {
        Tool clone = new Tool( this );

        return clone;
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
