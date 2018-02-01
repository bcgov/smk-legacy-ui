package ca.bc.gov.databc.smk.beans;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.Serializable;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.annotation.PostConstruct;
import javax.faces.application.FacesMessage;
import javax.faces.bean.ManagedBean;
import javax.faces.bean.ViewScoped;
import javax.faces.context.ExternalContext;
import javax.faces.context.FacesContext;
import javax.faces.convert.Converter;
import javax.xml.parsers.DocumentBuilderFactory;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.ektorp.Attachment;
import org.primefaces.context.RequestContext;
import org.primefaces.event.FileUploadEvent;
import org.primefaces.event.FlowEvent;
import org.primefaces.event.NodeSelectEvent;
import org.primefaces.event.TreeDragDropEvent;
import org.primefaces.model.DefaultTreeNode;
import org.primefaces.model.DualListModel;
import org.primefaces.model.TreeNode;
import org.primefaces.model.UploadedFile;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import ca.bc.gov.databc.smk.controllers.LayerController;
import ca.bc.gov.databc.smk.dao.CouchDAO;
import ca.bc.gov.databc.smk.dao.SMKServiceHandler;
import ca.bc.gov.databc.smks.model.CollectionLayer;
import ca.bc.gov.databc.smks.model.Layer;
import ca.bc.gov.databc.smks.model.LayerStyle;
import ca.bc.gov.databc.smks.model.MapConfiguration;
import ca.bc.gov.databc.smks.model.Tool;
import ca.bc.gov.databc.smks.model.WMSInfoLayer;
import ca.bc.gov.databc.smks.model.WMSInfoStyle;
import ca.bc.gov.databc.smks.model.layer.EsriDynamic;
import ca.bc.gov.databc.smks.model.layer.Geojson;
import ca.bc.gov.databc.smks.model.layer.Kml;
import ca.bc.gov.databc.smks.model.layer.Wms;

@SuppressWarnings("restriction")
@ManagedBean(name="CreateBean", eager=true)
@ViewScoped
public class CreateBean implements Serializable
{
	private static Log logger = LogFactory.getLog(CreateBean.class);

	private static final long serialVersionUID = -4244352433273633895L;

	private MapConfiguration resource;
	private TreeNode layerNodes;
	private TreeNode selectedLayerNode;

	private TreeNode catalog;
	private ArrayList<TreeNode> catalogNodes;

	private DualListModel<Tool> tools;
	private ToolConverter converter;

	// for WMS popup
	private boolean wmsIsVisible;
	private double wmsOpacity = 0.65;
	private String wmsLayerTitle;
	private String wmsServiceUrl = "https://openmaps.gov.bc.ca/geo/pub/ows";
	private String wmsVersion = "1.3.0";
	private WMSInfoLayer selectedServiceLayer;
	private WMSInfoStyle selectedServiceStyle;
	private ArrayList<WMSInfoLayer> allServiceLayers;

	// for Feature Service layer
	private boolean fsIsVisible;
	private double fsOpacity = 0.65;
	private String fsLayerTitle;
	private String fsServiceUrl;
	private String fsLayerId;
	private boolean fsClusterPoints;
	private boolean fsHeatmapPoints;

	// for KML
	private boolean kmlIsVisible;
	private double kmlOpacity = 0.65;
	private String kmlLayerTitle;
	private boolean kmlClusterPoints;
	private boolean kmlHeatmapPoints;
	private String uploadFileAttachmentBytes;
	private String uploadContentType;
	private double kmlStrokeWidth = 1;
	private String kmlStrokeColor = "000";
	private double kmlStrokeOpacity = 1.0;
	private double kmlFillOpacity= 0.65;
	private String kmlFillColor= "000";

	// for json
	private boolean jsonIsVisible;
	private double jsonOpacity = 0.65;
	private String jsonLayerTitle;
	private boolean jsonClusterPoints;
	private boolean jsonHeatmapPoints;
	private double jsonStrokeWidth = 1;
	private String jsonStrokeColor = "000";
	private double jsonStrokeOpacity = 1.0;
	private double jsonFillOpacity= 0.65;
	private String jsonFillColor= "000";

	// public String getViewerType() {
	// 	return resource.getViewerx().getType();
	// }

