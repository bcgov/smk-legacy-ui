package ca.bc.gov.app.smks.dao;

import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import ca.bc.gov.app.smks.SMKException;
import ca.bc.gov.app.smks.model.Attribute;
import ca.bc.gov.app.smks.model.MPCMInfoLayer;
import ca.bc.gov.app.smks.model.WMSInfoLayer;
import ca.bc.gov.app.smks.model.WMSInfoStyle;
import ca.bc.gov.app.smks.model.layer.EsriDynamic;

public class LayerCatalogDAO
{
	private static Log logger = LogFactory.getLog(LayerCatalogDAO.class);

	private String mpcmUri;
	private String arcgisUri;
	private String wmsUri;

	private static final String PARSING_FROM_MSG = "Parsing XML result from ";
	private static final String FOLDERS = "folders";
	private static final String LAYERS = "layers";
    private static final String LAYER_DISPLAY_NAME = "layerDisplayName";
	
    private static final String NAME_UC = "Name";
    private static final String NAME_LC = "Name";
    private static final String TITLE = "Title";
    private static final String FORMAT = "Format";
    private static final String LEGENDURL = "LegendURL";
    private static final String ONLINERESOURCE = "OnlineResource";
    private static final String XLINK_HREF = "xlink:href";
    
	public LayerCatalogDAO(String mpcmUri, String arcgisUri, String wmsUri)
	{
		logger.info("Initializing Layer Catalog DAO with the following settings:");
		logger.info(" - MPCM uri: " + mpcmUri);
		logger.info(" - ArcGIS uri: " + arcgisUri);
		logger.info(" - WMS uri: " + wmsUri);

		this.mpcmUri = mpcmUri;
		this.arcgisUri = arcgisUri;
		this.wmsUri = wmsUri;
	}

	public List<MPCMInfoLayer> createMpcmLayers() throws SMKException, SAXException, IOException, ParserConfigurationException
	{
		logger.debug(" >> createMpcmLayers()");
		List<MPCMInfoLayer> catalogNodes = new ArrayList<MPCMInfoLayer>();

		URL mpcmUrl = new URL(mpcmUri);

		logger.debug(PARSING_FROM_MSG + mpcmUri);
	    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        Document doc = factory.newDocumentBuilder().parse(mpcmUrl.openStream());

        logger.debug("Successfully parsed xml doc. Looping through nodes...");
        //loop through each root node folder.
        Element foldersElement = (Element)doc.getElementsByTagName(FOLDERS).item(0);
        NodeList foldersNodes = foldersElement.getChildNodes();

        int itemId = 1;

        if (foldersNodes != null)
	    {
	        for (int i = 0; i < foldersNodes.getLength(); i++)
	        {
                Element folder = (Element) foldersNodes.item(i);

                //for each folder, create a root layer object. Add to a tree node. No parent

                MPCMInfoLayer rootLayer = new MPCMInfoLayer();

                // populate the rootLayer object with the folder details.
                rootLayer.setId(itemId);
                rootLayer.setLabel(folder.getElementsByTagName("folderName").item(0).getTextContent());

                // finally, add the node and increment the itemId
                catalogNodes.add(rootLayer);
                itemId++;

                // Each root node folder may have layer and/or folders within
                // we'll need to add each of them here.

                Element subfolderElement = (Element)folder.getElementsByTagName(FOLDERS).item(0);

                if(subfolderElement != null)
                {
                	NodeList subfoldersNodes = subfolderElement.getChildNodes();
                	itemId = processFolders(subfoldersNodes, rootLayer, itemId);
                }

                Element sublayerElement = (Element)folder.getElementsByTagName(LAYERS).item(0);

                if(sublayerElement != null)
                {
                	NodeList sublayerNodes = sublayerElement.getChildNodes();
                	itemId = processLayers(sublayerNodes, rootLayer, itemId);
                }

                // remove any empty folders. We don't want them polluting the workspace.

	        }
	    }

        logger.debug("Completed processing nodes. Found " + catalogNodes.size() + " entities (folders and layers)");
        logger.debug(" << createMpcmLayers()");
        return catalogNodes;
	}

