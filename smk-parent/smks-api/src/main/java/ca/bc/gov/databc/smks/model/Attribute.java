package ca.bc.gov.databc.smks.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class Attribute implements Cloneable 
{
	private Integer id;
	private String name;
	private String alias;
	private Boolean visible;
	
	public Attribute() { }

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getAlias() {
		return alias;
	}

	public void setAlias(String alias) {
		this.alias = alias;
	}

	public Boolean getVisible() {
		return visible;
	}

	public void setVisible(Boolean visible) {
		this.visible = visible;
	}
	
	public Attribute clone()
	{
		Attribute clone = new Attribute();
		
		clone.setAlias(alias);
		clone.setId(id);
		clone.setName(name);
		clone.setVisible(visible);
		
		return clone;
	}
}
