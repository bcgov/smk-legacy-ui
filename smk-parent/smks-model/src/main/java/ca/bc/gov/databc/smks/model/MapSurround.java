package ca.bc.gov.databc.smks.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class MapSurround implements Cloneable
{
	private String type;
	private String title;
	private String imageSrc;

	public MapSurround() {
		type = "default";
	}

	protected MapSurround( MapSurround mapSurround ) {
		this.setType(mapSurround.getType());
		this.setTitle(mapSurround.getTitle());
	}

	public String getType() { return type; }
	public void setType(String type) { this.type = type; }

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }

	public String getImageSrc() { return imageSrc; }
	public void setImageSrc(String imageSrc) { this.imageSrc = imageSrc; }

	public MapSurround clone()
	{
		MapSurround clone = new MapSurround( this );

		return clone;
	}
}
