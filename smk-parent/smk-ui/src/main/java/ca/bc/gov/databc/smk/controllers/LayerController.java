package ca.bc.gov.databc.smk.controllers;

import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Date;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.primefaces.model.DefaultTreeNode;
import org.primefaces.model.TreeNode;
import org.w3c.dom.DOMException;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import ca.bc.gov.databc.smk.model.Attribute;
import ca.bc.gov.databc.smk.model.Layer;
import ca.bc.gov.databc.smk.model.RelationalTreeNode;
import ca.bc.gov.databc.smk.model.Layer.LayerTypes;

public class LayerController 
{
	public static ArrayList<TreeNode> createMpcmLayers() throws SAXException, IOException, ParserConfigurationException
	{
		ArrayList<TreeNode> catalogNodes = new ArrayList<TreeNode>();
		
		URL mpcmUrl = new URL("https://apps.gov.bc.ca/pub/mpcm/services/catalog/PROD");

	    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        Document doc = factory.newDocumentBuilder().parse(mpcmUrl.openStream());
        
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
                
                Layer rootLayer = new Layer();
                TreeNode root = new DefaultTreeNode(rootLayer, null);
                
                // populate the rootLayer object with the folder details.
                rootLayer.setLayerTypeCode(LayerTypes.folder);
                rootLayer.setId(itemId);
                rootLayer.setLabel(folder.getElementsByTagName("folderName").item(0).getTextContent());
                
                // finally, add the node and increment the itemId
                catalogNodes.add(root);
                itemId++;
                
                // Each root node folder may have layer and/or folders within
                // we'll need to add each of them here. 
                
                Element subfolderElement = (Element)folder.getElementsByTagName("folders").item(0); 
                
                if(subfolderElement != null)
                {
                	NodeList subfoldersNodes = subfolderElement.getChildNodes();
                	itemId = processFolders(subfoldersNodes, root, itemId);
                }
                
                Element sublayerElement = (Element)folder.getElementsByTagName("layers").item(0); 
                
                if(sublayerElement != null)
                {
                	NodeList sublayerNodes = sublayerElement.getChildNodes();
                	itemId = processLayers(sublayerNodes, root, itemId);
                }
                
                // remove any empty folders. We don't want them polluting the workspace.
                
	        }
	    }
        
        return catalogNodes;
	}
	
	/**
	 * Process the sub fodlers of the main nodes, returns the last used ID number
	 * @param folders
	 * @param parent
	 * @param id
	 * @return
	 * @throws ParserConfigurationException 
	 * @throws IOException 
	 * @throws SAXException 
	 * @throws DOMException 
	 */
	private static int processFolders(NodeList folders, TreeNode parent, int id) throws DOMException, SAXException, IOException, ParserConfigurationException
	{
		if (folders != null) 
	    {
	        for (int i = 0; i < folders.getLength(); i++)
	        {
                Element folder = (Element) folders.item(i);
                
                String name = folder.getElementsByTagName("folderName").item(0).getTextContent();
                
                if(!name.toLowerCase().contains("- internal"))
                {
	                //for each folder, create a root layer object. Add to a tree node. No parent
	                
	                Layer layer = new Layer();
	                TreeNode layerNode = new RelationalTreeNode(layer, parent);
	                
	                // populate the rootLayer object with the folder details.
	                layer.setLayerTypeCode(LayerTypes.folder);
	                layer.setId(id);
	                layer.setLabel(name);
	                
	                // finally, add the node and increment the itemId
	                layerNode.setParent(parent);
	                parent.getChildren().add(layerNode);
	                id++;
	                
	                // Each root node folder may have layer and/or folders within
	                // we'll need to add each of them here. 
	                
	                Element subfolderElement = (Element)folder.getElementsByTagName("folders").item(0); 
	                
	                if(subfolderElement != null)
	                {
	                	NodeList subfoldersNodes = subfolderElement.getChildNodes();
	                	id = processFolders(subfoldersNodes, layerNode, id);
	                }
	                
	                Element sublayerElement = (Element)folder.getElementsByTagName("layers").item(0); 
	                
	                if(sublayerElement != null)
	                {
	                	NodeList sublayerNodes = sublayerElement.getChildNodes();
	                	id = processLayers(sublayerNodes, layerNode, id);
	                }
                }
	        }
	    }
		
		return id;
	}
	
	public static void loadMpcmLayerDetails(Layer layer) throws SAXException, IOException, ParserConfigurationException
	{
		if(layer.getMpcmId() != null)
		{
			//fetch the whole thing. We can use the data for a preview window
	        URL mpcmUrl = new URL("https://apps.gov.bc.ca/pub/mpcm/services/catalog/PROD/" + layer.getMpcmId());
	
		    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
	        factory.setNamespaceAware(true);
	        Document doc = factory.newDocumentBuilder().parse(mpcmUrl.openStream());
	
	        layer.setMpcmWorkspace(doc.getElementsByTagName("workspaceName").item(0).getTextContent());
	            
	        // append the dynamic layer details
	        layer.setServiceUrl("http://maps.gov.bc.ca/arcgis/rest/services/mpcm/bcgw/MapServer"); // databc arcgis address
	        layer.getDynamicLayers().add(doc.getElementsByTagName("dynamicJson").item(0).getTextContent());
	        layer.setAttribution("Copyright " + new Date().getYear() + " DataBC, Government of British Columbia" );
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
		                
		                layer.setIsSelectable(false);
		                layer.setOpacity(0.65);
		                
		                if(type.equals("metadata.url"))
		                {
		                	layer.setMetadataUrl(value);
		                }
		                else if(type.equals("extractable"))
		                {
		                	layer.setIsExportable(new Boolean(value));
		                }
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
		}
	}
	
	// this process is really slow, because we're loading all of the details up front
	// remove the init loading, and have the process only load layers when they're selected in the tree.
	public static int processLayers(NodeList layers, TreeNode parent, int id) throws DOMException, SAXException, IOException, ParserConfigurationException
	{
		if (layers != null) 
	    {
	        for (int i = 0; i < layers.getLength(); i++)
	        {
                Element layerElement = (Element) layers.item(i);
                
                String name = layerElement.getElementsByTagName("layerDisplayName").item(0).getTextContent();
                
                if(!name.toLowerCase().contains("- internal"))
                {
	                Layer layer = new Layer();
	                TreeNode layerNode = new RelationalTreeNode(layer, parent);
	                
	                // populate the rootLayer object with the folder details.
	                layer.setLayerTypeCode(LayerTypes.dynamicServiceLayer);
	                layer.setId(id);
	                layer.setMpcmId(new Integer(layerElement.getElementsByTagName("layerId").item(0).getTextContent()));
	                layer.setLabel(layerElement.getElementsByTagName("layerDisplayName").item(0).getTextContent());
	                
	                // finally, add the node and increment the itemId
	                layerNode.setParent(parent);
	                parent.getChildren().add(layerNode);
	                id++;
                }
	        }
	    }
		
		return id;
	}
	
	public static void createWmsLayer()
	{
		
	}
	
	public static void createFeatureLayer()
	{
		
	}
	
	public static void createDynamicLayer()
	{
		
	}
	
	public static void createKmlLayer()
	{
		
	}
	
	public static void createGeoJsonLayer()
	{
		
	}
}
