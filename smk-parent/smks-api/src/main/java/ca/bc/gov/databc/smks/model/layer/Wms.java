package ca.bc.gov.databc.smks.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class WMSLayer extends Layer 
{
	private String wmsVersion;
	private String wmsStyleId;
	private String wmsStyleName;
	private String wmsLegendUrl;
	private String metadataUrl;
	private List<String> layers;
	
	public WMSLayer() { }
	
	public String getWmsVersion() 
	{
		return wmsVersion;
	}

	public void setWmsVersion(String wmsVersion) 
	{
		this.wmsVersion = wmsVersion;
	}

	public String getWmsStyleId() 
	{
		return wmsStyleId;
	}

	public void setWmsStyleId(String wmsStyleId) 
	{
		this.wmsStyleId = wmsStyleId;
	}

	public String getWmsStyleName() 
	{
		return wmsStyleName;
	}

	public void setWmsStyleName(String wmsStyleName) 
	{
		this.wmsStyleName = wmsStyleName;
	}
	
	public String getWmsLegendUrl()
	{
		return wmsLegendUrl;
	}
	
	public void setWmsLegendUrl(String wmsLegendUrl)
	{
		this.wmsLegendUrl = wmsLegendUrl;
	}
	
	public String getMetadataUrl() 
	{
		return metadataUrl;
	}

	public void setMetadataUrl(String metadataUrl) 
	{
		this.metadataUrl = metadataUrl;
	}
	
	public List<String> getLayers() 
	{
		if(layers == null) layers = new ArrayList<String>();
		return layers;
	}

	public void setLayers(List<String> layers) 
	{
		this.layers = layers;
	}
	
	public WMSLayer clone()
	{
		WMSLayer clone = new WMSLayer();
		
		clone.setAttribution(getAttribution());
		clone.setFormat(getFormat());
		clone.setId(getId());
		clone.setIsTransparent(getIsTransparent());
		clone.setIsVisible(getIsVisible());
		clone.setLabel(getLabel());
		clone.setMaxScale(getMaxScale());
		clone.setMinScale(getMinScale());
		clone.setOpacity(getOpacity());
		clone.setServiceUrl(getServiceUrl());
		clone.setWmsStyleId(wmsStyleId);
		clone.setWmsVersion(wmsVersion);
		clone.setMetadataUrl(metadataUrl);
		clone.setWmsLegendUrl(wmsLegendUrl);
		clone.setWmsStyleName(wmsStyleName);
		
		for(String s : layers)
		{
			clone.getLayers().add(s);
		}
		
		for(Attribute a : getAttributes())
		{
			clone.getAttributes().add(a.clone());
		}
		
		return clone;
	}
}
