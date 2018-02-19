package ca.bc.gov.databc.smk.dao;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import ca.bc.gov.databc.smks.model.MapConfiguration;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

// import ca.bc.gov.databc.smk.model.MapConfiguration;

public class SMKServiceHandler
{
	private static Log logger = LogFactory.getLog(SMKServiceHandler.class);

	private String serviceUrl;

	public SMKServiceHandler(String url) throws MalformedURLException
	{
		serviceUrl = url;
		URL test = new URL(url);
	}

	public MapConfiguration createResource(MapConfiguration resource) throws MalformedURLException, IOException
	{
		MapConfiguration result = null;

		HttpURLConnection conn = (HttpURLConnection) new URL(serviceUrl + "MapConfigurations/").openConnection();
		conn.setDoOutput(true);
		conn.setDoInput(true);
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");

        ObjectMapper mapper = new ObjectMapper();
        String json = mapper.writeValueAsString(resource);
		logger.debug("sending " + json);

        OutputStream os = conn.getOutputStream();
        os.write(json.getBytes("UTF-8"));
        os.close();

        if (conn.getResponseCode() == HttpURLConnection.HTTP_CREATED)
        {
            result = getResource(resource.getLmfId());
        }

        conn.disconnect();

        return result;
	}

	public MapConfiguration updateResource(MapConfiguration resource) throws MalformedURLException, IOException
	{
		MapConfiguration result = null;

		HttpURLConnection conn = (HttpURLConnection) new URL(serviceUrl + "MapConfigurations/" + resource.getLmfId() + "/").openConnection();
		conn.setConnectTimeout(10000);
		conn.setDoOutput(true);
		conn.setDoInput(true);
        conn.setRequestMethod("PUT");
        conn.setRequestProperty("Content-Type", "application/json");

        ObjectMapper mapper = new ObjectMapper();
        String json = mapper.writeValueAsString(resource);

        OutputStream os = conn.getOutputStream();
        os.write(json.getBytes("UTF-8"));
        os.close();

        if (conn.getResponseCode() == HttpURLConnection.HTTP_OK)
        {
        	result = getResource(resource.getLmfId());
        }

        conn.disconnect();

        return result;
	}

	public void deleteResource(MapConfiguration resource) throws MalformedURLException, IOException
	{
		HttpURLConnection conn = (HttpURLConnection) new URL(serviceUrl + "MapConfigurations/" + resource.getLmfId() + "/").openConnection();
		conn.setDoOutput(true);
        conn.setRequestMethod("DELETE");
        conn.setRequestProperty("Content-Type", "application/json");

        if (conn.getResponseCode() == HttpURLConnection.HTTP_OK)
        {
        }

        conn.disconnect();
	}

	public void deleteAttachment(MapConfiguration resource, String layerId ) throws MalformedURLException, IOException
	{
		HttpURLConnection conn = (HttpURLConnection) new URL(serviceUrl + "MapConfigurations/" + resource.getLmfId() + "/Attachments/" + layerId ).openConnection();
		conn.setDoOutput(true);
        conn.setRequestMethod("DELETE");
        conn.setRequestProperty("Content-Type", "application/json");

        if (conn.getResponseCode() == HttpURLConnection.HTTP_OK)
        {
        }

        conn.disconnect();
	}

	public MapConfiguration getResource(String id) throws MalformedURLException, IOException
	{
		MapConfiguration result = null;

		HttpURLConnection conn = (HttpURLConnection) new URL(serviceUrl + "MapConfigurations/" + id + "/").openConnection();
		conn.setDoOutput(true);
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-Type", "application/json");

        if (conn.getResponseCode() == HttpURLConnection.HTTP_OK)
        {
        	ObjectMapper mapper = new ObjectMapper();
        	result = mapper.readValue(conn.getInputStream(), MapConfiguration.class);
        }

        conn.disconnect();

        return result;
	}

	public MapConfiguration getResource(String id, String version) throws MalformedURLException, IOException
	{
		MapConfiguration result = null;

		HttpURLConnection conn = (HttpURLConnection) new URL(serviceUrl + "MapConfigurations/" + id + "/?version=" + version).openConnection();
		conn.setDoOutput(true);
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-Type", "application/json");

        if (conn.getResponseCode() == HttpURLConnection.HTTP_OK)
        {
        	ObjectMapper mapper = new ObjectMapper();
        	result = mapper.readValue(conn.getInputStream(), MapConfiguration.class);
        }

        conn.disconnect();

        return result;
	}

