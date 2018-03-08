package ca.bc.gov.app.smk.dao;

import org.ektorp.CouchDbConnector;
import org.ektorp.support.CouchDbRepositorySupport;

import ca.bc.gov.app.smks.model.MapConfiguration;

public class SMKResourceDAO extends CouchDbRepositorySupport<MapConfiguration>
{
	protected SMKResourceDAO(Class<MapConfiguration> type, CouchDbConnector db) 
	{
		super(type, db);
	}
}
