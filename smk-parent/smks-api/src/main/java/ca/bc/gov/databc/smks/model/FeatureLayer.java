package ca.bc.gov.databc.smks.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class FeatureLayer extends Layer
{
	private List<String> layers;
	
	public FeatureLayer() { }
	
	public List<String> getLayers() 
	{
		if(layers == null) layers = new ArrayList<String>();
		return layers;
	}

	public void setLayers(List<String> layers) 
	{
		this.layers = layers;
	}
	
	public FeatureLayer clone()
	{
		FeatureLayer clone = new FeatureLayer();
		
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
		
		for(String layer : layers)
		{
			clone.getLayers().add(layer);
		}
		
		for(Attribute a : getAttributes())
		{
			clone.getAttributes().add(a.clone());
		}
		
		return clone;
	}
}
