package ca.bc.gov.databc.smks.dao;

import org.ektorp.CouchDbConnector;
import org.ektorp.support.CouchDbRepositorySupport;

import ca.bc.gov.databc.smks.model.MapConfiguration;

public class SMKSResourceDAO extends CouchDbRepositorySupport<MapConfiguration>
{
	protected SMKSResourceDAO(Class<MapConfiguration> type, CouchDbConnector db) 
	{
		super(type, db);
	}
}
