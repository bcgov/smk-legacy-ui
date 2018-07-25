package ca.bc.gov.app.smks.converter;

import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.DataStore;
import org.geotools.data.DataStoreFinder;
import org.geotools.data.FeatureSource;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.FeatureIterator;
import org.geotools.geometry.jts.JTS;
import org.geotools.referencing.CRS;
import org.opengis.feature.Feature;
import org.opengis.feature.GeometryAttribute;
import org.opengis.feature.Property;
import org.opengis.geometry.MismatchedDimensionException;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.referencing.operation.MathTransform;
import org.opengis.referencing.operation.TransformException;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.MultiLineString;
import com.vividsolutions.jts.geom.MultiPoint;
import com.vividsolutions.jts.geom.MultiPolygon;
import com.vividsolutions.jts.geom.Point;
import com.vividsolutions.jts.geom.Polygon;

import ca.bc.gov.app.smks.model.LayerStyle;
import net.lingala.zip4j.core.ZipFile;
import net.lingala.zip4j.exception.ZipException;

public class DocumentConverterFactory 
{
	private static Log logger = LogFactory.getLog(DocumentConverterFactory.class);
	
	public enum DocumentType { KML, KMZ, WKT, GML, CSV, SHAPE };
	
	private static final String WGS84_WKT = "GEOGCS[" + "\"WGS 84\"," + "  DATUM[" + "    \"WGS_1984\","
	        + "    SPHEROID[\"WGS 84\",6378137,298.257223563,AUTHORITY[\"EPSG\",\"7030\"]],"
	        + "    TOWGS84[0,0,0,0,0,0,0]," + "    AUTHORITY[\"EPSG\",\"6326\"]],"
	        + "  PRIMEM[\"Greenwich\",0,AUTHORITY[\"EPSG\",\"8901\"]],"
	        + "  UNIT[\"DMSH\",0.0174532925199433,AUTHORITY[\"EPSG\",\"9108\"]],"
	        + "  AXIS[\"Lat\",NORTH]," + "  AXIS[\"Long\",EAST],"
	        + "  AUTHORITY[\"EPSG\",\"4326\"]]";
	
	private static final String BCALBERS_WKT = "PROJCS[\"NAD83 / BC Albers\","
	        + "GEOGCS[\"NAD83\", "
	        + "  DATUM[\"North_American_Datum_1983\", "
	        + "    SPHEROID[\"GRS 1980\", 6378137.0, 298.257222101, AUTHORITY[\"EPSG\",\"7019\"]], "
	        + "    TOWGS84[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], "
	        + "    AUTHORITY[\"EPSG\",\"6269\"]], "
	        + "  PRIMEM[\"Greenwich\", 0.0, AUTHORITY[\"EPSG\",\"8901\"]], "
	        + "  UNIT[\"degree\", 0.017453292519943295], "
	        + "  AXIS[\"Lon\", EAST], "
	        + "  AXIS[\"Lat\", NORTH], "
	        + "  AUTHORITY[\"EPSG\",\"4269\"]], "
	        + "PROJECTION[\"Albers_Conic_Equal_Area\"], "
	        + "PARAMETER[\"central_meridian\", -126.0], "
	        + "PARAMETER[\"latitude_of_origin\", 45.0], "
	        + "PARAMETER[\"standard_parallel_1\", 50.0], "
	        + "PARAMETER[\"false_easting\", 1000000.0], "
	        + "PARAMETER[\"false_northing\", 0.0], "
	        + "PARAMETER[\"standard_parallel_2\", 58.5], "
	        + "UNIT[\"m\", 1.0], "
	        + "AXIS[\"x\", EAST], "
	        + "AXIS[\"y\", NORTH], "
	        + "AUTHORITY[\"EPSG\",\"3005\"]]";
	
	public static byte[] convertDocument(byte[] document, DocumentType docType) throws SAXException, IOException, ParserConfigurationException, ZipException, MismatchedDimensionException, FactoryException, TransformException
	{
		if(docType == DocumentType.KML)
		{
			return convertKmlDocument(document);
		}
		else if(docType == DocumentType.KMZ)
		{
			return convertKmzDocument(document);
		}
		else if(docType == DocumentType.WKT)
		{
			return convertWktDocument(document);
		}
		else if(docType == DocumentType.GML)
		{
			return convertGmlDocument(document);
		}
		else if(docType == DocumentType.CSV)
		{
			return convertCsvDocument(document);
		}
		else if(docType == DocumentType.SHAPE)
		{
			return convertShapeDocument(document);
		}
		else return null;
	}
	