	private int processFolders(NodeList folders, MPCMInfoLayer parent, int id) throws SAXException, IOException, ParserConfigurationException
	{
		if (folders != null)
	    {
	        for (int i = 0; i < folders.getLength(); i++)
	        {
                Element folder = (Element) folders.item(i);

                String name = folder.getElementsByTagName("folderName").item(0).getTextContent();
            	if(!name.toLowerCase().contains("(internal access)") && !name.toLowerCase().contains(" - internal"))
                //for each folder, create a root layer object. Add to a tree node. No parent
            	{
	            	MPCMInfoLayer layer = new MPCMInfoLayer();
	
	                // populate the rootLayer object with the folder details.
	                layer.setId(id);
	                layer.setLabel(name);
	
	                // finally, add the node and increment the itemId
	                parent.getSublayers().add(layer);
	                id++;
	
	                // Each root node folder may have layer and/or folders within
	                // we'll need to add each of them here.
	
	                Element subfolderElement = (Element)folder.getElementsByTagName(FOLDERS).item(0);
	
	                if(subfolderElement != null)
	                {
	                	NodeList subfoldersNodes = subfolderElement.getChildNodes();
	                	id = processFolders(subfoldersNodes, layer, id);
	                }
	
	                Element sublayerElement = (Element)folder.getElementsByTagName(LAYERS).item(0);
	
	                if(sublayerElement != null)
	                {
	                	NodeList sublayerNodes = sublayerElement.getChildNodes();
	                	id = processLayers(sublayerNodes, layer, id);
	                }
            	}
	        }
	    }

		return id;
	}

	private int processLayers(NodeList layers, MPCMInfoLayer parent, int id)
	{
		if (layers != null)
	    {
	        for (int i = 0; i < layers.getLength(); i++)
	        {
                Element layerElement = (Element) layers.item(i);

            	MPCMInfoLayer layer = new MPCMInfoLayer();

            	// trim anything flagged as internal access.
            	// temporary solution until MPCM rest service returns workspace properly
            	String layerName = layerElement.getElementsByTagName(LAYER_DISPLAY_NAME).item(0).getTextContent();
            	if(!layerName.toLowerCase().contains("(internal access)") && !layerName.toLowerCase().contains(" - internal"))
            	{
	                // populate the rootLayer object with the folder details.
	                layer.setId(id);
	                layer.setMpcmId(new Integer(layerElement.getElementsByTagName("layerId").item(0).getTextContent()));
	                layer.setLabel(layerElement.getElementsByTagName(LAYER_DISPLAY_NAME).item(0).getTextContent());
	                layer.setLayerUrl(mpcmUri + layer.getMpcmId());
	
	                // finally, add the node and increment the itemId
	                parent.getSublayers().add(layer);
	                id++;
            	}
	        }
	    }

		return id;
	}

	public EsriDynamic createCatalogLayer(String id) throws SMKException, SAXException, IOException, ParserConfigurationException
	{
		logger.debug(" >> createCatalogLayer()");
		EsriDynamic layer = new EsriDynamic();
        URL mpcmUrl = new URL(mpcmUri + id);

        logger.debug(PARSING_FROM_MSG + mpcmUri + id);

	    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        Document doc = factory.newDocumentBuilder().parse(mpcmUrl.openStream());

        logger.debug("Successfully parsed XML. Creating Catalog Layer...");

        layer.setMpcmWorkspace(doc.getElementsByTagName("workspaceName").item(0).getTextContent());
        layer.setId(doc.getElementsByTagName(LAYER_DISPLAY_NAME).item(0).getTextContent().toLowerCase().replaceAll(" ", "-").replaceAll("[^A-Za-z0-9]", "-"));
        layer.setMpcmId(new Integer(doc.getElementsByTagName("layerId").item(0).getTextContent()));
        layer.setTitle(doc.getElementsByTagName(LAYER_DISPLAY_NAME).item(0).getTextContent());

        // append the dynamic layer details
        layer.setServiceUrl(arcgisUri); // databc arcgis address
        layer.getDynamicLayers().add(doc.getElementsByTagName("dynamicJson").item(0).getTextContent());
        layer.setAttribution("Copyright " + Calendar.getInstance().get(Calendar.YEAR) + " DataBC, Government of British Columbia" );
        layer.setMinScale(new Double(doc.getElementsByTagName("minScale").item(0).getTextContent()));
        layer.setMaxScale(new Double(doc.getElementsByTagName("maxScale").item(0).getTextContent()));
        layer.setIsVisible(true);

        // properties from MPCM
        Element propertiesElement = (Element) doc.getElementsByTagName("properties").item(0);
        NodeList propertiesNodes = propertiesElement.getChildNodes();
        if (propertiesNodes != null)
	    {
	        for (int p = 0; p < propertiesNodes.getLength(); p++)
	        {
	            processPropertiesNode(propertiesNodes.item(p), layer);
	        }
	    }

        // attributes
        NodeList fieldNodes = doc.getElementsByTagName("field");

	    if (fieldNodes != null)
	    {
	        for (int i = 0; i < fieldNodes.getLength(); i++)
	        {
	            processFolderNode(fieldNodes.item(i), layer);
	        }
	    }

	    if(!layer.getMpcmWorkspace().equalsIgnoreCase("MPCM_ALL_PUB"))
	    {
	    	logger.debug(layer.getTitle() + " is not a public layer. Cancelling process...");
	    	throw new SMKException(layer.getTitle() + " is not a public layer. Cancelling process...");
	    }
	    
	    logger.debug("Successfully created layer " + layer.getTitle());
	    logger.debug(" << createCatalogLayer()");
	    return layer;
	}

