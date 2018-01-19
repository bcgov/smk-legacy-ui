package ca.bc.gov.databc.smks.dao;

import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Calendar;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.w3c.dom.DOMException;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import ca.bc.gov.databc.smks.model.Attribute;
import ca.bc.gov.databc.smks.model.DynamicServiceLayer;
import ca.bc.gov.databc.smks.model.MPCMInfoLayer;
import ca.bc.gov.databc.smks.model.WMSInfoLayer;
import ca.bc.gov.databc.smks.model.WMSInfoStyle;

public class LayerCatalogDAO 
{
	private static Log logger = LogFactory.getLog(LayerCatalogDAO.class);
	
	private String mpcmUri;
	private String arcgisUri;
	private String wmsUri;
	
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
	
	public ArrayList<MPCMInfoLayer> createMpcmLayers() throws Exception
	{
		logger.debug(" >> createMpcmLayers()");
		ArrayList<MPCMInfoLayer> catalogNodes = new ArrayList<MPCMInfoLayer>();
		
		URL mpcmUrl = new URL(mpcmUri);

		logger.debug("Parsing XML result from " + mpcmUri);
	    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        Document doc = factory.newDocumentBuilder().parse(mpcmUrl.openStream());
        
        logger.debug("Successfully parsed xml doc. Looping through nodes...");
        //loop through each root node folder. 
        Element foldersElement = (Element)doc.getElementsByTagName("folders").item(0); 
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
                
                Element subfolderElement = (Element)folder.getElementsByTagName("folders").item(0); 
                
                if(subfolderElement != null)
                {
                	NodeList subfoldersNodes = subfolderElement.getChildNodes();
                	itemId = processFolders(subfoldersNodes, rootLayer, itemId);
                }
                
                Element sublayerElement = (Element)folder.getElementsByTagName("layers").item(0); 
                
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
	
	private int processFolders(NodeList folders, MPCMInfoLayer parent, int id) throws DOMException, SAXException, IOException, ParserConfigurationException
	{
		if (folders != null) 
	    {
	        for (int i = 0; i < folders.getLength(); i++)
	        {
                Element folder = (Element) folders.item(i);
                
                String name = folder.getElementsByTagName("folderName").item(0).getTextContent();
                
                //for each folder, create a root layer object. Add to a tree node. No parent
                
            	MPCMInfoLayer layer = new MPCMInfoLayer();
                
                // populate the rootLayer object with the folder details.
                layer.setId(id);
                layer.setLabel(name);
                
                // finally, add the node and increment the itemId
                parent.getSublayers().add(layer);
                id++;
                
                // Each root node folder may have layer and/or folders within
                // we'll need to add each of them here. 
                
                Element subfolderElement = (Element)folder.getElementsByTagName("folders").item(0); 
                
                if(subfolderElement != null)
                {
                	NodeList subfoldersNodes = subfolderElement.getChildNodes();
                	id = processFolders(subfoldersNodes, layer, id);
                }
                
                Element sublayerElement = (Element)folder.getElementsByTagName("layers").item(0); 
                
                if(sublayerElement != null)
                {
                	NodeList sublayerNodes = sublayerElement.getChildNodes();
                	id = processLayers(sublayerNodes, layer, id);
                }
	        }
	    }
		
		return id;
	}
	
	private int processLayers(NodeList layers, MPCMInfoLayer parent, int id) throws DOMException, SAXException, IOException, ParserConfigurationException
	{
		if (layers != null) 
	    {
	        for (int i = 0; i < layers.getLength(); i++)
	        {
                Element layerElement = (Element) layers.item(i);

            	MPCMInfoLayer layer = new MPCMInfoLayer();
                
                // populate the rootLayer object with the folder details.
                layer.setId(id);
                layer.setMpcmId(new Integer(layerElement.getElementsByTagName("layerId").item(0).getTextContent()));
                layer.setLabel(layerElement.getElementsByTagName("layerDisplayName").item(0).getTextContent());
                layer.setLayerUrl(mpcmUri + layer.getMpcmId());
                
                // finally, add the node and increment the itemId
                parent.getSublayers().add(layer);
                id++;
	        }
	    }
		
		return id;
	}
	
	public DynamicServiceLayer createCatalogLayer(String id) throws SAXException, IOException, ParserConfigurationException
	{
		logger.debug(" >> createCatalogLayer()");
		DynamicServiceLayer layer = new DynamicServiceLayer();
        URL mpcmUrl = new URL(mpcmUri + id);

        logger.debug("Parsing XML result from " + mpcmUri + id);
        
	    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        Document doc = factory.newDocumentBuilder().parse(mpcmUrl.openStream());

        logger.debug("Successfully parsed XML. Creating Catalog Layer...");
        
        layer.setMpcmWorkspace(doc.getElementsByTagName("workspaceName").item(0).getTextContent());
        layer.setId(new Integer(id));
        layer.setMpcmId(new Integer(doc.getElementsByTagName("layerId").item(0).getTextContent()));
        layer.setLabel(doc.getElementsByTagName("layerDisplayName").item(0).getTextContent());
        
        // append the dynamic layer details
        layer.setServiceUrl(arcgisUri); // databc arcgis address
        layer.getDynamicLayers().add(doc.getElementsByTagName("dynamicJson").item(0).getTextContent());
        layer.setAttribution("Copyright " + Calendar.getInstance().get(Calendar.YEAR) + " DataBC, Government of British Columbia" );
        layer.setMinScale(new Double(doc.getElementsByTagName("minScale").item(0).getTextContent()));
        layer.setMaxScale(new Double(doc.getElementsByTagName("maxScale").item(0).getTextContent()));
        
        // properties from MPCM
        Element propertiesElement = (Element) doc.getElementsByTagName("properties").item(0);
        NodeList propertiesNodes = propertiesElement.getChildNodes();
        if (propertiesNodes != null) 
	    {
	        for (int p = 0; p < propertiesNodes.getLength(); p++)
	        {
	        	if (propertiesNodes.item(p).getNodeType() == Node.ELEMENT_NODE ) 
	            {
	                Element el = (Element) propertiesNodes.item(p);
	                String type = el.getElementsByTagName("key").item(0).getTextContent();
	                String value = el.getElementsByTagName("value").item(0).getTextContent();
	                
	                layer.setOpacity(0.65);
	                
	                if(type.equals("metadata.url"))
	                {
	                	layer.setMetadataUrl(value);
	                }
	                //else if(type.equals("extractable"))
	                //{
	                //	layer.setIsExportable(new Boolean(value));
	                //}
	                else if(type.equals("visible"))
	                {
	                	layer.setIsVisible(new Boolean(value));
	                }
	            }
	        }
	    }
        
        // attributes
        NodeList fieldNodes = doc.getElementsByTagName("field");

	    if (fieldNodes != null) 
	    {
	        for (int i = 0; i < fieldNodes.getLength(); i++) 
	        {
	            if (fieldNodes.item(i).getNodeType() == Node.ELEMENT_NODE) 
	            {
	                Element el = (Element) fieldNodes.item(i);
	             
	                Attribute attribute = new Attribute();
	                
	                attribute.setName(el.getElementsByTagName("fieldName").item(0).getTextContent());
	                attribute.setAlias(el.getElementsByTagName("fieldAlias").item(0).getTextContent());
	                attribute.setVisible(Boolean.parseBoolean(el.getElementsByTagName("visible").item(0).getTextContent()));
	                
	                if(attribute.getVisible())
	                {
	                	layer.getAttributes().add(attribute);
	                }
	            }
	        }
	    }
	    
	    logger.debug("Successfully created layer " + layer.getLabel());
	    logger.debug(" << createCatalogLayer()");
	    return layer;
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
	        int length = layerNodes.getLength();
	        // ignore the first reference. This is the parent layer, not the sublayer details that we want
	        for (int i = 1; i < length; i++) 
	        {
	            if (layerNodes.item(i).getNodeType() == Node.ELEMENT_NODE) 
	            {
	                Element layerElement = (Element) layerNodes.item(i);
	                
	                String title = layerElement.getElementsByTagName("Title").item(0).getTextContent();
	                String name = layerElement.getElementsByTagName("Name").item(0).getTextContent();
	               
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
		    		        	if(metadataElement.getNodeName().equals("OnlineResource"))
		    		        	{
		    		        		layer.setMetadataUrl(metadataElement.getAttributes().getNamedItem("xlink:href").getNodeValue());
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
	    		        	
	    		        	String styleName = styleElement.getElementsByTagName("Name").item(0).getTextContent();
	    		        	String styleTitle = styleElement.getElementsByTagName("Title").item(0).getTextContent();
	    		        	
	    		        	WMSInfoStyle style = new WMSInfoStyle();
	    		        	style.setName(styleName);
	    		        	style.setTitle(styleTitle);
	    		        	
	    		        	layer.getStyles().add(style);
	    		        	
	    		        	NodeList styleNodes = styleElement.getElementsByTagName("LegendURL").item(0).getChildNodes();
	    		        		
	    		        	for (int sn = 0; sn < styleNodes.getLength(); sn++) 
			    		    {
		    		        	Node styleNodeElement = styleNodes.item(sn);
		    		        	
		    		        	if(styleNodeElement.getNodeName().equals("Format"))
		    		        	{
		    		        		String format = styleNodeElement.getNodeValue();
		    		        		style.setFormat(format);
		    		        	}
		    		        	else if(styleNodeElement.getNodeName().equals("OnlineResource"))
		    		        	{
		    		        		String url = styleNodeElement.getAttributes().getNamedItem("xlink:href").getNodeValue();
		    		        		style.setLegendUrl(url);
		    		        	}
		    		        }
	    		        }
	    		    }
	            }
	        }
	    }
        
        logger.debug("Successfully created layer " + layer.getTitle());
        logger.debug(" << createWmsLayer()");
        return layer;
	}
}
