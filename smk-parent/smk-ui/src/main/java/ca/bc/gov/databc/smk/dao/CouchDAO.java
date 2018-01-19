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

import ca.bc.gov.databc.smk.model.DMFResource;
import ca.bc.gov.databc.smk.model.Layer;

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
		
		resourceDAO = new SMKResourceDAO(DMFResource.class, dbc);
	}
	
	public void deleteAttachment(DMFResource resource, Layer documentLayer)
	{
		dbc.deleteAttachment(resource.getId(), resource.getRevision(), documentLayer.getLabel());
	}
	
	public AttachmentInputStream getAttachment(String documentId, String attachmentId)
	{
		return dbc.getAttachment(documentId, attachmentId);
	}
	
	public AttachmentInputStream getAttachment(DMFResource resource, Layer documentLayer)
	{
		return dbc.getAttachment(resource.getId(), documentLayer.getLabel());
	}
	
	public void addAttachment(DMFResource resource, String id, String base64Data, String mimeType)
	{
		Attachment inline = new Attachment(id, base64Data, mimeType);

		resource.addInlineAttachment(inline);
		updateResource(resource);
	}
	
	public DMFResource getResourceByDocId(String docId)
	{
		return resourceDAO.get(docId);
	}
	
	public void createResource(DMFResource resource)
	{
		resourceDAO.add(resource);
	}
	
	public void updateResource(DMFResource resource)
	{
		resourceDAO.update(resource);
	}
	
	public void removeResource(DMFResource resource)
	{
		resourceDAO.remove(resource);
	}
	
	public List<DMFResource> getAllResources()
	{
		return resourceDAO.getAll();
	}
}
