package ca.bc.gov.app.smks.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class MapViewer implements Cloneable
{
	private String type;
	//private Double[] initialExtent = {-139.1782, 47.6039, -110.3533, 60.5939};
	private ViewerLocation location;
	private String baseMap;
	private String activeTool;
	
	public MapViewer() {
	}

	protected MapViewer( MapViewer mapViewer ) {
		this.setType(mapViewer.getType());
		//this.setInitialExtent(mapViewer.getInitialExtent().clone());
		this.setBaseMap(mapViewer.getBaseMap());
		this.setActiveTool(mapViewer.getActiveTool());
		this.setLocation(mapViewer.getLocation());
	}

	public String getType() { return type; }
	public void setType(String type) { this.type = type; }

	//public Double[] getInitialExtent() {
	//	if ( initialExtent == null ) initialExtent = new Double[4];
	//	return initialExtent;
	//}
	//public void setInitialExtent(Double[] initialExtent) { this.initialExtent = initialExtent; }

	public ViewerLocation getLocation()
	{
	    return this.location;
	}
	
	public void setLocation(ViewerLocation location)
	{
	    this.location = location;
	}
	
	public String getActiveTool()
	{
	    return this.activeTool;
	}
	
	public void setActiveTool(String activeTool)
	{
	    this.activeTool = activeTool;
	}
	
	public String getBaseMap() { return baseMap; }
	public void setBaseMap(String baseMap) { this.baseMap = baseMap; }

	public MapViewer clone()
	{
		MapViewer clone = new MapViewer( this );

		return clone;
	}
}
