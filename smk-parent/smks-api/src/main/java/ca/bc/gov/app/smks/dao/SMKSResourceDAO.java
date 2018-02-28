package ca.bc.gov.app.smks.dao;

import org.ektorp.CouchDbConnector;
import org.ektorp.support.CouchDbRepositorySupport;

import ca.bc.gov.app.smks.model.MapConfiguration;

public class SMKSResourceDAO extends CouchDbRepositorySupport<MapConfiguration>
{
	protected SMKSResourceDAO(Class<MapConfiguration> type, CouchDbConnector db) 
	{
		super(type, db);
	}
}
