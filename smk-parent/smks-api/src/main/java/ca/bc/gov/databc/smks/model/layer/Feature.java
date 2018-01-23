package ca.bc.gov.databc.smks.model.layer;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.databc.smks.model.Layer;

@JsonInclude(Include.NON_NULL)
public class Feature extends Layer
{
	private List<String> layers;

public Feature() { }

	public List<String> getLayers()
	{
		if(layers == null) layers = new ArrayList<String>();
		return layers;
	}

	public void setLayers(List<String> layers)
	{
		this.layers = layers;
	}

	public Feature clone()
	{
		Feature clone = new Feature();



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
