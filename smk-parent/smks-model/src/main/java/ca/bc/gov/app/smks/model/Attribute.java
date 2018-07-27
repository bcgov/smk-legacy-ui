package ca.bc.gov.app.smks.model;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class Attribute implements Serializable 
{
    private static final long serialVersionUID = -2443327276106143204L;
    
    private String id;
	private String name;
	private String title;
	private Boolean visible;

	public Attribute() 
	{
	    // empty constructor
	}
	
	public Attribute(Attribute clone)
	{
	    this.setId(clone.getId());
        this.setTitle(clone.getTitle());
        this.setName(clone.getName());
        this.setVisible(clone.getVisible());
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public Boolean getVisible() {
		return visible;
	}

	public void setVisible(Boolean visible) {
		this.visible = visible;
	}
}
