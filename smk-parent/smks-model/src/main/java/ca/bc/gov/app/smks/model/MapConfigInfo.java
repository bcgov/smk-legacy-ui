package ca.bc.gov.app.smks.model;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class MapConfigInfo implements Serializable 
{
    private static final long serialVersionUID = 1L;

    private String name;
	private String id;
	private int revision;
	private String creator;
	private String modifier;
	private String createDate;
	private String modifiedDate;
	private boolean valid;
	
	public MapConfigInfo() { }

	public MapConfigInfo(MapConfiguration config)
	{
		this.name = config.getName();
		this.id = config.getLmfId();
		this.revision = config.getLmfRevision();
		this.creator = config.getCreatedBy();
		this.modifier = config.getModifiedBy();
		this.createDate = config.getCreatedDate();
		this.modifiedDate = config.getModifiedDate();
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

    public String getModifier()
    {
        return modifier;
    }

    public void setModifier(String modifier)
    {
        this.modifier = modifier;
    }

    public String getCreateDate()
    {
        return createDate;
    }

    public void setCreateDate(String createDate)
    {
        this.createDate = createDate;
    }

    public String getModifiedDate()
    {
        return modifiedDate;
    }

    public void setModifiedDate(String modifiedDate)
    {
        this.modifiedDate = modifiedDate;
    }
}
