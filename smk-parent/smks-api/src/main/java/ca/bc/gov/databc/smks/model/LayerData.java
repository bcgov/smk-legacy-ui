package ca.bc.gov.databc.smks.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class LayerData extends LayerBase
{
	private List<Attribute> attributes;

	public LayerData()
	{
	}

	protected LayerData( LayerBase layer )
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

	public List<Attribute> getAttributes()
	{
		if(attributes == null) attributes = new ArrayList<Attribute>();
		return attributes;
	}

	public void setAttributes(List<Attribute> attributes)
	{
		this.attributes = attributes;
	}

	public LayerData clone()
	{
		LayerData clone = new LayerData( super.clone() );

		for(Attribute a : attributes)
		{
			clone.getAttributes().add(a.clone());
		}

		return clone;
	}

}
