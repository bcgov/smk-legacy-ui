package ca.bc.gov.databc.smks.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class Attribute implements Cloneable
{
	private String id;
	private String name;
	private String title;
	private Boolean visible;

	public Attribute() { }

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

	public Attribute clone()
	{
		Attribute clone = new Attribute();

		clone.setId(id);
		clone.setTitle(title);
		clone.setName(name);
		clone.setVisible(visible);

		return clone;
	}
}