	private void processPropertiesNode(Node propertyNode, EsriDynamic layer)
	{
	    if (propertyNode.getNodeType() == Node.ELEMENT_NODE )
        {
            Element el = (Element) propertyNode;
            String type = el.getElementsByTagName("key").item(0).getTextContent();
            String value = el.getElementsByTagName("value").item(0).getTextContent();

            layer.setOpacity(0.65);

            if(type.equals("metadata.url"))
            {
                layer.setMetadataUrl(value);
            }
            else if(type.equals("visible"))
            {
                layer.setIsVisible(new Boolean(value));
            }
        }
	}
	
	private void processFolderNode(Node folderNode, EsriDynamic layer)
	{
	    if (folderNode.getNodeType() == Node.ELEMENT_NODE)
        {
            Element el = (Element) folderNode;

            Attribute attribute = new Attribute();

            attribute.setName(el.getElementsByTagName("fieldName").item(0).getTextContent());
            attribute.setTitle(el.getElementsByTagName("fieldAlias").item(0).getTextContent());
            attribute.setVisible(Boolean.parseBoolean(el.getElementsByTagName("visible").item(0).getTextContent()));
            attribute.setId(convertNameToId(attribute.getName()));
            
            if(attribute.getVisible())
            {
                layer.getAttributes().add(attribute);
            }
        }
	}
	
	public static String convertNameToId( String name ) 
	{
		return name.toLowerCase().replaceAll("[^0-9a-z]+", "-").replaceAll("^[-]+", "").replaceAll("[-]+$", "");
    }
	
	public List<WMSInfoLayer> createWmsLayers(String url) throws SAXException, IOException, ParserConfigurationException
	{
		logger.debug(" >> createWmsLayers()");
		
		List<WMSInfoLayer> serviceLayers = new ArrayList<WMSInfoLayer>();
		
		URL wmsUrl = new URL(url);

		logger.debug(PARSING_FROM_MSG + wmsUrl);
	    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        Document doc = factory.newDocumentBuilder().parse(wmsUrl.openStream());

        logger.debug("Successfully parsed xml doc. Looping through nodes...");
        
        NodeList layerNodes = doc.getElementsByTagName("Layer");

	    if (layerNodes != null)
	    {
	        // ignore the first reference. This is the parent layer, not the sublayer details that we want
	        for (int i = 1; i < layerNodes.getLength(); i++)
	        {
	            if (layerNodes.item(i).getNodeType() == Node.ELEMENT_NODE)
	            {
	                processWmsLayerNode((Element)layerNodes.item(i), serviceLayers, url);
	            }
	        }
	    }
        
		logger.debug(" << createWmsLayers()");
		
		return serviceLayers;
	}
	
	private void processWmsLayerNode(Element layerElement, List<WMSInfoLayer> serviceLayers, String url)
	{
        String title = layerElement.getElementsByTagName(TITLE).item(0).getTextContent();
        String name = layerElement.getElementsByTagName(NAME_UC).item(0).getTextContent();

        WMSInfoLayer layer = new WMSInfoLayer();
        layer.setTitle(title);
        layer.setName(name);

        serviceLayers.add(layer);

        NodeList layerStyles = layerElement.getElementsByTagName("Style");

        List<WMSInfoStyle> styles = layer.getStyles();
        if (layerStyles != null)
        {
            for (int styleIndex = 0; styleIndex < layerStyles.getLength(); styleIndex++)
            {
                Element styleElement = (Element) layerStyles.item(styleIndex);

                WMSInfoStyle style = new WMSInfoStyle();
                style.setName( styleElement.getElementsByTagName(NAME_UC).item(0).getTextContent());
                style.setTitle( styleElement.getElementsByTagName(TITLE).item(0).getTextContent().replace("_", " "));

                if (!styles.contains(style)) styles.add(style);
            }
        }
        
        // see if we can get the attribute list
        // https://openmaps.gov.bc.ca/geo/pub/wms?service=WFS&version=1.1.0&request=DescribeFeatureType&typename=WHSE_LEGAL_ADMIN_BOUNDARIES.OATS_ALR_POLYS&outputformat=application%2Fjson
        try
        {
            String wfsUrl = url.split("\\?")[0] + "?service=WFS&version=1.1.0&request=DescribeFeatureType&typename=" + name + "&outputformat=application%2Fjson";
            
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode node = objectMapper.readValue(new URL(wfsUrl), JsonNode.class);
            
            JsonNode properties = node.get("featureTypes").get(0).get("properties");
            for(int propertyIndex = 0; propertyIndex < properties.size(); propertyIndex++)
            {
                JsonNode property = properties.get(propertyIndex);
                
                if(!property.get("localType").asText().equals("Geometry"))
                {
                    Attribute attr = new Attribute();
                    
                    attr.setId(property.get(NAME_LC).asText());
                    attr.setName(property.get(NAME_LC).asText());
                    attr.setTitle(property.get(NAME_LC).asText());
                    attr.setVisible(true);
                    
                    layer.getAttributes().add(attr);
                }
            }
        }
        catch(Exception e)
        {
            logger.debug("WFS Attributes could not be found for " + name);
            // we can't add attributes, but may as well at least load up the layer
            // so don't fail hard here
        }
	}
	
