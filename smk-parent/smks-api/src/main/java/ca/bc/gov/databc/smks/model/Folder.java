package ca.bc.gov.databc.smks.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class Folder extends Layer
{
	private List<Layer> sublayers; // for group and folder objects
	
	public Folder() { }
	
	public List<Layer> getSublayers() 
	{
		if(sublayers == null) sublayers = new ArrayList<Layer>();
		return sublayers;
	}

	public void setSublayers(List<Layer> sublayers) 
	{
		this.sublayers = sublayers;
	}
	
	public Folder clone()
	{
		Folder clone = new Folder();
		
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
		
		for(Layer layer : sublayers)
		{
			clone.getSublayers().add(layer.clone());
		}
		
		for(Attribute a : getAttributes())
		{
			clone.getAttributes().add(a.clone());
		}
		
		return clone;
	}
}
