package ca.bc.gov.databc.smks.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonTypeInfo(
		  use = JsonTypeInfo.Id.NAME, 
		  include = JsonTypeInfo.As.PROPERTY, 
		  property = "type")
		@JsonSubTypes({ 
		  @Type(value = DynamicServiceLayer.class, name = "dynamicServiceLayer"), 
		  @Type(value = Folder.class, name = "folder"),
		  @Type(value = GroupLayer.class, name = "groupLayer"),
		  @Type(value = WMSLayer.class, name = "wmsLayer"),
		  @Type(value = KmlLayer.class, name = "kmlLayer"),
		  @Type(value = KmlLayer.class, name = "jsonLayer")
		})
@JsonInclude(Include.NON_NULL)
public class Layer implements Cloneable 
{
	private Integer id;
	private String label;
	private Boolean isVisible;
	private String attribution;
	private List<Attribute> attributes;
	private String serviceUrl; // also used as path for KML and JSON
	private String format;
	private Double opacity;
	private Boolean isTransparent;
	private Double minScale;
	private Double maxScale;
	
	public Layer()
	{
	}

	public Integer getId() 
	{
		return id;
	}

	public void setId(Integer id) 
	{
		this.id = id;
	}

	public String getLabel() 
	{
		return label;
	}

	public void setLabel(String label) 
	{
		this.label = label;
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

	public String getServiceUrl() 
	{
		return serviceUrl;
	}

	public void setServiceUrl(String serviceUrl) 
	{
		this.serviceUrl = serviceUrl;
	}

	public String getFormat() 
	{
		return format;
	}

	public void setFormat(String format) 
	{
		this.format = format;
	}

	public Double getOpacity() 
	{
		return opacity;
	}

	public void setOpacity(Double opacity) 
	{
		this.opacity = opacity;
	}

	public Boolean getIsTransparent() 
	{
		return isTransparent;
	}

	public void setIsTransparent(Boolean isTransparent) 
	{
		this.isTransparent = isTransparent;
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
		return this.getLabel();
	}

	public List<Attribute> getAttributes() 
	{
		if(attributes == null) attributes = new ArrayList<Attribute>();
		return attributes;
	}

	public void setAttributes(List<Attribute> attributes) 
	{
		this.attributes = attributes;
	}
	
	public Layer clone()
	{
		Layer clone = new Layer();
		
		clone.setAttribution(attribution);
		clone.setFormat(format);
		clone.setId(id);
		clone.setIsTransparent(isTransparent);
		clone.setIsVisible(isVisible);
		clone.setLabel(label);
		clone.setMaxScale(maxScale);
		clone.setMinScale(minScale);
		clone.setOpacity(opacity);
		clone.setServiceUrl(serviceUrl);
		
		for(Attribute a : attributes)
		{
			clone.getAttributes().add(a.clone());
		}
		
		return clone;
	}
}
