package ca.bc.gov.app.smks.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class MapConfigInfo 
{
	private String name;
	private String id;
	private int revision;
	private String creator;
	private boolean valid;
	
	public MapConfigInfo() { }

	public MapConfigInfo(MapConfiguration config)
	{
		this.name = config.getName();
		this.id = config.getLmfId();
		this.revision = config.getLmfRevision();
		this.creator = config.getCreatedBy();
		this.valid = true;
	}
	
	public String getName() 
	{
		return name;
	}

	public void setName(String name) 
	{
		this.name = name;
	}

	public String getId() 
	{
		return id;
	}

	public void setId(String id) 
	{
		this.id = id;
	}

	public int getRevision() 
	{
		return revision;
	}

	public void setRevision(int revision) 
	{
		this.revision = revision;
	}

	public String getCreator() 
	{
		return creator;
	}

	public void setCreator(String creator) 
	{
		this.creator = creator;
	}
	
	public boolean getValid()
	{
	    return this.valid;
	}
	
	public void setValid(boolean valid)
	{
	    this.valid = valid;
	}
}
