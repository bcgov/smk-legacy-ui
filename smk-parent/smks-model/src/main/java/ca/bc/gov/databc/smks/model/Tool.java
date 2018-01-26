package ca.bc.gov.databc.smks.model;

import java.lang.reflect.InvocationTargetException;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

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

@JsonInclude(Include.NON_NULL)
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
	
	public String getId() {
		return Type.unknown.toString();
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

}
