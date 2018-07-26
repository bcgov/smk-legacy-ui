package ca.bc.gov.app.smks.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class LayerStyle
{
	private Double strokeWidth;
	private String strokeStyle;
	private String strokeColor;
	private Double strokeOpacity;
	private String fillColor;
	private Double fillOpacity;
	private String markerUrl;
	private Integer[] markerSize = {20, 20};
	private Integer[] markerOffset = {10, 0};
    		
	public LayerStyle() { }

	public LayerStyle( LayerStyle layerStyle ) {
		this.setStrokeWidth(layerStyle.getStrokeWidth());
		this.setStrokeStyle(layerStyle.getStrokeStyle());
		this.setStrokeColor(layerStyle.getStrokeColor());
		this.setStrokeOpacity(layerStyle.getStrokeOpacity());
		this.setFillColor(layerStyle.getFillColor());
		this.setFillOpacity(layerStyle.getFillOpacity());
		this.setMarkerUrl(layerStyle.getMarkerUrl());
		this.setMarkerSize(layerStyle.getMarkerSize());
		this.setMarkerOffset(layerStyle.getMarkerOffset());
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

	public String getMarkerUrl() { return markerUrl; }
	public void setMarkerUrl(String markerUrl) { this.markerUrl = markerUrl; }

	public Integer[] getMarkerSize() {
		if ( markerSize == null ) markerSize = new Integer[2];
		return markerSize;
	}
	public void setMarkerSize(Integer[] markerSize) { this.markerSize = markerSize; }
	
	public Integer[] getMarkerOffset() {
		if ( markerOffset == null ) markerOffset = new Integer[4];
		return markerOffset;
	}
	public void setMarkerOffset(Integer[] markerOffset) { this.markerOffset = markerOffset; }
}
