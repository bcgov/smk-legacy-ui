package ca.bc.gov.app.smks.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.layer.EsriDynamic;
import ca.bc.gov.app.smks.model.layer.Vector;
import ca.bc.gov.app.smks.model.layer.Wms;
import ca.bc.gov.app.smks.model.tool.About;
import ca.bc.gov.app.smks.model.tool.Attribution;
import ca.bc.gov.app.smks.model.tool.BaseMaps;
import ca.bc.gov.app.smks.model.tool.Coordinate;
import ca.bc.gov.app.smks.model.tool.Directions;
import ca.bc.gov.app.smks.model.tool.Dropdown;
import ca.bc.gov.app.smks.model.tool.Identify;
import ca.bc.gov.app.smks.model.tool.Layers;
import ca.bc.gov.app.smks.model.tool.Location;
import ca.bc.gov.app.smks.model.tool.Markup;
import ca.bc.gov.app.smks.model.tool.Measure;
import ca.bc.gov.app.smks.model.tool.Menu;
import ca.bc.gov.app.smks.model.tool.Minimap;
import ca.bc.gov.app.smks.model.tool.Pan;
import ca.bc.gov.app.smks.model.tool.Query;
import ca.bc.gov.app.smks.model.tool.Scale;
import ca.bc.gov.app.smks.model.tool.Search;
import ca.bc.gov.app.smks.model.tool.Select;
import ca.bc.gov.app.smks.model.tool.Zoom;

import org.ektorp.Attachment;
import org.ektorp.support.CouchDbDocument;

@JsonIgnoreProperties({"id", "revision"})
@JsonInclude(Include.NON_DEFAULT)
public class MapConfiguration extends CouchDbDocument
{
	private static final long serialVersionUID = -8711804469072616248L;

	// ID and naming
	private String lmfId;
	private int lmfRevision;
	private String version;
	private String name;
	private String project;

	// metadata
	private String createdBy;
	private String createdDate;
	private String modifiedBy;
	private String modifiedDate;
	private boolean published; // is published indicator

	// settings
	private MapSurround surround;
	private MapViewer viewer;

	// layer and tool configs
    private List<Tool> tools;
    
	// layer configs
	private List<Layer> layers;

	public MapConfiguration() 
	{
	    // empty constructor
	}

	public MapConfiguration( MapConfiguration mapConfiguration ) 
	{
		this.setLmfId(mapConfiguration.getLmfId());
		this.setLmfRevision(mapConfiguration.getLmfRevision());
		this.setVersion(mapConfiguration.getVersion());
		this.setName(mapConfiguration.getName());
		this.setProject(mapConfiguration.getProject());

		this.setCreatedBy(mapConfiguration.getCreatedBy());
		this.setPublished(mapConfiguration.isPublished());

		this.setSurround(new MapSurround(mapConfiguration.getSurround()));
		this.setViewer(new MapViewer(mapConfiguration.getViewer()));

		if(mapConfiguration.getTools() != null)
		{
			for(Tool tool : mapConfiguration.getTools())
			{
			    cloneTool(tool);
			}
		}

		if(mapConfiguration.getLayers() != null)
		{
			for(Layer layer : mapConfiguration.getLayers())
			{
			    if (layer instanceof EsriDynamic) getLayers().add(new EsriDynamic((EsriDynamic)layer));
			    else if (layer instanceof Vector) getLayers().add(new Vector((Vector)layer));
			    else if (layer instanceof Wms) getLayers().add(new Wms((Wms)layer));
			}
		}
	}

