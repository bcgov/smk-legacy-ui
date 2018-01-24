package ca.bc.gov.databc.smks.model.layer;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.databc.smks.model.FeatureLayer;

@JsonInclude(Include.NON_NULL)
public class Wms extends FeatureLayer
{
	private String version;
	// private String wmsStyleId;
	private String layerName;
	private String styleName;
	// private String wmsLegendUrl;
	// private String metadataUrl;
	// private List<String> layers;

	public Wms() { }

	protected Wms( Wms layer ) {
		super( layer );

		this.setVersion(layer.getVersion());
		this.setLayerName(layer.getLayerName());
		this.setStyleName(layer.getStyleName());
	}

	public String getVersion()
	{
		return version;
	}

	public void setVersion(String version)
	{
		this.version = version;
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

		// clone.setAttribution(getAttribution());
		// clone.setFormat(getFormat());
		// clone.setId(getId());
		// clone.setIsTransparent(getIsTransparent());
		// clone.setIsVisible(getIsVisible());
		// clone.setLabel(getLabel());
		// clone.setMaxScale(getMaxScale());
		// clone.setMinScale(getMinScale());
		// clone.setOpacity(getOpacity());
		// clone.setServiceUrl(getServiceUrl());
		// clone.setWmsStyleId(wmsStyleId);
		// clone.setWmsVersion(wmsVersion);
		// clone.setMetadataUrl(metadataUrl);
		// clone.setWmsLegendUrl(wmsLegendUrl);
		// clone.setWmsStyleName(wmsStyleName);

		// for(String s : layers)
		// {
		// 	clone.getLayers().add(s);
		// }

		// for(Attribute a : getAttributes())
		// {
		// 	clone.getAttributes().add(a.clone());
		// }

		return clone;
	}
}