	@PostConstruct
    public void init()
	{
		converter = new ToolConverter();

		// init the DMF Resource object that will be stored in couch, or read from couch
		resource = new MapConfiguration();
		// resource.setShowHeader(true);
		resource.getViewer().setType("leaflet");
		resource.getViewer().setBaseMap("Topographic");

		// init the root node for the layer listing
		layerNodes = new DefaultTreeNode("root", null);

		// init the tools selector
		List<Tool> toolsSource = new ArrayList<Tool>();
        List<Tool> toolsTarget = new ArrayList<Tool>();
        tools = new DualListModel<Tool>(toolsSource, toolsTarget);

        // check if we're loading an existing resource
        ExternalContext externalContext = FacesContext.getCurrentInstance().getExternalContext();
		Map<String, String> queryString = externalContext.getRequestParameterMap();

		if( !queryString.containsKey("id") ) {
			toolsTarget.add(Tool.Type.pan.create());
			toolsTarget.add(Tool.Type.zoom.create());
			toolsTarget.add(Tool.Type.measure.create());
			toolsTarget.add(Tool.Type.markup.create());
			toolsTarget.add(Tool.Type.directions.create());

		}
		else {
			// load the resource from couch... that's pretty much it.
			try
			{
				FacesContext ctx = FacesContext.getCurrentInstance();
				//String myConstantValue = ctx.getExternalContext().getInitParameter("couchdb");
				String serviceUrl = ctx.getExternalContext().getInitParameter("lmfService");
				SMKServiceHandler service  = new SMKServiceHandler(serviceUrl);

				resource = service.getResource(queryString.get("id"));

				//CouchDAO dao = new CouchDAO(myConstantValue);
				//resource = dao.getResourceByDocId(queryString.get("id"));

				// we have a resource loaded, but the tools and layers won't be configured yet. We should
				// configure these here.

				// recursive layer node creator
				loadLayerNodes(layerNodes, resource.getLayers());

				for ( Tool tool: resource.getTools() ) {
					toolsTarget.add(tool);
				}

				resource.getLayers().clear();
				resource.getTools().clear();

				// set the wms to databc's default
				wmsServiceUrl = "https://openmaps.gov.bc.ca/geo/pub/ows";
				wmsVersion = "1.3.0";
			}
			catch (MalformedURLException e)
			{
				FacesContext.getCurrentInstance().addMessage(null, new FacesMessage(FacesMessage.SEVERITY_ERROR, "Error loading DMF resource:", e.getMessage()));
				e.printStackTrace();
			}
			catch (IOException e)
			{
				FacesContext.getCurrentInstance().addMessage(null, new FacesMessage(FacesMessage.SEVERITY_ERROR, "Error loading DMF resource:", e.getMessage()));
				e.printStackTrace();
			}
		}

		for (Tool.Type toolType : Tool.Type.values() ) {
			if ( toolType == Tool.Type.unknown ) continue;

			Tool t = toolType.create();
			if ( toolsTarget.contains( t ) ) continue;

			toolsSource.add( t );
		}
	}

	public Converter getToolConverter() {
		return converter;
	}

	public void loadLayerNodes(TreeNode parent, List<Layer> children)
	{
		for(Layer child : children)
		{
			TreeNode layerNode = new DefaultTreeNode(child, parent);
			layerNode.setParent(parent);
			parent.getChildren().add(layerNode);

			if ( child instanceof CollectionLayer ) {
				CollectionLayer collection = (CollectionLayer)child;
				if(collection.getLayers().size() > 0) continue;
				loadLayerNodes(layerNode, collection.getLayers());
			}
		}
	}

