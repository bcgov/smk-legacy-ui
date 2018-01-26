package ca.bc.gov.databc.smks.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import ca.bc.gov.databc.smks.model.layer.EsriDynamic;
import ca.bc.gov.databc.smks.model.layer.Folder;
import ca.bc.gov.databc.smks.model.layer.Group;
import ca.bc.gov.databc.smks.model.layer.Wms;
import ca.bc.gov.databc.smks.model.layer.Kml;
import ca.bc.gov.databc.smks.model.layer.Geojson;

@JsonTypeInfo(
	use = JsonTypeInfo.Id.NAME,
	include = JsonTypeInfo.As.PROPERTY,
	property = "type"
)
@JsonSubTypes( {
	@Type( name = "esri-dynamic", value = EsriDynamic.class ),
	@Type( name = "folder",       value = Folder.class ),
	@Type( name = "group",        value = Group.class ),
	@Type( name = "wms",          value = Wms.class ),
	@Type( name = "kml",          value = Kml.class ),
	@Type( name = "geojson",      value = Geojson.class )
} )
@JsonInclude(Include.NON_NULL)
public class Layer implements Cloneable
{
	public enum Type { 
		EsriDynamic( "esri-dynamic" ),
		Folder( "folder" ),
		Group( "group" ),
		Wms( "wms" ),
		Kml( "kml" ),
		Geojson( "geojson" );
		
		private String jsonType;
		
		private Type( String json ) {
			jsonType = json;
		}
		
		public String getJsonType() { return jsonType; }
	}
	
	private String id;
	private String title;
	private Boolean isVisible;
	private String attribution;
	private String metadataUrl;
	private Double opacity;
	private Double minScale;
	private Double maxScale;

	public Layer()
	{
	}

	protected Layer( Layer layer )
	{
		this.setId(layer.getId());
		this.setTitle(layer.getTitle());
		this.setAttribution(layer.getAttribution());
		this.setMetadataUrl(layer.getMetadataUrl());
		this.setIsVisible(layer.getIsVisible());
		this.setMaxScale(layer.getMaxScale());
		this.setMinScale(layer.getMinScale());
		this.setOpacity(layer.getOpacity());
	}

	public String getId()
	{
		return id;
	}

	public void setId(String id)
	{
		this.id = id;
	}

	public String getType()
	{
		return "unknown";
	}

	public String getTitle()
	{
		return title;
	}

	public void setTitle(String title)
	{
		this.title = title;
	}

	public boolean getIsVisible()
	{
		return isVisible;
	}

	public void setIsVisible(boolean isVisible)
	{
		this.isVisible = isVisible;
	}

	public String getAttribution()
	{
		return attribution;
	}

	public void setAttribution(String attribution)
	{
		this.attribution = attribution;
	}

	public String getMetadataUrl()
	{
		return metadataUrl;
	}

	public void setMetadataUrl(String metadataUrl)
	{
		this.metadataUrl = metadataUrl;
	}

	public Double getOpacity()
	{
		return opacity;
	}

	public void setOpacity(Double opacity)
	{
		this.opacity = opacity;
	}

	public Double getMinScale()
	{
		return minScale;
	}

	public void setMinScale(Double minScale)
	{
		this.minScale = minScale;
	}

	public Double getMaxScale()
	{
		return maxScale;
	}

	public void setMaxScale(Double maxScale)
	{
		this.maxScale = maxScale;
	}

	@Override
	public String toString()
	{
		return this.getTitle();
	}

	public Layer clone()
	{
		Layer clone = new Layer( this );

		return clone;
	}

}