	private static byte[] convertKmlDocument(byte[] document) throws SAXException, IOException, ParserConfigurationException
	{
		ObjectNode convertedJson = JsonNodeFactory.instance.objectNode();
		convertedJson.put("type", "FeatureCollection");
		ArrayNode featureArray = convertedJson.putArray("features");
		
		logger.debug("Parsing KML xml from document...");
	    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        
        ByteArrayInputStream docStream = new ByteArrayInputStream(document);
        
        Document doc = factory.newDocumentBuilder().parse(docStream);
        logger.debug("Successfully parsed KML doc. Looping through placemarks...");
        
        docStream.close();
        docStream = null;
        
        // Process the placemark geometry
        NodeList featureNodes = doc.getElementsByTagName("Placemark");
        
        if (featureNodes != null)
	    {
	        int length = featureNodes.getLength();
	        for (int featureIndex = 0; featureIndex < length; featureIndex++)
	        {
	            if (featureNodes.item(featureIndex).getNodeType() == Node.ELEMENT_NODE)
	            {
	                Element feature = (Element) featureNodes.item(featureIndex);
	                ObjectNode featureJson = featureArray.addObject();
	                
	                featureJson.put("type", "Feature");
	                ObjectNode jsonProperties = featureJson.putObject("properties");
	                
	                // add the style ID as a property
	                jsonProperties.put("styleUrl", feature.getElementsByTagName("styleUrl").item(0).getTextContent());
	                
	                // determine geometry type
	                ObjectNode geometryObject = featureJson.putObject("geometry");
	                
	                NodeList geoms = null;
	                
	                geoms = feature.getElementsByTagName("MultiGeometry");
	                if(geoms != null && geoms.getLength() > 0)
                	{
	                	// we have a multigeom section
	                	geometryObject.put("type", "GeometryCollection");
	                	ArrayNode multiGeoms = geometryObject.putArray("geometries");
	                	
	                	for(int geomIndex = 0; geomIndex < geoms.getLength(); geomIndex++)
	                	{
	                		if(geoms.item(geomIndex).getNodeType() == Node.ELEMENT_NODE)
	                		{
	                			Element innerFeature = (Element) geoms.item(geomIndex); 
	                			ObjectNode innerGeomObject = multiGeoms.addObject();
	                			NodeList innerGeoms = null;
	        	                
	                			innerGeoms = innerFeature.getElementsByTagName("Point");
	        	                if(innerGeoms != null && innerGeoms.getLength() > 0) processKmlGeometry(innerGeomObject, innerGeoms, "Point");
	        	                
	        	                innerGeoms = innerFeature.getElementsByTagName("Polygon");
	        	                if(innerGeoms != null && innerGeoms.getLength() > 0) processKmlGeometry(innerGeomObject, innerGeoms, "Polygon");
	        	                
	        	                innerGeoms = innerFeature.getElementsByTagName("LineString");
	        	                if(innerGeoms != null && innerGeoms.getLength() > 0) processKmlGeometry(innerGeomObject, innerGeoms, "LineString");
	                		}
	                	}
	                }
	                else
	                {
	                	geoms = feature.getElementsByTagName("Point");
		                if(geoms != null && geoms.getLength() > 0) processKmlGeometry(geometryObject, geoms, "Point");
		                
		                geoms = feature.getElementsByTagName("Polygon");
		                if(geoms != null && geoms.getLength() > 0) processKmlGeometry(geometryObject, geoms, "Polygon");
		                
		                geoms = feature.getElementsByTagName("LineString");
		                if(geoms != null && geoms.getLength() > 0) processKmlGeometry(geometryObject, geoms, "LineString");
	                }
	                
	                // fetch "description" attribute
	                if(feature.getElementsByTagName("description").getLength() != 0)
	                {
		                String description = feature.getElementsByTagName("description").item(0).getTextContent();
		                jsonProperties.put("description", description);
	                }
	                
	                // read ExtendedData properties, if they exist
	                if(feature.getElementsByTagName("ExtendedData").getLength() != 0)
	                {
	                    HashMap<String, String> attributeData = new HashMap<String, String>();
	                    
	                    NodeList attributes = feature.getElementsByTagName("ExtendedData").item(0).getChildNodes();
	                    int attrlength = attributes.getLength();
	                    for (int attrIndex = 0; attrIndex < attrlength; attrIndex++)
	                    {
	                        if (attributes.item(attrIndex).getNodeType() == Node.ELEMENT_NODE)
	                        {
	                            Element attribute = (Element) attributes.item(attrIndex);
	                            
	                            if(attribute.getTagName().equals("Data"))
	                            {
    	                            try
    	                            {
        	                            // We now have a Data tag. read the name
        	                            String attrName = attribute.getAttribute("name");
        	                            // check if there is a displayName tag. If so, Use that instead
        	                            if(attribute.getElementsByTagName("displayName").getLength() != 0)
        	                            {
        	                                attrName = attribute.getElementsByTagName("displayName").item(0).getTextContent();
        	                            }
        	                            
        	                            // clean the attrName to get rid of spaces. They aren't allowed in the Json
        	                            attrName = attrName.replace(" ", "-");
        	                            
        	                            // now get the value
        	                            String attrVal = attribute.getElementsByTagName("value").item(0).getTextContent();
        	                            
        	                            // if the KML contains more than one of the same attribute name (invalid!)
        	                            // this will silently overwrite it.
        	                            if(attrName != null && attrName.length() > 0) attributeData.put(attrName, attrVal);
    	                            }
    	                            catch(Exception e)
    	                            {
    	                                // Likely the doc is invalid here, but we don't really want to stop checking.
    	                                logger.debug("Invalid attribute in KML!");
    	                            }
	                            }
	                        }
	                    }
	                    
	                    // go through attribute final list and create properties
	                    for(String attr : attributeData.keySet())
	                    {
	                        jsonProperties.put(attr, attributeData.get(attr));
	                    }
	                }
	            }
	        }
	    }
        
        // Now that the json object is built, convert it to bytes and send back
        byte[] result = null;
        
        if(convertedJson != null)
        {
        	String resultText = convertedJson.toString();
        	result = resultText.getBytes("UTF-8");
        }
        
		return result;
	}
	
