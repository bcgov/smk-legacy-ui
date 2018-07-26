package ca.bc.gov.app.smks.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class MapViewer
{
	private String type;
	private ViewerLocation location;
	private String baseMap;
	private String activeTool;
	private boolean clusterOption;
	
	public MapViewer() 
	{
	    clusterOption = false;
	}

	protected MapViewer( MapViewer mapViewer ) 
	{
		this.setType(mapViewer.getType());
		this.setBaseMap(mapViewer.getBaseMap());
		this.setActiveTool(mapViewer.getActiveTool());
		this.setLocation(new ViewerLocation(mapViewer.getLocation()));
		this.setClusterOption(mapViewer.getClusterOption());
	}

	public String getType() { return type; }
	public void setType(String type) { this.type = type; }

	public boolean getClusterOption()
	{
	    return this.clusterOption;
	}
	
	public void setClusterOption(boolean clusterOption)
	{
	    this.clusterOption = clusterOption;
	}
	
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
}
