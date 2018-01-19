package ca.bc.gov.databc.smk.model;

import java.util.ArrayList;
import java.util.List;

public class WMSLayer 
{
	private String title;
	private String name;
	private List<String> styles;
	
	/**
	 * 
	 * @param title
	 * @param name
	 */
	public WMSLayer(String title, String name)
	{
		this.title = title;
		this.name = name;
		styles = new ArrayList<String>();
	}

	public String getName() 
	{
		return name;
	}

	public void setName(String name) 
	{
		this.name = name;
	}

	public String getTitle() 
	{
		return title;
	}

	public void setTitle(String title) 
	{
		this.title = title;
	}

	public List<String> getStyles() 
	{
		if(styles == null) styles = new ArrayList<String>();
		return styles;
	}

	public void setStyles(List<String> styles) 
	{
		this.styles = styles;
	}
}
