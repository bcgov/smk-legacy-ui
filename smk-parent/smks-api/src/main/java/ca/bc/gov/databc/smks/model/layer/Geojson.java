package ca.bc.gov.databc.smks.model.layer;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.databc.smks.model.FeatureLayer;
import ca.bc.gov.databc.smks.model.LayerStyle;

@JsonInclude(Include.NON_NULL)
public class Geojson extends FeatureLayer
{
	private String dataUrl;
	private boolean useClustering;
	private boolean useHeatmapping;
	// private Double strokeWidth;
	// private String strokeStyle;
	// private String strokeColor;
	// private Double strokeOpacity;
	// private String fillColor;
	// private Double fillOpacity;
	// private String markerSymbolPath;
	private LayerStyle style;

	public Geojson() { }

	protected Geojson( Geojson layer ) {
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

	// public Double getStrokeWidth()
	// {
	// 	return strokeWidth;
	// }

	// public void setStrokeWidth(Double strokeWidth)
	// {
	// 	this.strokeWidth = strokeWidth;
	// }

	// public String getStrokeStyle()
	// {
	// 	return strokeStyle;
	// }

	// public void setStrokeStyle(String strokeStyle)
	// {
	// 	this.strokeStyle = strokeStyle;
	// }

	// public String getStrokeColor()
	// {
	// 	return strokeColor;
	// }

	// public void setStrokeColor(String strokeColor)
	// {
	// 	this.strokeColor = strokeColor;
	// }

	// public Double getStrokeOpacity()
	// {
	// 	return strokeOpacity;
	// }

	// public void setStrokeOpacity(Double strokeOpacity)
	// {
	// 	this.strokeOpacity = strokeOpacity;
	// }

	// public String getFillColor()
	// {
	// 	return fillColor;
	// }

	// public void setFillColor(String fillColor)
	// {
	// 	this.fillColor = fillColor;
	// }

	// public Double getFillOpacity()
	// {
	// 	return fillOpacity;
	// }

	// public void setFillOpacity(Double fillOpacity)
	// {
	// 	this.fillOpacity = fillOpacity;
	// }

	// public String getMarkerSymbolPath()
	// {
	// 	return markerSymbolPath;
	// }

	// public void setMarkerSymbolPath(String markerSymbolPath)
	// {
	// 	this.markerSymbolPath = markerSymbolPath;
	// }

	public Geojson clone()
	{
		Geojson clone = new Geojson( this );

		// clone.setAttribution(getAttribution());
		// clone.setFormat(getFormat());
		// clone.setId(getId());
		// clone.setIsTransparent(getIsTransparent());
		// clone.setIsVisible(getIsVisible());
		// clone.setLabel(getLabel());
		// clone.setMaxScale(getMaxScale());
		// clone.setMinScale(getMinScale());
		// clone.setOpacity(getOpacity());
		// clone.setServiceUrl(getServiceUrl());
		// clone.setDataUrl(dataUrl);
		// clone.setUseClustering(useClustering);
		// clone.setUseHeatmapping(useHeatmapping);

		// for(String s : dynamicLayers)
		// {
		// 	clone.getDynamicLayers().add(s);
		// }

		// for(Attribute a : getAttributes())
		// {
		// 	clone.getAttributes().add(a.clone());
		// }

		return clone;
	}

	// public JsonLayer clone()
	// {
	// 	JsonLayer clone = new JsonLayer();

	// 	clone.setAttribution(getAttribution());
	// 	clone.setFormat(getFormat());
	// 	clone.setId(getId());
	// 	clone.setIsTransparent(getIsTransparent());
	// 	clone.setIsVisible(getIsVisible());
	// 	clone.setLabel(getLabel());
	// 	clone.setMaxScale(getMaxScale());
	// 	clone.setMinScale(getMinScale());
	// 	clone.setOpacity(getOpacity());
	// 	clone.setServiceUrl(getServiceUrl());
	// 	clone.setFillColor(fillColor);
	// 	clone.setFillOpacity(fillOpacity);
	// 	clone.setMarkerSymbolPath(markerSymbolPath);
	// 	clone.setStrokeColor(strokeColor);
	// 	clone.setStrokeOpacity(strokeOpacity);
	// 	clone.setStrokeStyle(strokeStyle);
	// 	clone.setStrokeWidth(strokeWidth);
	// 	clone.setUseClustering(useClustering);
	// 	clone.setUseHeatmapping(useHeatmapping);

	// 	for(Attribute a : getAttributes())
	// 	{
	// 		clone.getAttributes().add(a.clone());
	// 	}

	// 	return clone;
	// }
}