	public MapConfiguration getPublishedResource(String id) throws MalformedURLException, IOException
	{
		MapConfiguration result = null;

		HttpURLConnection conn = (HttpURLConnection) new URL(serviceUrl + "MapConfigurations/Published/" + id + "/").openConnection();
		conn.setDoOutput(true);
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-Type", "application/json");

        if (conn.getResponseCode() == HttpURLConnection.HTTP_OK)
        {
        	ObjectMapper mapper = new ObjectMapper();
        	result = mapper.readValue(conn.getInputStream(), MapConfiguration.class);
        }

        conn.disconnect();

        return result;
	}

	public void publish(MapConfiguration resource) throws MalformedURLException, IOException
	{
		HttpURLConnection conn = (HttpURLConnection) new URL(serviceUrl + "MapConfigurations/Published/" + resource.getLmfId()).openConnection();
		conn.setDoOutput(true);
		conn.setDoInput(true);
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");

        ObjectMapper mapper = new ObjectMapper();
        String json = mapper.writeValueAsString(resource);

        OutputStream os = conn.getOutputStream();
        os.write(json.getBytes("UTF-8"));
        os.close();

        if (conn.getResponseCode() == HttpURLConnection.HTTP_CREATED)
        {
        }

        conn.disconnect();
	}

	public void unPublishResource(MapConfiguration resource) throws MalformedURLException, IOException
	{
		HttpURLConnection conn = (HttpURLConnection) new URL(serviceUrl + "MapConfigurations/Published/" + resource.getLmfId() + "/").openConnection();
		conn.setDoOutput(true);
        conn.setRequestMethod("DELETE");
        conn.setRequestProperty("Content-Type", "application/json");

        if (conn.getResponseCode() == HttpURLConnection.HTTP_OK)
        {
        }

        conn.disconnect();
	}

	public List<MapConfiguration> getPublishedConfigs() throws MalformedURLException, IOException
	{
		List<MapConfiguration> result = new ArrayList<MapConfiguration>();

		HttpURLConnection conn = (HttpURLConnection) new URL(serviceUrl + "MapConfigurations/Published/").openConnection();
		conn.setDoOutput(true);
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-Type", "application/json");

        if (conn.getResponseCode() == HttpURLConnection.HTTP_OK)
        {
        	InputStream in = new BufferedInputStream(conn.getInputStream());
            String resultString = org.apache.commons.io.IOUtils.toString(in, "UTF-8");

            in .close();

            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode node = objectMapper.readValue(resultString, JsonNode.class);

            for(JsonNode child : node)
            {
            	String id = child.get("id").asText();
            	result.add(getPublishedResource(id));
            }
        }

        conn.disconnect();

        return result;
	}

	public List<MapConfiguration> getEditableConfigs() throws MalformedURLException, IOException
	{
		List<MapConfiguration> result = new ArrayList<MapConfiguration>();

		HttpURLConnection conn = (HttpURLConnection) new URL(serviceUrl + "MapConfigurations/").openConnection();
		conn.setDoOutput(true);
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-Type", "application/json");

        if (conn.getResponseCode() == HttpURLConnection.HTTP_OK)
        {
        	InputStream in = new BufferedInputStream(conn.getInputStream());
            String resultString = org.apache.commons.io.IOUtils.toString(in, "UTF-8");

            in .close();

            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode node = objectMapper.readValue(resultString, JsonNode.class);

            for(JsonNode child : node)
            {
            	String id = child.get("id").asText();
            	result.add(getResource(id));
            }
        }

        conn.disconnect();

        return result;
	}

	public static String convertNameToId( String name ) {
		return name.toLowerCase().replaceAll("[^0-9a-z]+", "-").replaceAll("^[-]+", "").replaceAll("[-]+$", "");
    }

	public static String convertNamesToId( List<String> names ) {
        if ( names.isEmpty() ) return "";
        String out = "";
        for ( String n : names )
		    out = out.concat( convertNameToId( n ) ).concat( "--" );
        return out.substring( 0, out.length() - 2 );
    }

}
