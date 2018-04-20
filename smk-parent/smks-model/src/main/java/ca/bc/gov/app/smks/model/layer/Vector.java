package ca.bc.gov.app.smks.model.layer;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.FeatureLayer;
import ca.bc.gov.app.smks.model.Layer;
import ca.bc.gov.app.smks.model.LayerStyle;

@JsonInclude(Include.NON_NULL)
// Was Geojson class
public class Vector extends FeatureLayer
{
	private String dataUrl;
	private boolean useRaw;
	private boolean useClustering;
	private boolean useHeatmap;
	private LayerStyle style;

	public Vector() { }

	protected Vector( Vector layer ) {
		super( layer );

		this.setDataUrl(layer.getDataUrl());
		this.setUseRaw(layer.getUseRaw());
		this.setUseClustering(layer.getUseClustering());
		this.setUseHeatmap(layer.getUseHeatmap());
		this.setStyle(layer.getStyle().clone());
	}

	public String getType()
	{
		return Layer.Type.Vector.getJsonType();
	}

	public String getDataUrl()
	{
		return dataUrl;
	}

	public void setDataUrl(String dataUrl)
	{
		this.dataUrl = dataUrl;
	}

	public boolean getUseClustering()
	{
		return useClustering;
	}

	public void setUseClustering(boolean useClustering)
	{
		this.useClustering = useClustering;
	}

	public boolean getUseHeatmap()
	{
		return useHeatmap;
	}

	public void setUseHeatmap(boolean useHeatmapping)
	{
		this.useHeatmap = useHeatmapping;
	}

	public boolean getUseRaw()
	{
		return useRaw;
	}
	
	public void setUseRaw(boolean useRawVector)
	{
		this.useRaw = useRawVector;
	}
	
	public LayerStyle getStyle()
	{
		if ( style == null ) style = new LayerStyle();
		return style;
	}

	public void setStyle(LayerStyle style)
	{
		this.style = style;
	}

	public Vector clone()
	{
		Vector clone = new Vector( this );

		return clone;
	}
}