	private static void processKmlGeometry(ObjectNode geometryObject, NodeList geoms, String type)
	{
		if(type.equals("Point"))
		{
			geometryObject.put("type", "Point");
			ArrayNode coords = geometryObject.putArray("coordinates");
			
			String kmlCoords = geoms.item(0).getFirstChild().getNextSibling().getTextContent().trim().replaceAll("\\r\\n|\\r|\\n", " ");
			coords.add(new BigDecimal(kmlCoords.split(",")[0])); //x
			coords.add(new BigDecimal(kmlCoords.split(",")[1])); //y
			//coords.add(new BigDecimal(kmlCoords.split(",")[2])); //z
		}
		else if(type.equals("Polygon"))
		{
			geometryObject.put("type", "Polygon");
			ArrayNode coordGroups = geometryObject.putArray("coordinates");
			// add the exterior ring
			for(int ringIndex = 0; ringIndex < geoms.getLength(); ringIndex++)
			{
				if (geoms.item(ringIndex).getNodeType() == Node.ELEMENT_NODE)
	            {
	                Element ring = (Element) geoms.item(ringIndex);
	                
	                //find all outer boundaries
	                NodeList outerRings = ring.getElementsByTagName("outerBoundaryIs");
	                NodeList innerRings = ring.getElementsByTagName("innerBoundaryIs");
	                
	                for(int index = 0; index < outerRings.getLength(); index++)
	    			{
	                	if (outerRings.item(index).getNodeType() == Node.ELEMENT_NODE)
	    	            {
	    	                Element outerRing = (Element) outerRings.item(index);
	    	                
	    	                ArrayNode innerCoordArray = coordGroups.addArray();
		                	
		                	// ring.Boundary.LinearRing.coordinates
		                	String kmlCoords = outerRing.getFirstChild().getFirstChild().getFirstChild().getTextContent().trim().replaceAll("\\r\\n|\\r|\\n", " ");
		                	for(String coord : kmlCoords.split(" "))
		        			{
		        				ArrayNode polyCoordArray = innerCoordArray.addArray();
		        				polyCoordArray.add(new BigDecimal(coord.split(",")[0])); //x
		        				polyCoordArray.add(new BigDecimal(coord.split(",")[1])); //y
		        				//innerCoordArray.add(new BigDecimal(coord.split(",")[2])); //z
		        			}
	    	            }
	    			}
	                
	                for(int index = 0; index < innerRings.getLength(); index++)
	    			{
	                	if (innerRings.item(index).getNodeType() == Node.ELEMENT_NODE)
	    	            {
	    	                Element innerRing = (Element) innerRings.item(index);
	    	                
	    	                ArrayNode innerCoordArray = coordGroups.addArray();
		                	
		                	// ring.Boundary.LinearRing.coordinates
		                	String kmlCoords = innerRing.getFirstChild().getFirstChild().getFirstChild().getTextContent().trim().replaceAll("\\r\\n|\\r|\\n", " ");
		                	for(String coord : kmlCoords.split(" "))
		        			{
		        				ArrayNode polyCoordArray = innerCoordArray.addArray();
		        				polyCoordArray.add(new BigDecimal(coord.split(",")[0])); //x
		        				polyCoordArray.add(new BigDecimal(coord.split(",")[1])); //y
		        				//innerCoordArray.add(new BigDecimal(coord.split(",")[2])); //z
		        			}
	    	            }
	    			}
	            }
			}
			
			// add any interior rings
		}
		else if(type.equals("LineString"))
		{
			geometryObject.put("type", "LineString");
			ArrayNode coords = geometryObject.putArray("coordinates");
			
			//each coord pair is an array added to coordGroups
			String kmlCoords = geoms.item(0).getFirstChild().getNextSibling().getTextContent().trim().replaceAll("\\r\\n|\\r|\\n", " ");
			for(String coord : kmlCoords.split(" "))
			{
				ArrayNode innerCoordArray = coords.addArray();
				innerCoordArray.add(new BigDecimal(coord.split(",")[0])); //x
				innerCoordArray.add(new BigDecimal(coord.split(",")[1])); //y
				//innerCoordArray.add(new BigDecimal(coord.split(",")[2])); //z
			}
		}
	}
	