	public void buildWmsLayerList()
	{
		try
		{
			URL serviceUri = new URL(wmsServiceUrl + "?service=WMS&request=GetCapabilities");

			DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
	        factory.setNamespaceAware(true);
	        Document doc = factory.newDocumentBuilder().parse(serviceUri.openStream());

	        NodeList layerNodes = doc.getElementsByTagName("Layer");

	        allServiceLayers.clear();
	        selectedServiceLayer = null;
	        selectedServiceStyle = null;

		    if (layerNodes != null)
		    {
		        int length = layerNodes.getLength();
		        // ignore the first reference. This is the parent layer, not the sublayer details that we want
		        for (int i = 1; i < length; i++)
		        {
		            if (layerNodes.item(i).getNodeType() == Node.ELEMENT_NODE)
		            {
		                Element layerElement = (Element) layerNodes.item(i);

		                String title = layerElement.getElementsByTagName("Title").item(0).getTextContent();
		                String name = layerElement.getElementsByTagName("Name").item(0).getTextContent();

		                WMSInfoLayer layer = new WMSInfoLayer();
						layer.setTitle( title);
						layer.setName( name);

		                allServiceLayers.add(layer);

		                NodeList layerStyles = layerElement.getElementsByTagName("Style");

		                if (layerStyles != null)
		    		    {
		    		        for (int s = 0; s < layerStyles.getLength(); s++)
		    		        {
		    		        	Element styleElement = (Element) layerStyles.item(s);

								WMSInfoStyle style = new WMSInfoStyle();
								style.setName( styleElement.getElementsByTagName("Name").item(0).getTextContent());
		    		        	layer.getStyles().add(style);
		    		        }
		    		    }
		            }
		        }
		    }

		    RequestContext.getCurrentInstance().update("wmsForm");
		    RequestContext.getCurrentInstance().execute("Materialize.updateTextFields();");
		    RequestContext.getCurrentInstance().execute("closeModal()");
		}
		catch (Exception e)
		{
			FacesContext.getCurrentInstance().addMessage(null, new FacesMessage(FacesMessage.SEVERITY_ERROR, "Error parsing WMS capabilities:", e.getMessage()));
			e.printStackTrace();
		}
	}

	public TreeNode getCatalogLayers()
	{
		if(catalogNodes == null)
		{
			try
			{
				catalogNodes = LayerController.createMpcmLayers();

				catalog = new DefaultTreeNode("Catalog", null);

				for(TreeNode node : catalogNodes)
				{
					if(node.getParent() == null)
					{
						node.setParent(catalog);
						catalog.getChildren().add(node);
					}
				}
			}
			catch (Exception e)
			{
				FacesContext.getCurrentInstance().addMessage(null, new FacesMessage(FacesMessage.SEVERITY_ERROR, "Error loading layers from MPCM", e.getMessage()));
				e.printStackTrace();
			}
		}

		return catalog;
	}

	public void addSelectedLayerMpcm()
	{
		layerNodes.getChildren().add(selectedLayerNode);
		selectedLayerNode.setParent(layerNodes);
		RequestContext.getCurrentInstance().update("createMashupForm:layerList");
		RequestContext.getCurrentInstance().update("mpcmLayerForm:catalog");
		RequestContext.getCurrentInstance().update("mpcmLayerForm:mpcmLayerPanel");
		selectedLayerNode = null;
	}

	public void addSelectedLayerWms()
	{
		if(wmsLayerTitle.equals(""))
		{
			wmsLayerTitle = selectedServiceLayer.getTitle();
		}

		Wms lyr = new Wms();
		lyr.setTitle(wmsLayerTitle);
		lyr.setServiceUrl(wmsServiceUrl);
		lyr.setVersion(wmsVersion);
		lyr.setLayerName(selectedServiceLayer.getName());
		lyr.setStyleName(selectedServiceStyle.getName());
		// lyr.setLayerTypeCode(LayerTypes.wmsLayer);
		// lyr.setId(id);
		lyr.setIsVisible(wmsIsVisible);
		// lyr.setIsSelectable(true);
		// lyr.setIsExportable(true);
	    lyr.setOpacity(wmsOpacity);

		wmsLayerTitle = null;
		selectedServiceLayer = null;
		selectedServiceStyle = null;
		wmsOpacity = 0.65;

		// dont clear the service URL or the layer list
		// just in case the user wants to add something
		// else from the same service

		// create a node to host the layer in the layer list.

		TreeNode wmsNode = new DefaultTreeNode(lyr, layerNodes);
		layerNodes.getChildren().add(wmsNode);
		wmsNode.setParent(layerNodes);

		RequestContext.getCurrentInstance().update("createMashupForm:layerList");
		RequestContext.getCurrentInstance().update("wmsForm");
	    RequestContext.getCurrentInstance().execute("Materialize.updateTextFields();");
	}

