package ca.bc.gov.databc.smk.dao;

import org.ektorp.CouchDbConnector;
import org.ektorp.support.CouchDbRepositorySupport;

import ca.bc.gov.databc.smks.model.MapConfiguration;

public class SMKResourceDAO extends CouchDbRepositorySupport<MapConfiguration>
{
	protected SMKResourceDAO(Class<MapConfiguration> type, CouchDbConnector db) 
	{
		super(type, db);
	}
}
