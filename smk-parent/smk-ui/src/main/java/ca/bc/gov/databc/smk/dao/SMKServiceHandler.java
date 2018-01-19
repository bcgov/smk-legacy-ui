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

import ca.bc.gov.databc.smk.model.DMFResource;

public class SMKServiceHandler 
{
	private String serviceUrl;
	
	public SMKServiceHandler(String url) throws MalformedURLException
	{
		serviceUrl = url;
		URL test = new URL(url);
	}
	
	public DMFResource createResource(DMFResource resource) throws MalformedURLException, IOException
	{
		DMFResource result = null;
		
		HttpURLConnection conn = (HttpURLConnection) new URL(serviceUrl + "MapConfigurations/").openConnection();
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
            result = getResource(resource.getLmfId());
        }
        
        conn.disconnect();
        
        return result;
	}
	
	public DMFResource updateResource(DMFResource resource) throws MalformedURLException, IOException
	{
		DMFResource result = null;
		
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
	
	public void deleteResource(DMFResource resource) throws MalformedURLException, IOException
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
	
	public DMFResource getResource(String id) throws MalformedURLException, IOException
	{
		DMFResource result = null;
		
		HttpURLConnection conn = (HttpURLConnection) new URL(serviceUrl + "MapConfigurations/" + id + "/").openConnection();
		conn.setDoOutput(true);
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-Type", "application/json");
        
        if (conn.getResponseCode() == HttpURLConnection.HTTP_OK)
        {
        	ObjectMapper mapper = new ObjectMapper();
        	result = mapper.readValue(conn.getInputStream(), DMFResource.class);
        }
        
        conn.disconnect();
        
        return result;
	}
	
	public DMFResource getResource(String id, String version) throws MalformedURLException, IOException
	{
		DMFResource result = null;
		
		HttpURLConnection conn = (HttpURLConnection) new URL(serviceUrl + "MapConfigurations/" + id + "/?version=" + version).openConnection();
		conn.setDoOutput(true);
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-Type", "application/json");
        
        if (conn.getResponseCode() == HttpURLConnection.HTTP_OK)
        {
        	ObjectMapper mapper = new ObjectMapper();
        	result = mapper.readValue(conn.getInputStream(), DMFResource.class);
        }
        
        conn.disconnect();
        
        return result;
	}
	
	public DMFResource getPublishedResource(String id) throws MalformedURLException, IOException
	{
		DMFResource result = null;
		
		HttpURLConnection conn = (HttpURLConnection) new URL(serviceUrl + "MapConfigurations/Published/" + id + "/").openConnection();
		conn.setDoOutput(true);
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-Type", "application/json");
        
        if (conn.getResponseCode() == HttpURLConnection.HTTP_OK)
        {
        	ObjectMapper mapper = new ObjectMapper();
        	result = mapper.readValue(conn.getInputStream(), DMFResource.class);
        }
        
        conn.disconnect();
        
        return result;
	}
	
	public void publish(DMFResource resource) throws MalformedURLException, IOException
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
	
	public void unPublishResource(DMFResource resource) throws MalformedURLException, IOException
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
	
	public List<DMFResource> getPublishedConfigs() throws MalformedURLException, IOException
	{
		List<DMFResource> result = new ArrayList<DMFResource>();
		
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
	
	public List<DMFResource> getEditableConfigs() throws MalformedURLException, IOException
	{
		List<DMFResource> result = new ArrayList<DMFResource>();
		
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
}
