package ca.bc.gov.databc.smks.model;

import java.lang.reflect.InvocationTargetException;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;

import ca.bc.gov.databc.smks.model.tool.Measure;
import ca.bc.gov.databc.smks.model.tool.Scale;
import ca.bc.gov.databc.smks.model.tool.Coordinate;
import ca.bc.gov.databc.smks.model.tool.Minimap;
import ca.bc.gov.databc.smks.model.tool.Markup;
import ca.bc.gov.databc.smks.model.tool.Directions;
import ca.bc.gov.databc.smks.model.tool.Pan;
import ca.bc.gov.databc.smks.model.tool.Attribution;
import ca.bc.gov.databc.smks.model.tool.Zoom;
import ca.bc.gov.databc.smks.model.tool.Sidebar;
import ca.bc.gov.databc.smks.model.tool.About;
import ca.bc.gov.databc.smks.model.tool.BaseMaps;
import ca.bc.gov.databc.smks.model.tool.Layers;
import ca.bc.gov.databc.smks.model.tool.Identify;
import ca.bc.gov.databc.smks.model.tool.Select;

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
    @Type( name = "sidebar",		value = Sidebar.class ),
    @Type( name = "about",			value = About.class ),
    @Type( name = "baseMaps",		value = BaseMaps.class ),
    @Type( name = "layers",			value = Layers.class ),
    @Type( name = "identify",		value = Identify.class ),
    @Type( name = "select",			value = Select.class )
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
        directions( Directions.class ),
        pan( Pan.class ),
        attribution( Attribution.class ),
        zoom( Zoom.class ),
        sidebar( Sidebar.class ),
        about( About.class ),
        baseMaps( BaseMaps.class ),
        layers( Layers.class ),
        identify( Identify.class ),
        select( Select.class );

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

    private boolean enabled;

    public Tool() {
        enabled = true;
    }

    protected Tool( Tool tool ) {}

    @JsonIgnore
    public String getType() {
        return Type.unknown.toString();
    }

    @JsonIgnore
    public String getTitle() {
        return "Unknown";
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
