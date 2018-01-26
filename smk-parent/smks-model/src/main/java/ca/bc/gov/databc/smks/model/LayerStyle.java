package ca.bc.gov.databc.smks.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class LayerStyle implements Cloneable
{
	private Double strokeWidth;
	private String strokeStyle;
	private String strokeColor;
	private Double strokeOpacity;
	private String fillColor;
	private Double fillOpacity;
	private String markerSymbolPath;

	public LayerStyle() { }

	protected LayerStyle( LayerStyle layerStyle ) {
		this.setStrokeWidth(layerStyle.getStrokeWidth());
		this.setStrokeStyle(layerStyle.getStrokeStyle());
		this.setStrokeColor(layerStyle.getStrokeColor());
		this.setStrokeOpacity(layerStyle.getStrokeOpacity());
		this.setFillColor(layerStyle.getFillColor());
		this.setFillOpacity(layerStyle.getFillOpacity());
		this.setMarkerSymbolPath(layerStyle.getMarkerSymbolPath());
	}

	public Double getStrokeWidth() { return strokeWidth; }
	public void setStrokeWidth(Double strokeWidth) { this.strokeWidth = strokeWidth; }

	public String getStrokeStyle() { return strokeStyle; }
	public void setStrokeStyle(String strokeStyle) { this.strokeStyle = strokeStyle; }

	public String getStrokeColor() { return strokeColor; }
	public void setStrokeColor(String strokeColor) { this.strokeColor = strokeColor; }

	public Double getStrokeOpacity() { return strokeOpacity; }
	public void setStrokeOpacity(Double strokeOpacity) { this.strokeOpacity = strokeOpacity; }

	public String getFillColor() { return fillColor; }
	public void setFillColor(String fillColor) { this.fillColor = fillColor; }

	public Double getFillOpacity() { return fillOpacity; }
	public void setFillOpacity(Double fillOpacity) { this.fillOpacity = fillOpacity; }

	public String getMarkerSymbolPath() { return markerSymbolPath; }
	public void setMarkerSymbolPath(String markerSymbolPath) { this.markerSymbolPath = markerSymbolPath; }

	public LayerStyle clone()
	{
		LayerStyle clone = new LayerStyle( this );

		return clone;
	}

}
