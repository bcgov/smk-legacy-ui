package ca.bc.gov.app.smks.model;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class MapViewer implements Serializable 
{
    private static final long serialVersionUID = -5151996772459032477L;
    
    private String type;
	private ViewerLocation location;
	private String baseMap;
	private String activeTool;
	private ClusterOption clusterOption;
	private String device;
	private String themes;
	private int deviceAutoBreakpoint;
	
	public MapViewer() 
	{
	    clusterOption = new ClusterOption();
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

	public ClusterOption getClusterOption()
	{
	    return this.clusterOption;
	}
	
	public void setClusterOption(ClusterOption clusterOption)
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

	public String getDevice()
    {
        return device;
    }

    public void setDevice(String device)
    {
        this.device = device;
    }

    public String getThemes()
    {
        return themes;
    }

    public void setThemes(String themes)
    {
        this.themes = themes;
    }
    
    public int getDeviceAutoBreakpoint()
    {
        return deviceAutoBreakpoint;
    }

    public void setDeviceAutoBreakpoint(int deviceAutoBreakpoint)
    {
        this.deviceAutoBreakpoint = deviceAutoBreakpoint;
    }

    public String getBaseMap() { return baseMap; }
	public void setBaseMap(String baseMap) { this.baseMap = baseMap; }
}