	public void addSelectedLayerFeatureService()
	{
		Layer lyr = new Layer();
		lyr.setTitle(fsLayerTitle);
		// lyr.setServiceUrl(fsServiceUrl);
		// lyr.getLayers().add(fsLayerId);
		// lyr.setLayerTypeCode(LayerTypes.featureLayer);
		lyr.setIsVisible(fsIsVisible);
		// lyr.setIsSelectable(true);
		// lyr.setIsExportable(true);
		// lyr.setUseClustering(fsClusterPoints);
		// lyr.setUseHeatmapping(fsHeatmapPoints);
	    lyr.setOpacity(fsOpacity);

	    fsLayerTitle = "";
	    fsLayerId = "";
	    fsIsVisible = false;
	    fsClusterPoints = false;
	    fsHeatmapPoints = false;
	    fsOpacity = 0.65;

	    TreeNode wmsNode = new DefaultTreeNode(lyr, layerNodes);
		layerNodes.getChildren().add(wmsNode);
		wmsNode.setParent(layerNodes);

		RequestContext.getCurrentInstance().update("createMashupForm:layerList");
		RequestContext.getCurrentInstance().update("featureServiceForm");
	    RequestContext.getCurrentInstance().execute("Materialize.updateTextFields();");
	}

	public void addSelectedKml()
	{
		try
	    {
			Kml lyr = new Kml();
			lyr.setTitle(kmlLayerTitle);
			// lyr.setLayerTypeCode(LayerTypes.kmlLayer);
			lyr.setIsVisible(kmlIsVisible);
			// lyr.setIsSelectable(true);
			// lyr.setIsExportable(true);
			lyr.setUseClustering(kmlClusterPoints);
			lyr.setUseHeatmapping(kmlHeatmapPoints);
		    lyr.setOpacity(kmlOpacity);

			LayerStyle style = lyr.getStyle();
		    style.setStrokeWidth(kmlStrokeWidth);
		    style.setStrokeOpacity(kmlStrokeOpacity);
		    style.setStrokeColor(kmlStrokeColor);
		    style.setFillColor(kmlFillColor);
		    style.setFillOpacity(kmlFillOpacity);


		    Attachment kmlAttachment = new Attachment(lyr.getTitle(), uploadFileAttachmentBytes, uploadContentType);
		    resource.addInlineAttachment(kmlAttachment);

		    TreeNode kmlNode = new DefaultTreeNode(lyr, layerNodes);
			layerNodes.getChildren().add(kmlNode);
			kmlNode.setParent(layerNodes);

			RequestContext.getCurrentInstance().update("createMashupForm:layerList");
			RequestContext.getCurrentInstance().update("kmlForm");
		    RequestContext.getCurrentInstance().execute("Materialize.updateTextFields();");
	    }
		catch(Exception e)
		{
			FacesContext.getCurrentInstance().addMessage(null, new FacesMessage(FacesMessage.SEVERITY_ERROR, "Error writing KML document:", e.getMessage()));
			e.printStackTrace();
		}
	}

	public void resetKml() {
		    kmlLayerTitle = "";
		    kmlIsVisible = false;
		    kmlClusterPoints = false;
		    kmlHeatmapPoints = false;
		    kmlOpacity = 0.65;
		    kmlStrokeWidth = 1.0;
		    kmlStrokeOpacity = 1.0;
		    kmlStrokeColor = "000";
		    kmlFillColor = "000";
		    kmlFillOpacity = 0.65;

			RequestContext.getCurrentInstance().update("kmlForm");
		    RequestContext.getCurrentInstance().execute("Materialize.updateTextFields();");
	}

	public void addSelectedJson()
	{
		try
	    {
			Geojson lyr = new Geojson();
			lyr.setTitle(jsonLayerTitle);
			// lyr.setLayerTypeCode(LayerTypes.jsonLayer);
			lyr.setIsVisible(jsonIsVisible);
			// lyr.setIsSelectable(true);
			// lyr.setIsExportable(true);
			lyr.setUseClustering(jsonClusterPoints);
			lyr.setUseHeatmapping(jsonHeatmapPoints);
		    lyr.setOpacity(jsonOpacity);

			LayerStyle style = lyr.getStyle();
		    style.setStrokeWidth(jsonStrokeWidth);
		    style.setStrokeOpacity(jsonStrokeOpacity);
		    style.setStrokeColor(jsonStrokeColor);
		    style.setFillColor(jsonFillColor);
		    style.setFillOpacity(jsonFillOpacity);

		    jsonLayerTitle = "";
		    jsonIsVisible = false;
		    jsonClusterPoints = false;
		    jsonHeatmapPoints = false;
		    jsonOpacity = 0.65;
		    jsonStrokeWidth = 1.0;
		    jsonStrokeOpacity = 1.0;
		    jsonStrokeColor = "000";
		    jsonFillColor = "000";
		    jsonFillOpacity = 0.65;

		    Attachment jsonAttachment = new Attachment(lyr.getTitle(), uploadFileAttachmentBytes, uploadContentType);
		    resource.addInlineAttachment(jsonAttachment);

		    TreeNode jsonNode = new DefaultTreeNode(lyr, layerNodes);
			layerNodes.getChildren().add(jsonNode);
			jsonNode.setParent(layerNodes);

			RequestContext.getCurrentInstance().update("createMashupForm:layerList");
			RequestContext.getCurrentInstance().update("jsonForm");
		    RequestContext.getCurrentInstance().execute("Materialize.updateTextFields();");
	    }
		catch(Exception e)
		{
			FacesContext.getCurrentInstance().addMessage(null, new FacesMessage(FacesMessage.SEVERITY_ERROR, "Error writing KML document:", e.getMessage()));
			e.printStackTrace();
		}
	}