	public WMSInfoLayer createWmsLayer(String id) throws SAXException, IOException, ParserConfigurationException
	{
		logger.debug(" >> createWmsLayer()");

		String serviceUrlString = wmsUri + id + "/ows?service=WMS";
		URL serviceUri = new URL(serviceUrlString + "&request=GetCapabilities");

		WMSInfoLayer layer = new WMSInfoLayer();
		layer.setServiceUrl(serviceUrlString);

		logger.debug("Parsing XML GetCapabilities result from " + serviceUrlString + "&request=GetCapabilities");

		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        Document doc = factory.newDocumentBuilder().parse(serviceUri.openStream());

        logger.debug("Successfully parsed XML. Creating WMS Layer...");

        layer.setWmsVersion(doc.getDocumentElement().getAttributes().getNamedItem("version").getNodeValue());

        NodeList layerNodes = doc.getElementsByTagName("Layer");

        if (layerNodes != null)
	    {
	        // ignore the first reference. This is the parent layer, not the sublayer details that we want
	        for (int i = 1; i < layerNodes.getLength(); i++)
	        {
	            if (layerNodes.item(i).getNodeType() == Node.ELEMENT_NODE)
	            {
	                processWmsLayerNode((Element) layerNodes.item(i), layer);
	            }
	        }
	    }

        logger.debug("Successfully created layer " + layer.getTitle());
        logger.debug(" << createWmsLayer()");
        return layer;
	}
	
	private void processWmsLayerNode(Element layerElement, WMSInfoLayer layer)
	{
        String title = layerElement.getElementsByTagName(TITLE).item(0).getTextContent();
        String name = layerElement.getElementsByTagName(NAME_UC).item(0).getTextContent();

        layer.setName(name);
        layer.setTitle(title);

        Node metadata = layerElement.getElementsByTagName("MetadataURL").item(0);

        if (metadata != null && metadata.getChildNodes() != null)
        {
            for (int s = 0; s < metadata.getChildNodes().getLength(); s++)
            {
                if (metadata.getChildNodes().item(s).getNodeType() == Node.ELEMENT_NODE)
                {
                    Element metadataElement = (Element) metadata.getChildNodes().item(s);
                    if(metadataElement.getNodeName().equals(ONLINERESOURCE))
                    {
                        layer.setMetadataUrl(metadataElement.getAttributes().getNamedItem(XLINK_HREF).getNodeValue());
                        break;
                    }
                }
            }
        }

        NodeList layerStyles = layerElement.getElementsByTagName("Style");

        if (layerStyles != null)
        {
            for (int s = 0; s < layerStyles.getLength(); s++)
            {
                Element styleElement = (Element) layerStyles.item(s);

                String styleName = styleElement.getElementsByTagName(NAME_UC).item(0).getTextContent();
                String styleTitle = styleElement.getElementsByTagName(TITLE).item(0).getTextContent();

                WMSInfoStyle style = new WMSInfoStyle();
                style.setName(styleName);
                style.setTitle(styleTitle);

                layer.getStyles().add(style);

                NodeList styleNodes = styleElement.getElementsByTagName(LEGENDURL).item(0).getChildNodes();

                for (int sn = 0; sn < styleNodes.getLength(); sn++)
                {
                    Node styleNodeElement = styleNodes.item(sn);

                    if(styleNodeElement.getNodeName().equals(FORMAT))
                    {
                        String format = styleNodeElement.getNodeValue();
                        style.setFormat(format);
                    }
                    else if(styleNodeElement.getNodeName().equals(ONLINERESOURCE))
                    {
                        String url = styleNodeElement.getAttributes().getNamedItem(XLINK_HREF).getNodeValue();
                        style.setLegendUrl(url);
                    }
                }
            }
        }
	}
}