	// required due to sonarqube requirement to not use clone?
	private void cloneTool(Tool tool)
	{
	    if (tool instanceof About) getTools().add(new About((About)tool));
        else if (tool instanceof Attribution) getTools().add(new Attribution((Attribution)tool));
        else if (tool instanceof BaseMaps) getTools().add(new BaseMaps((BaseMaps)tool));
        else if (tool instanceof Coordinate) getTools().add(new Coordinate((Coordinate)tool));
        else if (tool instanceof Directions) getTools().add(new Directions((Directions)tool));
        else if (tool instanceof Dropdown) getTools().add(new Dropdown((Dropdown)tool));
        else if (tool instanceof Identify) getTools().add(new Identify((Identify)tool));
        else if (tool instanceof Layers) getTools().add(new Layers((Layers)tool));
        else if (tool instanceof Location) getTools().add(new Location((Location)tool));
        else if (tool instanceof Markup) getTools().add(new Markup((Markup)tool));
        else if (tool instanceof Measure) getTools().add(new Measure((Measure)tool));
        else if (tool instanceof Menu) getTools().add(new Menu((Menu)tool));
        else if (tool instanceof Minimap) getTools().add(new Minimap((Minimap)tool));
        else if (tool instanceof Pan) getTools().add(new Pan((Pan)tool));
        else if (tool instanceof Query) getTools().add(new Query((Query)tool));
        else if (tool instanceof Scale) getTools().add(new Scale((Scale)tool));
        else if (tool instanceof Search) getTools().add(new Search((Search)tool));
        else if (tool instanceof Select) getTools().add(new Select((Select)tool));
        else if (tool instanceof Zoom) getTools().add(new Zoom((Zoom)tool));
	}
	
	public String getLmfId() { return lmfId; }
	public void setLmfId(String lmfId) { this.lmfId = lmfId; }

	public int getLmfRevision() { return lmfRevision; }
	public void setLmfRevision(int lmfRevision) { this.lmfRevision = lmfRevision; }

	public String getName() { return name; }
	public void setName(String name) { this.name = name; }

	public String getProject() { return this.project; }
	public void setProject(String project) { this.project = project; }

	public boolean isPublished() { return this.published; }
	public void setPublished(boolean published) { this.published = published; }


	public MapSurround getSurround() {
		if ( surround == null ) surround = new MapSurround();
		return this.surround;
	}
	public void setSurround(MapSurround surround) { this.surround = surround; }


	public MapViewer getViewer() {
		if ( viewer == null ) viewer = new MapViewer();
		return this.viewer;
	}
	public void setViewer(MapViewer viewer) { this.viewer = viewer; }


	public List<Tool> getTools() {
		if ( tools == null ) tools = new ArrayList<Tool>();
		return this.tools;
	}
	public void setTools(List<Tool> tools) { this.tools = tools; }


	public List<Layer> getLayers()
	{
		if(layers == null) layers = new ArrayList<Layer>();
		return layers;
	}

	public void setLayers(List<Layer> layers)
	{
		this.layers = layers;
	}

	@Override
	public void addInlineAttachment(Attachment a)
	{
		super.addInlineAttachment(a);
	}

	public Attachment getInlineAttachment(Layer layer)
	{
		return getInlineAttachment(layer.getTitle());
	}

	public Attachment getInlineAttachment(String id)
	{
		return super.getAttachments().get(id);
	}

	public Layer getLayerByID(String layerId)
	{
		for(Layer lyr : getLayers())
		{
			if(lyr.getId().equals(layerId))
			{
				return lyr;
			}
		}

		return null;
	}
	
	public void setVersion(String version)
	{
	    this.version = version;
	}
	
	public String getVersion()
	{
	    return this.version;
	}

	public String getCreatedBy() 
	{ 
	    return this.createdBy; 
	}
	
	public void setCreatedBy(String createdBy) 
	{ 
	    this.createdBy = createdBy; 
	}
	
    public String getCreatedDate()
    {
        return createdDate;
    }

    public void setCreatedDate(String createdDate)
    {
        this.createdDate = createdDate;
    }

    public String getModifiedBy()
    {
        return modifiedBy;
    }

    public void setModifiedBy(String modifiedBy)
    {
        this.modifiedBy = modifiedBy;
    }

    public String getModifiedDate()
    {
        return modifiedDate;
    }

    public void setModifiedDate(String modifiedDate)
    {
        this.modifiedDate = modifiedDate;
    }
}
