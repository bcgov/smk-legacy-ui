package ca.bc.gov.app.smks.dao;

import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.ektorp.Attachment;
import org.ektorp.AttachmentInputStream;
import org.ektorp.CouchDbConnector;
import org.ektorp.CouchDbInstance;
import org.ektorp.ViewQuery;
import org.ektorp.ViewResult;
import org.ektorp.ViewResult.Row;
import org.ektorp.http.HttpClient;
import org.ektorp.http.StdHttpClient;
import org.ektorp.impl.StdCouchDbConnector;
import org.ektorp.impl.StdCouchDbInstance;
import org.ektorp.support.DesignDocument;
import org.springframework.stereotype.Repository;

import ca.bc.gov.app.smks.model.Layer;
import ca.bc.gov.app.smks.model.MapConfiguration;

@Repository
public class CouchDAO
{
	private static Log logger = LogFactory.getLog(CouchDAO.class);
	
	private CouchDbInstance db;
	private CouchDbConnector dbc;
	private SMKSResourceDAO resourceDAO;

	private static final String FETCH_CONFIGS = "_design/fetch-configs";
	private static final String FETCH_ALL_CONFIGS = "fetch-all-configs";
	private static final String FETCH_PUBLISHED_CONFIGS = "fetch-published-configs";
	
	public CouchDAO(String couchUrl, String databaseName, String user, String password) throws MalformedURLException
	{
		logger.info("Initializing CouchDB DAO with the following settings:");
		logger.info(" - Couch URL: " + couchUrl);
		logger.info(" - User: " + user);

		HttpClient httpClient = new StdHttpClient.Builder().url(couchUrl).username(user).password(password).build();

		db = new StdCouchDbInstance(httpClient);
		dbc = new StdCouchDbConnector(databaseName, db);

		// If the datastore isn't in place on the CouchDB instance, we need to create it
		// and create the design doc and views needed.
		if(!db.checkIfDbExists(databaseName))
		{
			logger.info(" ### Database does not exist. Creating...");
			createSMKDB();
		}

		resourceDAO = new SMKSResourceDAO(MapConfiguration.class, dbc);
		logger.info("Initialization of CouchDB DAO complete.");
	}

	private void createSMKDB()
	{
		// create the database
		logger.info("     Build Database...");
		dbc.createDatabaseIfNotExists();
		logger.info("     Complete");

		// create the design doc
		logger.info("     Build Design Doc and Views...");

		DesignDocument doc = new DesignDocument(FETCH_CONFIGS);

		String fetchAllString = "function ( doc ) { emit( doc.lmfId, doc.lmfRevision ) }";
		DesignDocument.View fetchAll = new DesignDocument.View(fetchAllString);
		doc.addView(FETCH_ALL_CONFIGS, fetchAll);

		String fetchPubString = "function ( doc ) { if( doc.published ) { emit( doc.lmfId, doc.lmfRevision ) } }";
		DesignDocument.View fetchPub = new DesignDocument.View(fetchPubString);
		doc.addView(FETCH_PUBLISHED_CONFIGS, fetchPub);

		dbc.create(doc);

		logger.info("     Complete");
	}

	public CouchDbInstance getCouchInstance()
	{
		return db;
	}
	
	public CouchDbConnector getCouchConnection()
	{
		return dbc;
	}
	
	public MapConfiguration getPublishedConfig(String lmfId)
	{
		MapConfiguration result = null;

		ViewQuery query = new ViewQuery()
							  .designDocId(FETCH_CONFIGS)
						      .viewName(FETCH_PUBLISHED_CONFIGS)
						      .key(lmfId);

		ViewResult queryRslt = dbc.queryView(query);
		List<Row> rows = minimizeViewResults(queryRslt);

		for(Row row : rows)
		{
			if(row.getKey().equals(lmfId))
			{
				result = getResourceByDocId(row.getId());
				break;
			}
		}

		return result;
	}

	public List<MapConfiguration> getPublishedConfigs()
	{
		List<MapConfiguration> results = new ArrayList<MapConfiguration>();

		ViewQuery query = new ViewQuery()
						      .designDocId(FETCH_CONFIGS)
						      .viewName(FETCH_PUBLISHED_CONFIGS);
		ViewResult queryRslt = dbc.queryView(query);

		List<Row> rowsToParse = minimizeViewResults(queryRslt);

		// parse the remaining results into MapConfiguration documents
		for(Row row : rowsToParse)
		{
			results.add(getResourceByDocId(row.getId()));
		}

		return results;
	}

