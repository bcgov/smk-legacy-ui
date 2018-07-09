package ca.bc.gov.app.smks.model.layer;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.FeatureLayer;
import ca.bc.gov.app.smks.model.Layer;
import ca.bc.gov.app.smks.model.LayerStyle;

@JsonInclude(Include.NON_NULL)
public class Geojson extends FeatureLayer
{
	private String dataUrl;
	private boolean useClustering;
	private boolean useHeatmapping;
	private LayerStyle style;

	public Geojson() { }

	protected Geojson( Geojson layer ) {
		super( layer );

		this.setDataUrl(layer.getDataUrl());
		this.setUseClustering(layer.getUseClustering());
		this.setUseHeatmapping(layer.getUseHeatmapping());
		this.setStyle(layer.getStyle().clone());
	}

	public String getType()
	{
		return Layer.Type.Geojson.getJsonType();
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

	public boolean getUseHeatmapping()
	{
		return useHeatmapping;
	}

	public void setUseHeatmapping(boolean useHeatmapping)
	{
		this.useHeatmapping = useHeatmapping;
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

	public Geojson clone()
	{
		Geojson clone = new Geojson( this );

		return clone;
	}
}