	public void uploadDocument(FileUploadEvent event)
    {
		try
		{
			UploadedFile uploadFile = event.getFile();

			String fullFileName = uploadFile.getFileName();
			String fileName, extension;

			int dotPos = fullFileName.indexOf('.');

			if (dotPos != -1)
			{
				fileName = fullFileName.substring(0, dotPos);
				extension = fullFileName.substring(dotPos);
			}
			else
			{
				fileName = fullFileName;
				extension = "";
			}

			uploadContentType = uploadFile.getContentType();

			File holdingFile = File.createTempFile(fileName + '-', extension);
		    holdingFile.deleteOnExit();
		    uploadFile.write(holdingFile.getAbsolutePath());

		    InputStream finput = new FileInputStream(holdingFile);
		    byte[] docRawBytes = new byte[(int)holdingFile.length()];

		    finput.read(docRawBytes, 0, docRawBytes.length);
		    finput.close();
		    holdingFile.delete();

		    uploadFileAttachmentBytes = Base64.encodeBase64String(docRawBytes);
	    }
		catch(Exception e)
		{
			FacesContext.getCurrentInstance().addMessage(null, new FacesMessage(FacesMessage.SEVERITY_ERROR, "Error writing KML document:", e.getMessage()));
			e.printStackTrace();
		}
    }

	public void removeSelectedLayer()
	{
		TreeNode parent = selectedLayerNode.getParent();
		parent.getChildren().remove(selectedLayerNode);
		// is this an MPCM layer? We can tell because it'll be using a relational tree node
//		if(selectedLayerNode instanceof RelationalTreeNode)
//		{
//			RelationalTreeNode node = (RelationalTreeNode)selectedLayerNode;
//
//			node.clearParent();
//
//			node.setParent(node.getOriginalParent());
//			node.getOriginalParent().getChildren().add(node);
//
//			RequestContext.getCurrentInstance().update("mpcmLayerForm:catalog");
//			RequestContext.getCurrentInstance().update("mpcmLayerForm:mpcmLayerPanel");
//		}

		Layer data = (Layer)selectedLayerNode.getData();

		if(data.getType().equals(Layer.Type.Kml.getJsonType()) || data.getType().equals(Layer.Type.Geojson.getJsonType()))
		{
			if(data.getId() != null)
			{
				// delete the document in the couchDB
				try
				{
					FacesContext ctx = FacesContext.getCurrentInstance();
					String myConstantValue = ctx.getExternalContext().getInitParameter("couchdb");

					CouchDAO dao = new CouchDAO(myConstantValue, "", "");
					dao.deleteAttachment(resource, data);
				}
				catch (MalformedURLException e)
				{
					e.printStackTrace();
				}
			}
		}

		selectedLayerNode = null;
		RequestContext.getCurrentInstance().update("createMashupForm:layerList");
	}

	public void editSelectedLayer()
	{

	}

	public void extractNodeData(TreeNode node, Layer container)
	{
		Layer newContainer = null;

		if(node.getParent() != null)
		{
			Layer data = (Layer) node.getData();

			if(container != null && container instanceof CollectionLayer )
			{
				((CollectionLayer)container).getLayers().add(data);
			}
			else
			{
				resource.getLayers().add(data);
			}

			if(data.getType().equals("folder") || data.getType().equals("groupFolder"))
			{
				newContainer = data;
			}
		}

		for(TreeNode leaf : node.getChildren())
		{
			extractNodeData(leaf, newContainer);
		}
	}

