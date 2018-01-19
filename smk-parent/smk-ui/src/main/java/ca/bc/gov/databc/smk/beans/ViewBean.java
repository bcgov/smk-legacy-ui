package ca.bc.gov.databc.smk.beans;

import java.io.IOException;
import java.io.Serializable;
import java.io.StringReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import javax.annotation.PostConstruct;
import javax.faces.application.FacesMessage;
import javax.faces.bean.ManagedBean;
import javax.faces.bean.ViewScoped;
import javax.faces.context.ExternalContext;
import javax.faces.context.FacesContext;
import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonReader;
import javax.xml.parsers.DocumentBuilderFactory;

import org.primefaces.context.RequestContext;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import ca.bc.gov.databc.smk.dao.CouchDAO;
import ca.bc.gov.databc.smk.dao.SMKServiceHandler;
import ca.bc.gov.databc.smk.model.Attribute;
import ca.bc.gov.databc.smk.model.DMFResource;
import ca.bc.gov.databc.smk.model.Layer;
import ca.bc.gov.databc.smk.model.Layer.LayerTypes;

@SuppressWarnings("restriction")
@ManagedBean(name="ViewBean", eager=true)
@ViewScoped
public class ViewBean implements Serializable
{
	private static final long serialVersionUID = -2177139413897969637L;

	private DMFResource resource;
	private CouchDAO dao;
	private HashMap<String, Document> loadedMpcmAttributes;
	private String contentStyle;
	private boolean showPublishedVersion;
	private String serviceUrl;

