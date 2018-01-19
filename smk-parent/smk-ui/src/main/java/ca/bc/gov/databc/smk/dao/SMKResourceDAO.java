package ca.bc.gov.databc.smk.dao;

import org.ektorp.CouchDbConnector;
import org.ektorp.support.CouchDbRepositorySupport;

import ca.bc.gov.databc.smk.model.DMFResource;

public class SMKResourceDAO extends CouchDbRepositorySupport<DMFResource>
{
	protected SMKResourceDAO(Class<DMFResource> type, CouchDbConnector db) 
	{
		super(type, db);
	}
}
