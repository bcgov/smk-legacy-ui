package ca.bc.gov.app.smks.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import org.ektorp.Attachment;
import org.ektorp.support.CouchDbDocument;

@JsonIgnoreProperties({"id", "revision"})
@JsonInclude(Include.NON_DEFAULT)
public class MapConfiguration extends CouchDbDocument implements Cloneable
{
	private static final long serialVersionUID = -8711804469072616248L;

	// ID and naming
	private String lmfId;
	private int lmfRevision;
	private String name;
	private String project;

	// metadata
	private String createdBy;
	private boolean published; // is published indicator

	// settings
	private MapSurround surround;
	private MapViewer viewer;
//	private MapTools tools;

	// private String viewerType;
	// private boolean showHeader;
	// private String headerImage; // the attachment ID for the header image, or the URL.
	// private String aboutPage;
	// private String defaultBasemap;
	// private List<Double> bbox;
	// private boolean allowMouseWheelZoom;

	// // layer and tool configs
    private List<Tool> tools;
	// layer configs
	private List<Layer> layers;

	public MapConfiguration() {}

	protected MapConfiguration( MapConfiguration mapConfiguration ) 
	{
		this.setLmfId(mapConfiguration.getLmfId());
		this.setLmfRevision(mapConfiguration.getLmfRevision());
		this.setName(mapConfiguration.getName());
		this.setProject(mapConfiguration.getProject());

		this.setCreatedBy(mapConfiguration.getCreatedBy());
		this.setPublished(mapConfiguration.isPublished());

		this.setSurround(mapConfiguration.getSurround().clone());
		this.setViewer(mapConfiguration.getViewer().clone());

		if(mapConfiguration.getTools() != null)
		{
			for(Tool tool : mapConfiguration.getTools())
			{
				getTools().add(tool.clone());
			}
		}

		if(mapConfiguration.getLayers() != null)
		{
			for(Layer layer : mapConfiguration.getLayers())
			{
				getLayers().add(layer.clone());
			}
		}
	}

	public String getLmfId() { return lmfId; }
	public void setLmfId(String lmfId) { this.lmfId = lmfId; }

	public int getLmfRevision() { return lmfRevision; }
	public void setLmfRevision(int lmfRevision) { this.lmfRevision = lmfRevision; }

	public String getName() { return name; }
	public void setName(String name) { this.name = name; }

	public String getProject() { return this.project; }
	public void setProject(String project) { this.project = project; }


	public String getCreatedBy() { return this.createdBy; }
	public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

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


	public MapConfiguration clone()
	{
		MapConfiguration clone = new MapConfiguration( this );

		return clone;
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
}