	private static byte[] convertKmzDocument(byte[] document) throws SAXException, IOException, ParserConfigurationException, ZipException
	{
		byte[] fileBytes = unzipKMZ(document);
	    
	    // push the bytes up the convertKmlDocument
	    if(fileBytes != null) return convertKmlDocument(fileBytes);
	    else return document;
	}
	
	private static byte[] convertShapeDocument(byte[] document) throws IOException, ZipException, FactoryException, MismatchedDimensionException, TransformException
	{
		ByteArrayInputStream docStream = new ByteArrayInputStream(document);
		
		// drop zip into temp
		File shapeImportTemp = File.createTempFile("shape_import", ".zip");
		logger.debug("    Copying zip to temp file '" + shapeImportTemp.getName() + "'...");
		FileOutputStream os = new FileOutputStream(shapeImportTemp);
	    IOUtils.copy(docStream, os);
	    
	    os.close();
	    os = null;
	    docStream.close();
	    docStream = null;
	    
	    ZipFile zipFile = new ZipFile(shapeImportTemp);
	    
	    File tempShapePath = new File(System.getProperty("java.io.tmpdir") + File.separator + "shape" + File.separator + zipFile.getFile().getName() + File.separator);
	    tempShapePath.mkdirs();
    	
		// unzip the zip file into a temp path
	    logger.debug("    Unzipping...");
	    zipFile.extractAll(tempShapePath.getPath());
	    
		// open the KML contained and get the bytes.
	    
	    File[] files = tempShapePath.listFiles();
	    
	    File shapefile = null;
	    File shapeshx = null;
	    File projectionFile = null;
	    File dataFile = null;
	    
	    logger.debug("    Finding shapefiles...");
	    for(File file : files)
	    {
	    	if(file.getName().toLowerCase().endsWith(".shp"))
	    	{
	    		logger.debug("    Found shapefile...");
	    		shapefile = file;
	    	}
	    	else if(file.getName().toLowerCase().endsWith(".prj"))
	    	{
	    		logger.debug("    Found projection file...");
	    		projectionFile = file;
	    	}
	    	else if(file.getName().toLowerCase().endsWith(".dbf"))
	    	{
	    		logger.debug("    Found database file...");
	    		dataFile = file;
	    	}
	    	else if(file.getName().toLowerCase().endsWith(".shx"))
	    	{
	    		logger.debug("    Found shx file...");
	    		shapeshx = file;
	    	}
	    	else 
    		{
	    		logger.debug("    Deleted " + file.getName() + "...");
	    		if(!file.delete())
	    		{
	                logger.error("    temp shp zip cleanup failed...");
	            }
    		}
	    }
	    
	    logger.debug("    Opening shapefile for processing...");
	    
	    Map<String, String> connect = new HashMap<String, String>();
	    connect.put("url", shapefile.toURI().toString());

	    DataStore dataStore = DataStoreFinder.getDataStore(connect);
	    String[] typeNames = dataStore.getTypeNames();
	    String typeName = typeNames[0];

	    System.out.println("Reading content " + typeName);

	    FeatureSource featureSource = dataStore.getFeatureSource(typeName);
	    FeatureCollection collection = featureSource.getFeatures();
	    FeatureIterator iterator = collection.features();

	    CoordinateReferenceSystem sourceCRS = CRS.parseWKT(WGS84_WKT);
	    
	    // create a JSON object to hold our data
	    ObjectNode convertedJson = JsonNodeFactory.instance.objectNode();
		convertedJson.put("type", "FeatureCollection");
		ArrayNode featureArray = convertedJson.putArray("features");
	    
    	while (iterator.hasNext()) 
    	{
    		Feature feature = iterator.next();
    		GeometryAttribute sourceGeometry = feature.getDefaultGeometryProperty();
    		
    	    // add a feature to the geojson
    		ObjectNode featureJson = featureArray.addObject();
            featureJson.put("type", "Feature");
            ObjectNode jsonProperties = featureJson.putObject("properties");
            ObjectNode geometryObject = featureJson.putObject("geometry");
            
    		CoordinateReferenceSystem targetCRS = CRS.parseWKT(WGS84_WKT);

    		if(projectionFile != null)
    		{
    			String projectionString = new String(Files.readAllBytes(Paths.get(projectionFile.getPath()))); 
    			sourceCRS = CRS.parseWKT(projectionString);
    			
    			if(sourceCRS.getIdentifiers().size() > 0 && sourceCRS.getIdentifiers().iterator().next().getCode().equals("3005"))
    			{
    			    sourceCRS = CRS.parseWKT(BCALBERS_WKT);
    			}
    		}

    		MathTransform transform = CRS.findMathTransform(sourceCRS, targetCRS, false); // set leniancy to true for smoother handling?
    		
    		if(sourceGeometry.getValue() instanceof MultiPolygon)
    		{
    			MultiPolygon targetGeometry = (MultiPolygon)JTS.transform((MultiPolygon)sourceGeometry.getValue(), transform);

    			geometryObject.put("type", "GeometryCollection");
            	ArrayNode multiGeoms = geometryObject.putArray("geometries");
            	
    			for(int index = 0; index < targetGeometry.getNumGeometries(); index++)
    			{
    				ObjectNode innerNode = multiGeoms.addObject();
    				Polygon poly = (Polygon)targetGeometry.getGeometryN(index);
    				processShapePolygon(poly, transform, innerNode);
    			}
    		}
    		else if(sourceGeometry.getValue() instanceof MultiLineString)
    		{
    			MultiLineString targetGeometry = (MultiLineString)JTS.transform((MultiLineString)sourceGeometry.getValue(), transform);
    			
    			geometryObject.put("type", "GeometryCollection");
            	ArrayNode multiGeoms = geometryObject.putArray("geometries");
            	
    			for(int index = 0; index < targetGeometry.getNumGeometries(); index++)
    			{
    				ObjectNode innerNode = multiGeoms.addObject();
    				LineString line = (LineString)targetGeometry.getGeometryN(index);
    				processShapeLine(line, transform, innerNode);
    			}
    		}
    		else if(sourceGeometry.getValue() instanceof MultiPoint)
    		{
    			MultiPoint targetGeometry = (MultiPoint)JTS.transform((MultiPoint)sourceGeometry.getValue(), transform);
    			
    			geometryObject.put("type", "GeometryCollection");
            	ArrayNode multiGeoms = geometryObject.putArray("geometries");
            	
    			for(int index = 0; index < targetGeometry.getNumGeometries(); index++)
    			{
    				ObjectNode innerNode = multiGeoms.addObject();
    				Point point = (Point)targetGeometry.getGeometryN(index);
    				processShapePoint(point, transform, innerNode);
    			}
    		}
    		else if(sourceGeometry.getValue() instanceof Polygon)
    		{
    			processShapePolygon((Polygon)sourceGeometry.getValue(), transform, geometryObject);
    		}
    		else if(sourceGeometry.getValue() instanceof LineString)
    		{
    			processShapeLine((LineString)sourceGeometry.getValue(), transform, geometryObject);
    		}
    		else if(sourceGeometry.getValue() instanceof Point)
    		{
    			processShapePoint((Point)sourceGeometry.getValue(), transform, geometryObject);
    		}
    		
    		// add the properties based off the attributes in the shape database
    		
    		if(feature.getProperties() != null && dataFile != null)
    		{
	    		for(Property property : feature.getProperties())
	    		{
	    			if(!property.getName().toString().equals("the_geom"))
	    			{
	    				jsonProperties.put(property.getName().toString(), property.getValue().toString());
	    			}
	    		}
    		}
        }
    
        iterator.close();

	    // cleanup
        boolean deletedFile = false;
	    if(shapefile != null) deletedFile = shapefile.delete();
	    if(!deletedFile)
	    {
            logger.error("    shape file cleanup failed...");
        }
	    
	    if(projectionFile != null) deletedFile = projectionFile.delete();
	    if(!deletedFile)
        {
            logger.error("    projection file cleanup failed...");
        }
	    
	    if(dataFile != null) deletedFile = dataFile.delete();
	    if(!deletedFile)
        {
            logger.error("    data file cleanup failed...");
        }
	    
	    if(shapeshx != null) deletedFile = shapeshx.delete();
	    if(!deletedFile)
        {
            logger.error("    shx file cleanup failed...");
        }
	    
	    Files.delete(tempShapePath.toPath());
	    zipFile = null;
	    if(!shapeImportTemp.delete())
	    {
            logger.error("    temp shp import file cleanup failed...");
        }
	    // Now that the json object is built, convert it to bytes and send back
        byte[] result = null;
        
        if(convertedJson != null)
        {
        	String resultText = convertedJson.toString();
        	result = resultText.getBytes("UTF-8");
        }
        
		return result;
	}
	
