package ca.bc.gov.databc.smks.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class KmlLayer extends Layer 
{
	private boolean useClustering;
	private boolean useHeatmapping;
	private Double strokeWidth;
	private String strokeStyle;
	private String strokeColor;
	private Double strokeOpacity;
	private String fillColor;
	private Double fillOpacity;
	private String markerSymbolPath;
	
	public KmlLayer() { }
	
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
	
	public Double getStrokeWidth() 
	{
		return strokeWidth;
	}

	public void setStrokeWidth(Double strokeWidth) 
	{
		this.strokeWidth = strokeWidth;
	}

	public String getStrokeStyle() 
	{
		return strokeStyle;
	}

	public void setStrokeStyle(String strokeStyle) 
	{
		this.strokeStyle = strokeStyle;
	}

	public String getStrokeColor() 
	{
		return strokeColor;
	}

	public void setStrokeColor(String strokeColor) 
	{
		this.strokeColor = strokeColor;
	}

	public Double getStrokeOpacity() 
	{
		return strokeOpacity;
	}

	public void setStrokeOpacity(Double strokeOpacity) 
	{
		this.strokeOpacity = strokeOpacity;
	}

	public String getFillColor() 
	{
		return fillColor;
	}

	public void setFillColor(String fillColor) 
	{
		this.fillColor = fillColor;
	}

	public Double getFillOpacity() 
	{
		return fillOpacity;
	}

	public void setFillOpacity(Double fillOpacity)
	{
		this.fillOpacity = fillOpacity;
	}

	public String getMarkerSymbolPath() 
	{
		return markerSymbolPath;
	}

	public void setMarkerSymbolPath(String markerSymbolPath) 
	{
		this.markerSymbolPath = markerSymbolPath;
	}
	
	public KmlLayer clone()
	{
		KmlLayer clone = new KmlLayer();
		
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
		clone.setFillColor(fillColor);
		clone.setFillOpacity(fillOpacity);
		clone.setMarkerSymbolPath(markerSymbolPath);
		clone.setStrokeColor(strokeColor);
		clone.setStrokeOpacity(strokeOpacity);
		clone.setStrokeStyle(strokeStyle);
		clone.setStrokeWidth(strokeWidth);
		clone.setUseClustering(useClustering);
		clone.setUseHeatmapping(useHeatmapping);
		
		for(Attribute a : getAttributes())
		{
			clone.getAttributes().add(a.clone());
		}
		
		return clone;
	}
}
