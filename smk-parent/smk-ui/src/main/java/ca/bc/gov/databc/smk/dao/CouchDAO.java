package ca.bc.gov.databc.smk.dao;

import java.net.MalformedURLException;
import java.util.List;

import org.ektorp.Attachment;
import org.ektorp.AttachmentInputStream;
import org.ektorp.CouchDbConnector;
import org.ektorp.CouchDbInstance;
import org.ektorp.http.HttpClient;
import org.ektorp.http.StdHttpClient;
import org.ektorp.impl.StdCouchDbConnector;
import org.ektorp.impl.StdCouchDbInstance;

import ca.bc.gov.databc.smks.model.MapConfiguration;
import ca.bc.gov.databc.smks.model.Layer;

public class CouchDAO 
{
	private CouchDbInstance db;
	private CouchDbConnector dbc;
	private SMKResourceDAO resourceDAO;
	
	public CouchDAO(String couchUrl, String user, String password) throws MalformedURLException
	{
		HttpClient httpClient = new StdHttpClient.Builder().url(couchUrl).username(user).password(password).build();

		db = new StdCouchDbInstance(httpClient);
		dbc = new StdCouchDbConnector("dmf_resource_store_v2", db);

		dbc.createDatabaseIfNotExists();
		
		resourceDAO = new SMKResourceDAO(MapConfiguration.class, dbc);
	}
	
	public void deleteAttachment(MapConfiguration resource, Layer documentLayer)
	{
		dbc.deleteAttachment(resource.getId(), resource.getRevision(), documentLayer.getTitle());
	}
	
	public AttachmentInputStream getAttachment(String documentId, String attachmentId)
	{
		return dbc.getAttachment(documentId, attachmentId);
	}
	
	public AttachmentInputStream getAttachment(MapConfiguration resource, Layer documentLayer)
	{
		return dbc.getAttachment(resource.getId(), documentLayer.getTitle());
	}
	
	public void addAttachment(MapConfiguration resource, String id, String base64Data, String mimeType)
	{
		Attachment inline = new Attachment(id, base64Data, mimeType);

		resource.addInlineAttachment(inline);
		updateResource(resource);
	}
	
	public MapConfiguration getResourceByDocId(String docId)
	{
		return resourceDAO.get(docId);
	}
	
	public void createResource(MapConfiguration resource)
	{
		resourceDAO.add(resource);
	}
	
	public void updateResource(MapConfiguration resource)
	{
		resourceDAO.update(resource);
	}
	
	public void removeResource(MapConfiguration resource)
	{
		resourceDAO.remove(resource);
	}
	
	public List<MapConfiguration> getAllResources()
	{
		return resourceDAO.getAll();
	}
}
