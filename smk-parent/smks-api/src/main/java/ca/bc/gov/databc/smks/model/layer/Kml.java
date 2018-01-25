package ca.bc.gov.databc.smks.model.layer;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.databc.smks.model.FeatureLayer;
import ca.bc.gov.databc.smks.model.LayerStyle;

@JsonInclude(Include.NON_NULL)
public class Kml extends FeatureLayer
{
	private String dataUrl;
	private boolean useClustering;
	private boolean useHeatmapping;
	private LayerStyle style;

	public Kml() { }

	protected Kml( Kml layer ) {
		super( layer );

		this.setDataUrl(layer.getDataUrl());
		this.setUseClustering(layer.getUseClustering());
		this.setUseHeatmapping(layer.getUseHeatmapping());
		this.setStyle(layer.getStyle().clone());
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
		return style;
	}

	public void setStyle(LayerStyle style)
	{
		this.style = style;
	}

	public Kml clone()
	{
		Kml clone = new Kml( this );

		return clone;
	}
}