	public void save(boolean publish)
	{
		try
		{
			// push all of the layer node objects into the resource
			extractNodeData(layerNodes, null);

			//push the tools up to the resource
			resource.setTools(tools.getTarget());
			// for ( Tool t: tools.getTarget() ) {
			// 	resource.getTools().add( t );
			// }

			// we've got a complete resource at this point. set the publish flag
			//resource.setPublished(publish);
			if(resource.getCreatedBy() == null || resource.getCreatedBy().length() == 0) resource.setCreatedBy("Tester");

			// new resource, generate a guid
			if(resource.getLmfId() == null)
			{
				//resource.setLmfId(java.util.UUID.randomUUID().toString());
				resource.setLmfId(resource.getName().toLowerCase().replaceAll(" ", "-"));
			}

			// we're done, so write to couch!
			FacesContext ctx = FacesContext.getCurrentInstance();

			String serviceUrl = ctx.getExternalContext().getInitParameter("lmfService");
			SMKServiceHandler service  = new SMKServiceHandler(serviceUrl);

			try
			{
				if(resource.getId() != null && resource.getId().length() > 0)
				{
					service.updateResource(resource);
				}
				else
				{
					service.createResource(resource);
				}

				if(publish)
				{
					service.publish(resource);
				}

			}
			catch (IOException e)
			{
				e.printStackTrace();
			}

			navigateToHome();

		}
		catch (MalformedURLException e)
		{
			FacesContext.getCurrentInstance().addMessage(null, new FacesMessage(FacesMessage.SEVERITY_ERROR, "Error saving DMF document:", e.getMessage()));
			e.printStackTrace();
		}
	}

	public void navigateToHome()
	{
		boolean flag = FacesContext.getCurrentInstance().getExternalContext().isResponseCommitted();
		if (!flag)
		{
		    try
		    {
				FacesContext.getCurrentInstance().getExternalContext().redirect("index.xhtml");
			}
		    catch (IOException e)
		    {
		    	FacesContext.getCurrentInstance().addMessage(null, new FacesMessage(FacesMessage.SEVERITY_ERROR, "Error forwarding to home page:", e.getMessage()));
				e.printStackTrace();
			}
		}
	}

	public void saveAndPublish()
	{
		// save with publish
		save(true);

		// and redirect back to the home page
	}

	public void save()
	{
		// save without publishing
		save(false);

		// and redirect back to the home page
	}

	public void onMpcmNodeSelect(NodeSelectEvent event)
	{
		try
		{
			Layer layer = (Layer)event.getTreeNode().getData();
			if(layer.getType().equals(Layer.Type.EsriDynamic.getJsonType()) && ((EsriDynamic)layer).getDynamicLayers().size() == 0)
			{
				LayerController.loadMpcmLayerDetails((EsriDynamic)layer);
			}

			this.setSelectedLayerNode(event.getTreeNode());

			RequestContext.getCurrentInstance().update("mpcmLayerForm:mpcmLayerPanel");
			RequestContext.getCurrentInstance().execute("Materialize.updateTextFields();");
		}
		catch (Exception e)
		{
			FacesContext.getCurrentInstance().addMessage(null, new FacesMessage(FacesMessage.SEVERITY_ERROR, "Error selecting node:", e.getMessage()));
			e.printStackTrace();
		}
    }

	public void onDragDrop(TreeDragDropEvent event)
	{
        TreeNode dragNode = event.getDragNode();
        TreeNode dropNode = event.getDropNode();
        int dropIndex = event.getDropIndex();

        if(!((Layer)dropNode.getData()).getType().equals("folder") && !((Layer)dropNode.getData()).getType().equals("groupFolder"))
        {
        	dropNode.getChildren().remove(dragNode);
        	dragNode.clearParent();

        	layerNodes.getChildren().add(dragNode);
        	dragNode.setParent(layerNodes);

        	RequestContext.getCurrentInstance().update("createMashupForm:layerList");
        }
    }

    public String onFlowProcess(FlowEvent event)
    {
    	RequestContext.getCurrentInstance().execute("Materialize.updateTextFields();");
        return event.getNewStep();
    }

	public MapConfiguration getResource()
	{
		return resource;
	}

	public void setResource(MapConfiguration resource)
	{
		this.resource = resource;
	}

