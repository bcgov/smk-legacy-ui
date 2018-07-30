package ca.bc.gov.app.smks.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonIgnore;

import ca.bc.gov.app.smks.model.layer.EsriDynamic;
import ca.bc.gov.app.smks.model.layer.Folder;
import ca.bc.gov.app.smks.model.layer.Vector;
import ca.bc.gov.app.smks.model.layer.Group;
import ca.bc.gov.app.smks.model.layer.Kml;
import ca.bc.gov.app.smks.model.layer.Wms;

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
	@Type( name = "vector",      value = Vector.class )
} )
@JsonInclude(Include.NON_NULL)
public class Layer implements Serializable 
{
    private static final long serialVersionUID = -4522391129982811968L;

    public enum Type {
		ESRI_DYNAMIC( "esri-dynamic" ),
		FOLDER( "folder" ),
		GROUP( "group" ),
		WMS( "wms" ),
		KML( "kml" ),
		VECTOR( "vector" );

		private String jsonType;

		private Type( String json ) {
			jsonType = json;
		}

		public String getJsonType() { return jsonType; }
	}

	private String id;
	private String title;
	private boolean isVisible;
	private String attribution;
	private String metadataUrl;
	private Double opacity;
	private Double minScale;
	private Double maxScale;
	private boolean isQueryable;
	private String popupTemplate;
	
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
		this.setPopupTemplate(layer.getPopupTemplate());
		this.setIsQueryable(layer.isQueryable);
	}

	public String getId()
	{
		return id;
	}

	public void setId(String id)
	{
		this.id = id;
	}

    @JsonIgnore
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

	public void setIsQueryable(boolean isQueryable)
	{
		this.isQueryable = isQueryable;
	}
	
	public boolean getIsQueryable()
	{
		return isQueryable;
	}
	
	public String getPopupTemplate()
	{
	    return this.popupTemplate;
	}
	
	public void setPopupTemplate(String popupTemplate)
	{
	    this.popupTemplate = popupTemplate;
	}
	
	@Override
	public String toString()
	{
		return this.getTitle();
	}
}