	public Map<String, String> getAllConfigs()
	{
	    Map<String, String> results = new HashMap<String, String>();

		ViewQuery query = new ViewQuery()
			      .designDocId(FETCH_CONFIGS)
			      .viewName(FETCH_ALL_CONFIGS);
		ViewResult queryRslt = dbc.queryView(query);

		List<Row> rowsToParse = minimizeViewResults(queryRslt);

		// parse the remaining results into MapConfiguration documents
		for(Row row : rowsToParse)
		{
		    results.put(row.getId(), row.getKey());
		}

		return results;
	}

	public List<MapConfiguration> getAllMapConfigurationVersions(String lmfId)
	{
		ViewQuery query = new ViewQuery()
			      .designDocId(FETCH_CONFIGS)
			      .viewName(FETCH_ALL_CONFIGS)
			      .key(lmfId);

		ViewResult queryRslt = dbc.queryView(query);

		List<MapConfiguration> results = new ArrayList<MapConfiguration>();
		for(Row row : queryRslt.getRows())
		{
			if(row.getKey().equals(lmfId))
			{
				results.add(getResourceByDocId(row.getId()));
			}
		}

		return results;
	}

	public MapConfiguration getMapConfiguration(String lmfId)
	{
		MapConfiguration result = null;

		ViewQuery query = new ViewQuery()
			      .designDocId(FETCH_CONFIGS)
			      .viewName(FETCH_ALL_CONFIGS)
			      .key(lmfId);

		ViewResult queryRslt = dbc.queryView(query);
		List<Row> rows = minimizeViewResults(queryRslt);

		for(Row row : rows)
		{
			if(row.getKey().equals(lmfId))
			{
				result = getResourceByDocId(row.getId());
				break;
			}
		}

		return result;
	}

	public MapConfiguration getMapConfiguration(String lmfId, int lmfRevision)
	{
		MapConfiguration result = null;

		ViewQuery query = new ViewQuery()
			      .designDocId(FETCH_CONFIGS)
			      .viewName(FETCH_ALL_CONFIGS)
			      .key(lmfId);

		ViewResult queryRslt = dbc.queryView(query);

		if(!queryRslt.isEmpty())
		{
			for(Row row : queryRslt.getRows())
			{
				if(row.getKey().equals(lmfId) && row.getValueAsInt() == lmfRevision)
				{
					result = getResourceByDocId(row.getId());
					break;
				}
			}
		}

		return result;
	}

	private List<Row> minimizeViewResults(ViewResult queryRslt)
	{
		List<Row> rowsToParse = new ArrayList<Row>();
		
		for(Row row : queryRslt.getRows())
		{
		    processViewRows(row, rowsToParse);
		}

		return rowsToParse;
	}

	private void processViewRows(Row row, List<Row> rowsToParse)
	{
	    String id = row.getKey();
        int revision = row.getValueAsInt();

        boolean addedConfig = false;
        Row rowToExclude = null;
        
        for(Row addedRow : rowsToParse)
        {
            String addedRowId = addedRow.getKey();
            int addedRowRevision = addedRow.getValueAsInt();

            if(addedRowId.equals(id) && addedRowRevision != revision)
            {
                if(addedRowRevision > revision)
                {
                    addedConfig = true;
                }
                else
                {
                    rowToExclude = addedRow;
                }
                
                break;
            }
        }

        if(!addedConfig) rowsToParse.add(row);
        if(rowToExclude != null) rowsToParse.remove(rowToExclude);
	}
	
	public void deleteAttachment(MapConfiguration resource, Layer documentLayer)
	{
		deleteAttachment(resource, documentLayer.getTitle());
	}

	public void deleteAttachment(MapConfiguration resource, Attachment document)
	{
		deleteAttachment(resource, document.getId());
	}

	public void deleteAttachment(MapConfiguration resource, String documentId)
	{
		dbc.deleteAttachment(resource.getId(), resource.getRevision(), documentId);
	}

	public AttachmentInputStream getAttachment(String documentId, String attachmentId)
	{
		return dbc.getAttachment(documentId, attachmentId);
	}

	public AttachmentInputStream getAttachment(MapConfiguration resource, Layer documentLayer)
	{
		return getAttachment(resource.getId(), documentLayer.getTitle());
	}

	public AttachmentInputStream getAttachment(MapConfiguration resource, String attachmentId)
	{
		return dbc.getAttachment(resource.getId(), attachmentId);
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
