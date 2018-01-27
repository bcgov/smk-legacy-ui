package ca.bc.gov.databc.smks.model;

import java.util.ArrayList;
import java.util.List;

public class WMSInfoLayer
{
	private String title;
	private String name;
	private String serviceUrl;
	private String wmsVersion;
	private String metadataUrl;
	private List<WMSInfoStyle> styles;

	public WMSInfoLayer()
	{
	}

	public WMSInfoLayer(String title, String name)
	{
		this.title = title;
		this.name = name;
		styles = new ArrayList<WMSInfoStyle>();
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

	public List<WMSInfoStyle> getStyles()
	{
		if(styles == null) styles = new ArrayList<WMSInfoStyle>();
		return styles;
	}

	public void setStyles(List<WMSInfoStyle> styles)
	{
		this.styles = styles;
	}

	public String getServiceUrl()
	{
		return serviceUrl;
	}

	public void setServiceUrl(String serviceUrl)
	{
		this.serviceUrl = serviceUrl;
	}

	public String getWmsVersion()
	{
		return wmsVersion;
	}

	public void setWmsVersion(String wmsVersion)
	{
		this.wmsVersion = wmsVersion;
	}

	public String getMetadataUrl()
	{
		return metadataUrl;
	}

	public void setMetadataUrl(String metadataUrl)
	{
		this.metadataUrl = metadataUrl;
	}
}
