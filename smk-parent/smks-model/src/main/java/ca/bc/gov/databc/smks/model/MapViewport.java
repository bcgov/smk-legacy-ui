package ca.bc.gov.databc.smks.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class MapViewport implements Cloneable
{
	private String type;
	private Double[] initialExtent;
	private String baseMap;

	public MapViewport() { }

	protected MapViewport( MapViewport mapViewport ) {
		this.setType(mapViewport.getType());
		this.setInitialExtent(mapViewport.getInitialExtent().clone());
		this.setBaseMap(mapViewport.getBaseMap());
	}

	public String getType() { return type; }
	public void setType(String type) { this.type = type; }

	public Double[] getInitialExtent() {
		if ( initialExtent == null ) initialExtent = new Double[4];
		return initialExtent;
	}
	public void setInitialExtent(Double[] initialExtent) { this.initialExtent = initialExtent; }

	public String getBaseMap() { return baseMap; }
	public void setBaseMap(String baseMap) { this.baseMap = baseMap; }

	public MapViewport clone()
	{
		MapViewport clone = new MapViewport( this );

		return clone;
	}
}
