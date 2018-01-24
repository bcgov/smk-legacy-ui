package ca.bc.gov.databc.smks.model;

import java.util.ArrayList;
import java.util.List;

import org.ektorp.Attachment;
import org.ektorp.support.CouchDbDocument;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonIgnoreProperties({"id", "revision"})
@JsonInclude(Include.NON_NULL)
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

	// settings
	private String viewerType;
	private boolean showHeader;
	private String headerImage; // the attachment ID for the header image, or the URL.
	private String aboutPage;
	private String defaultBasemap;
	private List<Double> bbox;
	private boolean allowMouseWheelZoom;

	// layer and tool configs
	private List<String> tools; // just the ID's of tools: pan, zoom, directions, markup, measure. Import/export excluded for now?
	private List<Layer> layers;

	// is published indicator
	private boolean isPublished;

	public MapConfiguration()
	{
	}

	public Layer getLayerByID(String layerId)
	{
		Layer resourceLayer = null;

		for(Layer lyr : getLayers())
		{
			if(lyr.getLabel().equals(layerId))
			{
				resourceLayer = lyr;
				break;
			}
		}

		return resourceLayer;
	}

	public String getName()
	{
		return name;
	}

	public void setName(String name)
	{
		this.name = name;
	}

	public boolean isShowHeader()
	{
		return showHeader;
	}

	public void setShowHeader(boolean showHeader)
	{
		this.showHeader = showHeader;
	}

	public String getHeaderImage()
	{
		return headerImage;
	}

	public void setHeaderImage(String headerImage)
	{
		this.headerImage = headerImage;
	}

	public String getAboutPage()
	{
		return aboutPage;
	}

	public void setAboutPage(String aboutPage)
	{
		this.aboutPage = aboutPage;
	}

	public List<String> getTools()
	{
		if(tools == null) tools = new ArrayList<String>();
		return tools;
	}

	public void setTools(List<String> tools)
	{
		this.tools = tools;
	}

	public String getDefaultBasemap()
	{
		return this.defaultBasemap;
	}

	public void setDefaultBasemap(String defaultBasemap)
	{
		this.defaultBasemap = defaultBasemap;
	}

	public List<Layer> getLayers()
	{
		if(layers == null) layers = new ArrayList<Layer>();
		return layers;
	}

	public void setLayers(List<Layer> layers)
	{
		this.layers = layers;
	}

	public String getViewerType()
	{
		return this.viewerType;
	}

	public void setViewerType(String mapType)
	{
		this.viewerType = mapType;
	}

	public boolean isPublished()
	{
		return isPublished;
	}

	public void setPublished(boolean isPublished)
	{
		this.isPublished = isPublished;
	}

	public String getCreatedBy()
	{
		return createdBy;
	}

	public void setCreatedBy(String createdBy)
	{
		this.createdBy = createdBy;
	}

	public void addInlineAttachment(Attachment a)
	{
		super.addInlineAttachment(a);
	}

	public Attachment getInlineAttachment(Layer layer)
	{
		return getInlineAttachment(layer.getLabel());
	}

	public Attachment getInlineAttachment(String id)
	{
		return super.getAttachments().get(id);
	}

	public String getLmfId()
	{
		return lmfId;
	}

	public void setLmfId(String lmfId)
	{
		this.lmfId = lmfId;
	}

	public int getLmfRevision()
	{
		return lmfRevision;
	}

	public void setLmfRevision(int lmfRevision)
{
		this.lmfRevision = lmfRevision;
	}

	public List<Double> getBbox()
	{
		if(bbox == null) bbox = new ArrayList<Double>();
		return bbox;
	}

	public void setBbox(List<Double> bbox)
	{
		this.bbox = bbox;
	}

	public boolean isAllowMouseWheelZoom()
	{
		return allowMouseWheelZoom;
	}

	public void setAllowMouseWheelZoom(boolean allowMouseWheelZoom)
	{
		this.allowMouseWheelZoom = allowMouseWheelZoom;
	}

	public String getProject()
	{
		return this.project;
	}

	public void setProject(String project)
	{
		this.project = project;
	}

	public MapConfiguration clone()
	{
		MapConfiguration clone = new MapConfiguration();

		clone.setAboutPage(aboutPage);
		clone.setAllowMouseWheelZoom(allowMouseWheelZoom);
		clone.setCreatedBy(createdBy);
		clone.setDefaultBasemap(defaultBasemap);
		clone.setHeaderImage(headerImage);
		clone.setLmfId(lmfId);
		clone.setLmfRevision(lmfRevision);
		clone.setName(name);
		clone.setProject(project);
		clone.setPublished(isPublished);
		clone.setShowHeader(showHeader);
		clone.setViewerType(viewerType);

		for(String tool : tools)
		{
			clone.getTools().add(tool);
		}

		for(Double val : bbox)
		{
			clone.getBbox().add(val);
		}

		for(Layer layer : layers)
		{
			clone.getLayers().add(layer.clone());
		}

		return clone;
	}
}