	public TreeNode getLayerNodes()
	{
		if(layerNodes == null) layerNodes = new DefaultTreeNode("My Layers", null);
		return layerNodes;
	}

	public void setLayerNodes(TreeNode layerNodes)
	{
		this.layerNodes = layerNodes;
	}

	public TreeNode getSelectedLayerNode()
	{
		return selectedLayerNode;
	}

	public void setSelectedLayerNode(TreeNode selectedLayerNode)
	{
		this.selectedLayerNode = selectedLayerNode;
	}

	public DualListModel<Tool> getTools()
	{
		return tools;
	}

	public void setTools(DualListModel<Tool> tools)
	{
		this.tools = tools;
	}

	public String getWmsServiceUrl()
	{
		return wmsServiceUrl;
	}

	public void setWmsServiceUrl(String wmsServiceUrl)
	{
		this.wmsServiceUrl = wmsServiceUrl;
	}

	public String getWmsVersion()
	{
		return wmsVersion;
	}

	public void setWmsVersion(String wmsVersion)
	{
		this.wmsVersion = wmsVersion;
	}

	public WMSInfoLayer getSelectedServiceLayer()
	{
		return selectedServiceLayer;
	}

	public void setSelectedServiceLayer(WMSInfoLayer selectedServiceLayer)
	{
		this.selectedServiceLayer = selectedServiceLayer;
	}

	public WMSInfoStyle getSelectedServiceStyle()
	{
		return selectedServiceStyle;
	}

	public void setSelectedServiceStyle(WMSInfoStyle selectedServiceStyle)
	{
		this.selectedServiceStyle = selectedServiceStyle;
	}

	public ArrayList<WMSInfoLayer> getAllServiceLayers()
	{
		if(allServiceLayers == null) allServiceLayers = new ArrayList<WMSInfoLayer>();
		return allServiceLayers;
	}

	public void setAllServiceLayers(ArrayList<WMSInfoLayer> allServiceLayers)
	{
		this.allServiceLayers = allServiceLayers;
	}

	public String getWmsLayerTitle()
	{
		return this.wmsLayerTitle;
	}

	public void setWmsLayerTitle(String wmsLayerTitle)
	{
		this.wmsLayerTitle = wmsLayerTitle;
	}

	public boolean getWmsIsVisible()
	{
		return wmsIsVisible;
	}

	public void setWmsIsVisible(boolean wmsIsVisible)
	{
		this.wmsIsVisible = wmsIsVisible;
	}

	public double getWmsOpacity()
	{
		return wmsOpacity;
	}

	public void setWmsOpacity(double wmsOpacity)
	{
		this.wmsOpacity = wmsOpacity;
	}

	public boolean isFsIsVisible()
	{
		return fsIsVisible;
	}

	public void setFsIsVisible(boolean fsIsVisible)
	{
		this.fsIsVisible = fsIsVisible;
	}

	public double getFsOpacity()
	{
		return fsOpacity;
	}

	public void setFsOpacity(double fsOpacity)
	{
		this.fsOpacity = fsOpacity;
	}

	public String getFsLayerTitle()
	{
		return fsLayerTitle;
	}

	public void setFsLayerTitle(String fsLayerTitle)
	{
		this.fsLayerTitle = fsLayerTitle;
	}

	public String getFsServiceUrl()
	{
		return fsServiceUrl;
	}

	public void setFsServiceUrl(String fsServiceUrl)
	{
		this.fsServiceUrl = fsServiceUrl;
	}

	public boolean isFsClusterPoints()
	{
		return fsClusterPoints;
	}

	public void setFsClusterPoints(boolean fsClusterPoints)
	{
		this.fsClusterPoints = fsClusterPoints;
	}

	public boolean isFsHeatmapPoints()
	{
		return fsHeatmapPoints;
	}

	public void setFsHeatmapPoints(boolean fsHeatmapPoints)
	{
		this.fsHeatmapPoints = fsHeatmapPoints;
	}

	public String getFsLayerId()
	{
		return fsLayerId;
	}

	public void setFsLayerId(String fsLayerId)
	{
		this.fsLayerId = fsLayerId;
	}

	public boolean getKmlIsVisible()
	{
		return kmlIsVisible;
	}

	public void setKmlIsVisible(boolean kmlIsVisible)
	{
		this.kmlIsVisible = kmlIsVisible;
	}

