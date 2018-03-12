package ca.bc.gov.app.smks.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class CollectionLayer extends Layer
{
	private List<Layer> layers;

	public CollectionLayer()
	{
	}

	protected CollectionLayer( Layer layer )
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

	public List<Layer> getLayers()
	{
		if(layers == null) layers = new ArrayList<Layer>();
		return layers;
	}

	public void setLayers(List<Layer> layers)
	{
		this.layers = layers;
	}

	public CollectionLayer clone()
	{
		CollectionLayer clone = new CollectionLayer( super.clone() );

		for(Layer a : layers)
		{
			clone.getLayers().add(a.clone());
		}

		return clone;
	}

}