	@PostConstruct
    public void init()
	{
		ExternalContext externalContext = FacesContext.getCurrentInstance().getExternalContext();
		Map<String, String> queryString = externalContext.getRequestParameterMap();
		showPublishedVersion = true;

		if(queryString.containsKey("id"))
		{
			// load the resource from couch... that's pretty much it.
			try
			{
				FacesContext ctx = FacesContext.getCurrentInstance();
				String myConstantValue = ctx.getExternalContext().getInitParameter("couchdb");

				dao = new CouchDAO(myConstantValue, "", "");

				serviceUrl = ctx.getExternalContext().getInitParameter("lmfService");
				SMKServiceHandler service  = new SMKServiceHandler(serviceUrl);

				String version = null;
				if(queryString.containsKey("version"))
				{
					version = queryString.get("version");
					showPublishedVersion = false;
				}

				if(version == null) resource = service.getPublishedResource(queryString.get("id"));
				else resource = service.getResource(queryString.get("id"), version);

				//resource = dao.getResourceByDocId(queryString.get("id"));

				loadedMpcmAttributes = new HashMap<String, Document>();

				contentStyle = resource.isShowHeader() ? "height: calc(100vh - 80px); width: 100%"
													   : "height: 100%; width: 100%";

				if(queryString.containsKey("view"))
				{
					String mapType = queryString.get("view");

					if(mapType.equals("leaflet") || mapType.equals("esri2d") || mapType.equals("esri3d"))
					{
						resource.setViewerType(mapType);
					}
				}

				if(resource.getViewerType().equals("leaflet"))
				{
					initLeaflet();
				}
				else if(resource.getViewerType().equals("esri2d"))
				{
					initEsri2d();
				}
				else
				{
					initEsri3d();
				}
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
	}

	public void initLeaflet()
	{
		// initialize basemap buttons
		RequestContext.getCurrentInstance().execute("initBasemapButton('Topographic')");
		RequestContext.getCurrentInstance().execute("initBasemapButton('Streets')");
		RequestContext.getCurrentInstance().execute("initBasemapButton('Imagery')");
		RequestContext.getCurrentInstance().execute("initBasemapButton('Oceans')");
		RequestContext.getCurrentInstance().execute("initBasemapButton('NationalGeographic')");
		RequestContext.getCurrentInstance().execute("initBasemapButton('DarkGray')");
		RequestContext.getCurrentInstance().execute("initBasemapButton('Gray')");

		// set the basemap
		RequestContext.getCurrentInstance().execute("setBasemap('" + resource.getDefaultBasemap() + "')");

		// initialize markup tools
		if(resource.getTools().contains("Markup"))
		{
			RequestContext.getCurrentInstance().execute("initMarkupTools()");
		}

		if(resource.getTools().contains("Measure"))
		{
			RequestContext.getCurrentInstance().execute("initMeasureTools()");
		}

		// add the layers
		int id = 0;
		for(Layer layer : resource.getLayers())
		{
			// create a string for the layer id's, if applicable
			String layerString = "[";
			for(String lyr : layer.getLayers())
			{
				layerString += "'" + lyr + "',";
			}
			if(layerString.length() > 1)
				layerString = layerString.substring(0, layerString.length() - 1);

			layerString += "]";

			// create a string for the dynamic layer ids if applicable
			String dynamicLayerString = "[";
			for(String lyr : layer.getDynamicLayers())
			{
				dynamicLayerString += lyr + ",";
			}

			if(dynamicLayerString.length() > 1)
				dynamicLayerString = dynamicLayerString.substring(0, dynamicLayerString.length() - 1);

			dynamicLayerString += "]";

			if(layer.getLayerTypeCode().equals(LayerTypes.dynamicServiceLayer)) // from MPCM only. Users can only supply custom feature services
			{
				// if this is from MPCM, then the layer list will be the mpcm id
				if(layer.getMpcmId() != null) layerString = "[" + layer.getMpcmId().toString() + "]";

				RequestContext.getCurrentInstance().execute("addEsriDynamicLayer(" + id + ", '" + layer.getServiceUrl() + "', '" + layer.getLabel() + "', " + layerString + ", " + layer.getOpacity().toString() + ", " + dynamicLayerString + ", '" + layer.getMetadataUrl() + "', " + (layer.getIsVisible() ? "true" : "false") + ")");
			}
			else if(layer.getLayerTypeCode().equals(LayerTypes.featureLayer))
			{
				RequestContext.getCurrentInstance().execute("addEsriFeatureLayer(" + id + ", '" + layer.getServiceUrl() + "', '" + layer.getLayers().get(0) + "', '" + layer.getLabel() + "', " + layer.getOpacity().toString() + ", " + (layer.getIsVisible() ? "true" : "false") + ")");
			}
			else if(layer.getLayerTypeCode().equals(LayerTypes.folder))
			{

			}
			else if(layer.getLayerTypeCode().equals(LayerTypes.group))
			{

			}
			else if(layer.getLayerTypeCode().equals(LayerTypes.jsonLayer))
			{
				try
				{
					String url = "";
					if(showPublishedVersion) url = serviceUrl + "MapConfigurations/Published/";
					else url = serviceUrl + "MapConfigurations/";

					// create style json element
					String style = "{color: \"#" + layer.getStrokeColor() + "\", weight: " + layer.getStrokeWidth() + ", opacity: " + layer.getStrokeOpacity() + ", fillOpacity: " + layer.getFillOpacity() + ", fillColor: \"#" + layer.getFillColor() + "\"}";
					RequestContext.getCurrentInstance().execute("addJsonLayer('" + serviceUrl + "', " + id + ", '" + resource.getLmfId() + "', '" + layer.getLabel() + "', " + (layer.getUseClustering() ? "true" : "false") + ", " + (layer.getUseHeatmapping() ? "true" : "false") + ", " + (layer.getIsVisible() ? "true" : "false") + ", " + style + ")");
				}
				catch(Exception e)
				{
					e.printStackTrace();
				}
			}
			else if(layer.getLayerTypeCode().equals(LayerTypes.kmlLayer))
			{
				try
				{
					String url = "";
					if(showPublishedVersion) url = serviceUrl + "MapConfigurations/Published/";
					else url = serviceUrl + "MapConfigurations/";

					// create style json element
					String style = "{color: \"#" + layer.getStrokeColor() + "\", weight: " + layer.getStrokeWidth() + ", opacity: " + layer.getStrokeOpacity() + ", fillOpacity: " + layer.getFillOpacity() + ", fillColor: \"#" + layer.getFillColor() + "\"}";
					RequestContext.getCurrentInstance().execute("addKmlLayer('" + url + "', " + id + ", '" + resource.getLmfId() + "', '" + layer.getLabel() + "', " + (layer.getUseClustering() ? "true" : "false") + ", " + (layer.getUseHeatmapping() ? "true" : "false") + ", " + (layer.getIsVisible() ? "true" : "false") + ", " + style + ")");
				}
				catch(Exception e)
				{
					e.printStackTrace();
				}
			}
			else if(layer.getLayerTypeCode().equals(LayerTypes.wmsLayer))
			{
				RequestContext.getCurrentInstance().execute("addWmsLayer(" + id + ", '" + layer.getServiceUrl() + "', '" + layer.getWmsVersion() + "', '" + layer.getWmsStyle() + "', " + layerString + ", '" + (layer.getAttribution() == null ? "Copyright 2017 DataBC" : layer.getAttribution()) + "', " + layer.getOpacity().toString() + ", '" + layer.getLabel() + "', " + (layer.getIsVisible() ? "true" : "false") + ")");
			}

			id++;
		}
	}

	@SuppressWarnings("rawtypes")
	public void buildDynamicMpcmResults()
	{
		try
		{
			FacesContext context = FacesContext.getCurrentInstance();
		    Map map = context.getExternalContext().getRequestParameterMap();
		    String layerId = (String) map.get("layerId");
		    String bindDiv = (String) map.get("div");
		    String attr = (String) map.get("attr");

		    JsonReader jsonReader = Json.createReader(new StringReader(attr));
        	JsonObject attributeJson = jsonReader.readObject();
        	jsonReader.close();

        	Document doc;

        	if(!loadedMpcmAttributes.containsKey(layerId))
        	{
			    // call MPCM and get attribute list
			    URL mpcmUrl = new URL("https://apps.gov.bc.ca/pub/mpcm/services/catalog/PROD/" + layerId);

			    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		        factory.setNamespaceAware(true);
		        doc = factory.newDocumentBuilder().parse(mpcmUrl.openStream());

		        loadedMpcmAttributes.put(layerId, doc);
        	}
        	else
        	{
        		doc = loadedMpcmAttributes.get(layerId);
        	}

	        //get attribute stream from documents
	        NodeList fieldNodes = doc.getElementsByTagName("field");

	        JsonObjectBuilder attrResultsBuilder = Json.createObjectBuilder();

	        Layer thisLayer = null;
	        // get the resource attributes, if they exist
	        for(Layer layer : resource.getLayers())
	        {
	        	if(layer.getMpcmId() != null && layer.getMpcmId() == Integer.parseInt(layerId))
	        	{
	        		thisLayer = layer;
	        		break;
	        	}
	        }

		    if (fieldNodes != null)
		    {
		        for (int i = 0; i < fieldNodes.getLength(); i++)
		        {
		            if (fieldNodes.item(i).getNodeType() == Node.ELEMENT_NODE)
		            {
		                Element el = (Element) fieldNodes.item(i);

		                String name = el.getElementsByTagName("fieldName").item(0).getTextContent();
		                String alias = el.getElementsByTagName("fieldAlias").item(0).getTextContent();
		                Boolean showField = Boolean.parseBoolean(el.getElementsByTagName("visible").item(0).getTextContent());

		                if(thisLayer != null && thisLayer.getAttributes().size() > 0)
		    	        {
		    		        for (Attribute attribute : thisLayer.getAttributes())
		    		        {
		    		        	if(attribute.getName().equals(name))
		    		        	{
		    		        		alias = attribute.getAlias();
		    		        		showField = attribute.getVisible();
		    		        		break;
		    		        	}
		    		        }
		    	        }

		                if(showField != null && showField)
		                {
		                	// find in attributeJson
		                	String val = attributeJson.get(name).toString();
		                	attrResultsBuilder.add(alias, val);
		                }
		            }
		        }
		    }

		    // return array with values to client
		    RequestContext.getCurrentInstance().execute("bindIdentifyAttributeList('" + bindDiv + "', " + attrResultsBuilder.build().toString() + ")");
		}
		catch(Exception e)
		{
			e.printStackTrace();
		}
	}

	public void initEsri2d()
	{

	}

	public void initEsri3d()
	{
		// esri 3d uses dojo. We need to process the dojo init first
		// once the dojo init is complete, it'll trigger an ajax call
		// to esri3dInit and any other init methods
		// we can remove this method if there's nothing else we need to trigger on ViewBean init
	}

	public void esri3dInit()
	{
		// set the initial basemap
		RequestContext.getCurrentInstance().execute("triggerSetBasemap('" + resource.getDefaultBasemap() + "')");

		if(resource.getTools().contains("Markup") || resource.getTools().contains("Measure"))
		{
			RequestContext.getCurrentInstance().execute("triggerMarkupTools()");
		}

		// add the layers
		for(Layer layer : resource.getLayers())
		{
			// create a string for the dynamic layer ids if applicable
			String dynamicLayerString = "[";
			for(String lyr : layer.getDynamicLayers())
			{
				dynamicLayerString += lyr + ",";
			}

			if(dynamicLayerString.length() > 1)
				dynamicLayerString = dynamicLayerString.substring(0, dynamicLayerString.length() - 1);

			dynamicLayerString += "]";

			if(layer.getLayerTypeCode().equals(LayerTypes.dynamicServiceLayer)) // from MPCM only. Users can only supply custom feature services
			{
				String popupTemplate = createPopupTemplate(layer);
				RequestContext.getCurrentInstance().execute("triggerBuildMpcmLayer('" + layer.getLabel() + "', '" + layer.getServiceUrl() + "', " + layer.getMpcmId() + ", " + dynamicLayerString + ", " + (layer.getIsVisible() ? "true" : "false") + ", " + layer.getOpacity() + ", '" + layer.getMetadataUrl() + "', " + layer.getMinScale() + ", " + layer.getMaxScale() + ", '" + popupTemplate + "')");
			}
			else if(layer.getLayerTypeCode().equals(LayerTypes.wmsLayer))
			{
				RequestContext.getCurrentInstance().execute("triggerCreateWmsLayer('" + layer.getLabel() + "', '" + layer.getServiceUrl() + "', '" + layer.getWmsVersion() + "', '" + layer.getLayers().get(0) + "', '" + layer.getWmsStyle() + "', '" + layer.getAttribution() + "', " + (layer.getIsVisible() ? "true" : "false") + ", " + layer.getOpacity() + ")");
			}
		}
	}

	public String createPopupTemplate(Layer layer)
	{
		String result = "";

		try
		{
			Document doc;

		    // call MPCM and get attribute list
		    URL mpcmUrl = new URL("https://apps.gov.bc.ca/pub/mpcm/services/catalog/PROD/" + layer.getMpcmId());

		    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
	        factory.setNamespaceAware(true);
	        doc = factory.newDocumentBuilder().parse(mpcmUrl.openStream());

	      //get attribute stream from documents
	        NodeList fieldNodes = doc.getElementsByTagName("field");

	        JsonObjectBuilder popupBuilder = Json.createObjectBuilder();
		    popupBuilder.add("title", layer.getLabel());

		    JsonObjectBuilder popupContentObject = Json.createObjectBuilder();
            popupContentObject.add("type", "fields");
	        JsonArrayBuilder contentFieldsArray = Json.createArrayBuilder();

	        if (fieldNodes != null)
		    {
		        for (int i = 0; i < fieldNodes.getLength(); i++)
		        {
		            if (fieldNodes.item(i).getNodeType() == Node.ELEMENT_NODE)
		            {
		                Element el = (Element) fieldNodes.item(i);

		                String name = el.getElementsByTagName("fieldName").item(0).getTextContent();
		                String alias = el.getElementsByTagName("fieldAlias").item(0).getTextContent();
		                Boolean showField = Boolean.parseBoolean(el.getElementsByTagName("visible").item(0).getTextContent());

		                if(layer.getAttributes().size() > 0)
		    	        {
		    		        for (Attribute attr : layer.getAttributes())
		    		        {
		    		        	if(attr.getName().equals(name))
		    		        	{
		    		        		alias = attr.getAlias();
		    		        		showField = attr.getVisible();
		    		        		break;
		    		        	}
		    		        }
		    	        }

		                if(showField != null && showField && !alias.toUpperCase().equals("SHAPE") && !alias.toUpperCase().equals("GEOMETRY") && !alias.toUpperCase().equals("OBJECTID"))
		                {
		                	JsonObjectBuilder fieldBuilder = Json.createObjectBuilder();

		                	fieldBuilder.add("fieldName", name);
			                fieldBuilder.add("label", alias);
			                fieldBuilder.add("visible", true);

		                	contentFieldsArray.add(fieldBuilder.build());
		                }
		            }
		        }
		    }

		    popupContentObject.add("fieldInfos", contentFieldsArray);

		    JsonArrayBuilder contentArray = Json.createArrayBuilder();
            contentArray.add(popupContentObject);

		    popupBuilder.add("content", contentArray);

		    result = popupBuilder.build().toString();
		}
		catch(Exception e)
		{
			e.printStackTrace();
		}

		return result;
	}

	public DMFResource getResource()
	{
		return resource;
	}

	public void setResource(DMFResource resource)
	{
		this.resource = resource;
	}

	public String getContentStyle()
	{
		return contentStyle;
	}

	public void setContentStyle(String contentStyle)
	{
		this.contentStyle = contentStyle;
	}
}