	public double getKmlOpacity()
	{
		return kmlOpacity;
	}

	public void setKmlOpacity(double kmlOpacity)
	{
		this.kmlOpacity = kmlOpacity;
	}

	public String getKmlLayerTitle()
	{
		return kmlLayerTitle;
	}

	public void setKmlLayerTitle(String kmlLayerTitle)
	{
		this.kmlLayerTitle = kmlLayerTitle;
	}

	public boolean getKmlClusterPoints()
	{
		return kmlClusterPoints;
	}

	public void setKmlClusterPoints(boolean kmlClusterPoints)
	{
		this.kmlClusterPoints = kmlClusterPoints;
	}

	public boolean getKmlHeatmapPoints()
	{
		return kmlHeatmapPoints;
	}

	public void setKmlHeatmapPoints(boolean kmlHeatmapPoints)
	{
		this.kmlHeatmapPoints = kmlHeatmapPoints;
	}

	public double getKmlStrokeWidth()
	{
		return kmlStrokeWidth;
	}

	public void setKmlStrokeWidth(double kmlStrokeWidth)
	{
		this.kmlStrokeWidth = kmlStrokeWidth;
	}

	public String getKmlStrokeColor()
	{
		return kmlStrokeColor;
	}

	public void setKmlStrokeColor(String kmlStrokeColor)
	{
		this.kmlStrokeColor = kmlStrokeColor;
	}

	public double getKmlStrokeOpacity()
	{
		return kmlStrokeOpacity;
	}

	public void setKmlStrokeOpacity(double kmlStrokeOpacity)
	{
		this.kmlStrokeOpacity = kmlStrokeOpacity;
	}

	public double getKmlFillOpacity()
	{
		return kmlFillOpacity;
	}

	public void setKmlFillOpacity(double kmlFillOpacity)
	{
		this.kmlFillOpacity = kmlFillOpacity;
	}

	public String getKmlFillColor()
	{
		return kmlFillColor;
	}

	public void setKmlFillColor(String kmlFillColor)
	{
		this.kmlFillColor = kmlFillColor;
	}

	public boolean isJsonIsVisible()
	{
		return jsonIsVisible;
	}

	public void setJsonIsVisible(boolean jsonIsVisible)
	{
		this.jsonIsVisible = jsonIsVisible;
	}

	public double getJsonOpacity()
	{
		return jsonOpacity;
	}

	public void setJsonOpacity(double jsonOpacity)
	{
		this.jsonOpacity = jsonOpacity;
	}

	public String getJsonLayerTitle()
	{
		return jsonLayerTitle;
	}

	public void setJsonLayerTitle(String jsonLayerTitle)
	{
		this.jsonLayerTitle = jsonLayerTitle;
	}

	public boolean isJsonClusterPoints()
	{
		return jsonClusterPoints;
	}

	public void setJsonClusterPoints(boolean jsonClusterPoints)
	{
		this.jsonClusterPoints = jsonClusterPoints;
	}

	public boolean isJsonHeatmapPoints()
	{
		return jsonHeatmapPoints;
	}

	public void setJsonHeatmapPoints(boolean jsonHeatmapPoints)
	{
		this.jsonHeatmapPoints = jsonHeatmapPoints;
	}

	public double getJsonStrokeWidth()
	{
		return jsonStrokeWidth;
	}

	public void setJsonStrokeWidth(double jsonStrokeWidth)
	{
		this.jsonStrokeWidth = jsonStrokeWidth;
	}

	public String getJsonStrokeColor()
	{
		return jsonStrokeColor;
	}

	public void setJsonStrokeColor(String jsonStrokeColor)
	{
		this.jsonStrokeColor = jsonStrokeColor;
	}

	public double getJsonStrokeOpacity()
	{
		return jsonStrokeOpacity;
	}

	public void setJsonStrokeOpacity(double jsonStrokeOpacity)
	{
		this.jsonStrokeOpacity = jsonStrokeOpacity;
	}

	public double getJsonFillOpacity()
	{
		return jsonFillOpacity;
	}

	public void setJsonFillOpacity(double jsonFillOpacity)
	{
		this.jsonFillOpacity = jsonFillOpacity;
	}

	public String getJsonFillColor()
	{
		return jsonFillColor;
	}

	public void setJsonFillColor(String jsonFillColor)
	{
		this.jsonFillColor = jsonFillColor;
	}
}