	private static void processShapePolygon(Polygon sourceGeometry, MathTransform transform, ObjectNode geometryObject) throws MismatchedDimensionException, TransformException
	{
		Polygon targetGeometry = (Polygon)JTS.transform(sourceGeometry, transform);
		
		geometryObject.put("type", "Polygon");
		ArrayNode coords = geometryObject.putArray("coordinates");
		
		// outer ring
		LineString outerRing = targetGeometry.getExteriorRing();
		ArrayNode outerRingJsonCoords = coords.addArray();
		addCoords(outerRingJsonCoords, outerRing.getCoordinates());
		
		// inner rings
		for(int index = 0; index < targetGeometry.getNumInteriorRing(); index++)
		{
			LineString innerRing = targetGeometry.getInteriorRingN(index);
			ArrayNode innerRingJsonCoords = coords.addArray();
			addCoords(innerRingJsonCoords, innerRing.getCoordinates());
		}
	}
	
	private static void processShapeLine(LineString sourceGeometry, MathTransform transform, ObjectNode geometryObject) throws MismatchedDimensionException, TransformException
	{
		LineString targetGeometry = (LineString)JTS.transform(sourceGeometry, transform);
		
		geometryObject.put("type", "LineString");
		ArrayNode coords = geometryObject.putArray("coordinates");
		
		addCoords(coords, targetGeometry.getCoordinates());
	}
	
