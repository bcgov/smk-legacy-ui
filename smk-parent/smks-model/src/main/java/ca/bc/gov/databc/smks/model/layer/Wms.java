package ca.bc.gov.databc.smks.model.layer;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.databc.smks.model.FeatureLayer;
import ca.bc.gov.databc.smks.model.Layer;

@JsonInclude(Include.NON_NULL)
public class Wms extends FeatureLayer
{
	private String version;
	private String serviceUrl;
	private String layerName;
	private String styleName;

	public Wms() { }

	protected Wms( Wms layer ) {
		super( layer );

		this.setVersion(layer.getVersion());
		this.setServiceUrl(layer.getServiceUrl());
		this.setLayerName(layer.getLayerName());
		this.setStyleName(layer.getStyleName());
	}

	public String getType()
	{
		return Layer.Type.Wms.getJsonType();
	}

	public String getVersion()
	{
		return version;
	}

	public void setVersion(String version)
	{
		this.version = version;
	}

	public String getServiceUrl()
	{
		return serviceUrl;
	}

	public void setServiceUrl(String serviceUrl)
	{
		this.serviceUrl = serviceUrl;
	}

	public String getStyleName()
	{
		return styleName;
	}

	public void setStyleName(String styleName)
	{
		this.styleName = styleName;
	}

	public String getLayerName()
	{
		return layerName;
	}

	public void setLayerName(String layerName)
	{
		this.layerName = layerName;
	}

	public Wms clone()
	{
		Wms clone = new Wms( this );

		return clone;
	}
}
