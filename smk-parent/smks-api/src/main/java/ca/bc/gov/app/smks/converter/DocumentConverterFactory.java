package ca.bc.gov.app.smks.converter;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Paths;
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

import net.lingala.zip4j.core.ZipFile;
import net.lingala.zip4j.exception.ZipException;

public class DocumentConverterFactory 
{
	private static Log logger = LogFactory.getLog(DocumentConverterFactory.class);
	
	public enum DocumentType { KML, KMZ, WKT, GML, CSV, SHAPE };
	
	private static final String WKT = "GEOGCS[" + "\"WGS 84\"," + "  DATUM[" + "    \"WGS_1984\","
	        + "    SPHEROID[\"WGS 84\",6378137,298.257223563,AUTHORITY[\"EPSG\",\"7030\"]],"
	        + "    TOWGS84[0,0,0,0,0,0,0]," + "    AUTHORITY[\"EPSG\",\"6326\"]],"
	        + "  PRIMEM[\"Greenwich\",0,AUTHORITY[\"EPSG\",\"8901\"]],"
	        + "  UNIT[\"DMSH\",0.0174532925199433,AUTHORITY[\"EPSG\",\"9108\"]],"
	        + "  AXIS[\"Lat\",NORTH]," + "  AXIS[\"Long\",EAST],"
	        + "  AUTHORITY[\"EPSG\",\"4326\"]]";
	
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
	            }
	        }
	    }
        
        // Now that the json object is built, convert it to bytes and send back
        byte[] result = null;
        
        if(convertedJson != null)
        {
        	String resultText = convertedJson.toString();
        	result = resultText.getBytes();
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
	    	file.delete();
	    }

	    // finish cleanup
	    Files.delete(tempKmzPath.toPath());
	    zipFile = null;
	    kmzImportTemp.delete();
	    
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
	    		file.delete();
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

	    CoordinateReferenceSystem sourceCRS = CRS.parseWKT(WKT);
	    
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
            
    		CoordinateReferenceSystem targetCRS = CRS.parseWKT(WKT);

    		if(projectionFile != null)
    		{
    			String projectionString = new String(Files.readAllBytes(Paths.get(projectionFile.getPath()))); 
    			sourceCRS = CRS.parseWKT(projectionString);
    		}

    		MathTransform transform = CRS.findMathTransform(sourceCRS, targetCRS);
    		
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
    		
    		for(Property property : feature.getProperties())
    		{
    			if(!property.getName().toString().equals("the_geom"))
    			{
    				jsonProperties.put(property.getName().toString(), property.getValue().toString());
    			}
    		}
        }
    
        iterator.close();

	    // cleanup
	    if(shapefile != null) shapefile.delete();
	    if(projectionFile != null) projectionFile.delete();
	    if(dataFile != null) dataFile.delete();
	    if(shapeshx != null) shapeshx.delete();
	    Files.delete(tempShapePath.toPath());
	    zipFile = null;
	    shapeImportTemp.delete();

	    // Now that the json object is built, convert it to bytes and send back
        byte[] result = null;
        
        if(convertedJson != null)
        {
        	String resultText = convertedJson.toString();
        	result = resultText.getBytes();
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

		addCoord(coords, new BigDecimal(targetGeometry.getX()), new BigDecimal(targetGeometry.getY()), null);
	}
	
	private static void addCoords(ArrayNode jsonCoords, Coordinate[] coords)
	{
		for(Coordinate coord : coords)
		{
			ArrayNode innerCoord = jsonCoords.addArray();
			
			addCoord(innerCoord, new BigDecimal(coord.x), new BigDecimal(coord.y), null);
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
}