	private static void processShapePoint(Point sourceGeometry, MathTransform transform, ObjectNode geometryObject) throws MismatchedDimensionException, TransformException
	{
		Point targetGeometry = (Point)JTS.transform(sourceGeometry, transform);
		
		geometryObject.put("type", "Point");
		ArrayNode coords = geometryObject.putArray("coordinates");

		addCoord(coords, BigDecimal.valueOf(targetGeometry.getX()), BigDecimal.valueOf(targetGeometry.getY()), null);
	}
	
	private static void addCoords(ArrayNode jsonCoords, Coordinate[] coords)
	{
		for(Coordinate coord : coords)
		{
			ArrayNode innerCoord = jsonCoords.addArray();
			
			addCoord(innerCoord, BigDecimal.valueOf(coord.x), BigDecimal.valueOf(coord.y), null);
		}
	}
	
	private static void addCoord(ArrayNode jsonCoords, BigDecimal x, BigDecimal y, BigDecimal z )
	{
		if(z != null) jsonCoords.add(z.setScale(10, RoundingMode.CEILING));
		jsonCoords.add(y.setScale(10, RoundingMode.CEILING));
		jsonCoords.add(x.setScale(10, RoundingMode.CEILING));
	}
	
	private static byte[] convertCsvDocument(byte[] document)
	{
		return document;
	}
	
