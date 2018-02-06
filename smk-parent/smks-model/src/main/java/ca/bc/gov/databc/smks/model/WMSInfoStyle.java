package ca.bc.gov.databc.smks.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class WMSInfoStyle
{
	private String name;
	private String title;
	private String format;
	private String legendUrl;

	public WMSInfoStyle()
	{
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

	public String getFormat()
	{
		return format;
	}

	public void setFormat(String format)
	{
		this.format = format;
	}

	public String getLegendUrl()
	{
		return legendUrl;
	}

	public void setLegendUrl(String legendUrl)
	{
		this.legendUrl = legendUrl;
	}

    @Override
    public boolean equals( Object other ) {
        if ( other == null ) return false;
        if ( other == this ) return true;
        if ( !( other instanceof WMSInfoStyle ) ) return false;

        return ( ( WMSInfoStyle )other ).getName().equals( getName() );
    }

    @Override
    public int hashCode() {
        return getName().hashCode();
    }
}
