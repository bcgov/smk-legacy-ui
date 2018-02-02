package ca.bc.gov.databc.smks.dao;

import java.util.ArrayList;
import java.util.List;

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

import ca.bc.gov.databc.smks.model.Layer;
import ca.bc.gov.databc.smks.model.MapConfiguration;

@Repository
public class CouchDAO
{
	private static Log logger = LogFactory.getLog(CouchDAO.class);

	private String couchDBurl;
	private String couchDBUser;
	private String couchDBPassword;
	private CouchDbInstance db;
	private CouchDbConnector dbc;
	private SMKSResourceDAO resourceDAO;

	public CouchDAO(String couchUrl, String databaseName, String user, String password) throws Exception
	{
		logger.info("Initializing CouchDB DAO with the following settings:");
		logger.info(" - Couch URL: " + couchUrl);
		logger.info(" - User: " + user);

		HttpClient httpClient = new StdHttpClient.Builder().url(couchUrl).username(user).password(password).build();

		couchDBurl = couchUrl;
		couchDBUser = user;
		couchDBPassword = password;

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

	private void createSMKDB() throws Exception
	{
		// create the database
		logger.info("     Build Database...");
		dbc.createDatabaseIfNotExists();
		logger.info("     Complete");

		// create the design doc
		logger.info("     Build Design Doc and Views...");

		DesignDocument doc = new DesignDocument("_design/fetch-configs");

		String fetchAllString = "function ( doc ) { emit( doc.lmfId, doc.lmfRevision ) }";
		DesignDocument.View fetchAll = new DesignDocument.View(fetchAllString);
		doc.addView("fetch-all-configs", fetchAll);

		String fetchPubString = "function ( doc ) { if( doc.published ) { emit( doc.lmfId, doc.lmfRevision ) } }";
		DesignDocument.View fetchPub = new DesignDocument.View(fetchPubString);
		doc.addView("fetch-published-configs", fetchPub);

		dbc.create(doc);

		logger.info("     Complete");
	}

	public MapConfiguration getPublishedConfig(String lmfId)
	{
		MapConfiguration result = null;

		ViewQuery query = new ViewQuery()
							  .designDocId("_design/fetch-configs")
						      .viewName("fetch-published-configs")
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
						      .designDocId("_design/fetch-configs")
						      .viewName("fetch-published-configs");
		ViewResult queryRslt = dbc.queryView(query);

		List<Row> rowsToParse = minimizeViewResults(queryRslt);

		// parse the remaining results into MapConfiguration documents
		for(Row row : rowsToParse)
		{
			results.add(getResourceByDocId(row.getId()));
		}

		return results;
	}

	public List<MapConfiguration> getAllConfigs()
	{
		List<MapConfiguration> results = new ArrayList<MapConfiguration>();

		ViewQuery query = new ViewQuery()
			      .designDocId("_design/fetch-configs")
			      .viewName("fetch-all-configs");
		ViewResult queryRslt = dbc.queryView(query);

		List<Row> rowsToParse = minimizeViewResults(queryRslt);

		// parse the remaining results into MapConfiguration documents
		for(Row row : rowsToParse)
		{
			results.add(getResourceByDocId(row.getId()));
		}

		return results;
	}

	public List<MapConfiguration> getAllMapConfigurationVersions(String lmfId)
	{
		ViewQuery query = new ViewQuery()
			      .designDocId("_design/fetch-configs")
			      .viewName("fetch-all-configs")
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
			      .designDocId("_design/fetch-configs")
			      .viewName("fetch-all-configs")
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
			      .designDocId("_design/fetch-configs")
			      .viewName("fetch-all-configs")
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
			String id = row.getKey();
			int revision = row.getValueAsInt();

			boolean addedConfig = false;
			Row rowToExclude = null;
			for(Row addedRow : rowsToParse)
			{
				String addedRowId = addedRow.getKey();
				int addedRowRevision = addedRow.getValueAsInt();

				if(addedRowId.equals(id))
				{
					if(addedRowRevision > revision)
					{
						addedConfig = true;
						rowToExclude = null;
						break;
					}
					else if(addedRowRevision < revision)
					{
						addedConfig = false;
						rowToExclude = addedRow;
						break;
					}
				}
			}

			if(!addedConfig) rowsToParse.add(row);
			if(rowToExclude != null) rowsToParse.remove(rowToExclude);
		}

		return rowsToParse;
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
