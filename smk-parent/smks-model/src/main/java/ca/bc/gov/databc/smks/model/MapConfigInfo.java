package ca.bc.gov.databc.smks.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class MapConfigInfo 
{
	private String name;
	private String id;
	private int revision;
	private String creator;
	
	public MapConfigInfo() { }

	public MapConfigInfo(MapConfiguration config)
	{
		this.name = config.getName();
		this.id = config.getLmfId();
		this.revision = config.getLmfRevision();
		this.creator = config.getCreatedBy();
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
}