	private static byte[] convertGmlDocument(byte[] document)
	{
		return document;
	}
	
	private static byte[] convertWktDocument(byte[] document)
	{
		return document;
	}
	
	public static String getImageBase64StringFromUrl(String imageUrl) throws IOException
	{
        // get content type
        URL url = new URL(imageUrl);
        HttpURLConnection connection = (HttpURLConnection)  url.openConnection();
        connection.setRequestMethod("HEAD");
        connection.connect();
        String contentType = connection.getContentType();
        
        BufferedInputStream bis = new BufferedInputStream(url.openConnection().getInputStream());
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024];
        int read = 0;
        
        while ((read = bis.read(buffer, 0, buffer.length)) != -1) 
        {
            baos.write(buffer, 0, read);
        }
        baos.flush();
        
        String results = "data:" + contentType + ";base64," + Base64.getEncoder().encodeToString(baos.toByteArray());;
        
        bis.close();
        baos.close();
        
        return results;
	}
	
	private static byte[] unzipKMZ(byte[] document) throws IOException, ZipException
	{
	    ByteArrayInputStream docStream = new ByteArrayInputStream(document);
        
        // drop KMZ into temp
        File kmzImportTemp = File.createTempFile("kmz_import", ".kmz");
        logger.debug("    Copying zip to temp file '" + kmzImportTemp.getName() + "'...");
        FileOutputStream os = new FileOutputStream(kmzImportTemp);
        IOUtils.copy(docStream, os);
        
        os.close();
        os = null;
        docStream.close();
        docStream = null;
        
        ZipFile zipFile = new ZipFile(kmzImportTemp);
        
        File tempKmzPath = new File(System.getProperty("java.io.tmpdir") + File.separator + "kmz" + File.separator + zipFile.getFile().getName() + File.separator);
        tempKmzPath.mkdirs();
        
        // unzip the zip file into a temp path
        zipFile.extractAll(tempKmzPath.getPath());
        
        // open the KML contained and get the bytes.
        byte[] fileBytes = null;
        File[] files = tempKmzPath.listFiles();
        for(File file : files)
        {
            if(file.getName().toLowerCase().endsWith(".kml"))
            {
                FileInputStream fis = new FileInputStream(file);
                fileBytes = IOUtils.toByteArray(fis);
                
                fis.close();
                fis = null;
            }
            // start cleaning up the junk
            if(!file.delete())
            {
                logger.error("    temp KML cleanup failed...");
            }
        }

        // finish cleanup
        Files.delete(tempKmzPath.toPath());     
        zipFile = null;
        if(!kmzImportTemp.delete())
        {
            logger.error("    temp KMZ zip cleanup failed...");
        }
        
        return fileBytes;
	}
	
	public static ObjectNode createlayersFromKMZ(byte[] document) throws SAXException, IOException, ParserConfigurationException, ZipException
	{
	    byte[] fileBytes = unzipKMZ(document);
	    
        if(fileBytes != null) return createlayersFromKML(fileBytes);
        else return null;
	}
	
	public static ObjectNode createlayersFromKML(byte[] document) throws SAXException, IOException, ParserConfigurationException
	{
	    // source json for parse:
	    /*
	     * {
	     *    results:
	     *    [
	     *        {
	     *            styleUrl: "",
	     *            Style: <StyleObject>,
	     *            markerImage: "<base64>",
	     *            geojson: <json blob>
	     *        }
	     *    ]
	     * }
	     */
	    
	    ObjectNode resultsJson = JsonNodeFactory.instance.objectNode();
        ArrayNode layerFeaturesArray = resultsJson.putArray("results");
	    
	    ObjectMapper objectMapper = new ObjectMapper();
	    byte[] jsonBytes = convertKmlDocument(document);
	    JsonNode sourceJsonNode = objectMapper.readValue(jsonBytes, JsonNode.class);

        logger.debug("Parsing KML xml from document...");
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        
        ByteArrayInputStream docStream = new ByteArrayInputStream(document);
        
        Document doc = factory.newDocumentBuilder().parse(docStream);
        logger.debug("Successfully parsed KML doc. Looping through styles/placemarks...");
        
        docStream.close();
        docStream = null;
        
        NodeList styleNodes = doc.getElementsByTagName("Style");
        
        if (styleNodes != null)
        
        {
            for (int styleIndex = 0; styleIndex < styleNodes.getLength(); styleIndex++)
            {
                if (styleNodes.item(styleIndex).getNodeType() == Node.ELEMENT_NODE)
                {
                    Element styleNode = (Element) styleNodes.item(styleIndex);
                    ObjectNode layer = layerFeaturesArray.addObject();
                    
                    String styleName = styleNode.getAttribute("id");
                    
                    layer.put("styleUrl", styleName);
                    
                    LayerStyle styleInfo = new LayerStyle();
                    styleInfo.setStrokeOpacity(1.0);
                    styleInfo.setFillOpacity(0.65);
                    styleInfo.setStrokeStyle("1");
                    
                    for (int styleChildIndex = 0; styleChildIndex < styleNode.getChildNodes().getLength(); styleChildIndex++)
                    {
                        if (styleNode.getChildNodes().item(styleChildIndex).getNodeType() == Node.ELEMENT_NODE)
                        {
                            Element childNode = (Element) styleNode.getChildNodes().item(styleChildIndex);

                            if(childNode.getLocalName().equals("LineStyle"))
                            {
                                if(childNode.getElementsByTagName("width").getLength() > 0) styleInfo.setStrokeWidth(Double.parseDouble(childNode.getElementsByTagName("width").item(0).getTextContent()));
                                if(childNode.getElementsByTagName("color").getLength() > 0)styleInfo.setFillColor(childNode.getElementsByTagName("color").item(0).getTextContent());
                                if(childNode.getElementsByTagName("color").getLength() > 0)styleInfo.setStrokeColor(childNode.getElementsByTagName("color").item(0).getTextContent());
                            }
                            else if(childNode.getLocalName().equals("PolyStyle"))
                            {
                                if(childNode.getElementsByTagName("fill").getLength() > 0) styleInfo.setFillOpacity(Double.parseDouble(childNode.getElementsByTagName("fill").item(0).getTextContent()));
                                if(childNode.getElementsByTagName("outline").getLength() > 0) styleInfo.setStrokeWidth(Double.parseDouble(childNode.getElementsByTagName("outline").item(0).getTextContent()));
                                if(childNode.getElementsByTagName("color").getLength() > 0)styleInfo.setFillColor(childNode.getElementsByTagName("color").item(0).getTextContent());
                                if(childNode.getElementsByTagName("color").getLength() > 0)styleInfo.setStrokeColor(childNode.getElementsByTagName("color").item(0).getTextContent());
                            }
                            else if(childNode.getLocalName().equals("IconStyle"))
                            {
                                String markerUrl = ((Element)childNode.getElementsByTagName("Icon").item(0)).getElementsByTagName("href").item(0).getTextContent();
                                String base64 = getImageBase64StringFromUrl(markerUrl);
                                
                                layer.put("markerImage", base64);
                            }
                        }
                    }
                    
                    layer.putPOJO("style", styleInfo);

                    // style and layer basics are in place, now find all of the matching features and build a new json document.
                    ObjectNode geoJsonBlob = layer.putObject("geojson");
                    geoJsonBlob.put("type", "FeatureCollection");
                    ArrayNode featuresArray = geoJsonBlob.putArray("features");
                    
                    // loop sourceJsonNodes features array
                    ArrayNode sourceFeatures = (ArrayNode)sourceJsonNode.get("features");
                    for(JsonNode node : sourceFeatures)
                    {
                        if(node.get("properties").get("styleUrl").textValue().equals("#" + styleName))
                        {
                            featuresArray.add(node);
                        }
                    }
                }
            }
        }
        
        return resultsJson;
	}
}
