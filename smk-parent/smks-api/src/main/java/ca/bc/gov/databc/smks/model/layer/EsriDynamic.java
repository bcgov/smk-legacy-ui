package ca.bc.gov.databc.smks.model.layer;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.databc.smks.model.FeatureLayer;

@JsonInclude(Include.NON_NULL)
public class EsriDynamic extends FeatureLayer
{
	private Integer mpcmId;
	private String mpcmWorkspace;
	// private String metadataUrl;
	private List<String> dynamicLayers;

	public EsriDynamic() { }

	protected EsriDynamic( EsriDynamic layer ) {
		super( layer );

		this.setMpcmId(layer.getMpcmId());
		this.setMpcmWorkspace(layer.getMpcmWorkspace());

		for(String s : layer.getDynamicLayers())
		{
			this.getDynamicLayers().add(s);
		}
		// this.setId(layer.getId());
		// this.setTitle(layer.getTitle());
		// this.setAttribution(layer.getAttribution());
		// this.setMetadataUrl(layer.getMetadataUrl());
		// this.setIsVisible(layer.getIsVisible());
		// this.setMaxScale(layer.getMaxScale());
		// this.setMinScale(layer.getMinScale());
		// this.setOpacity(layer.getOpacity());
		// this.setAttributes(layer.getAttributes());
	}

	public Integer getMpcmId()
	{
		return mpcmId;
	}

	public void setMpcmId(Integer mpcmId)
	{
		this.mpcmId = mpcmId;
	}

	public String getMpcmWorkspace()
	{
		return mpcmWorkspace;
	}

	public void setMpcmWorkspace(String mpcmWorkspace)
	{
		this.mpcmWorkspace = mpcmWorkspace;
	}

	public List<String> getDynamicLayers()
	{
		if(dynamicLayers == null) dynamicLayers = new ArrayList<String>();
		return dynamicLayers;
	}

	public void setDynamicLayers(List<String> dynamicLayers)
	{
		this.dynamicLayers = dynamicLayers;
	}

	public EsriDynamic clone()
	{
		EsriDynamic clone = new EsriDynamic( this );

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
		// clone.setMetadataUrl(metadataUrl);
		// clone.setMpcmId(mpcmId);
		// clone.setMpcmWorkspace(mpcmWorkspace);

		// for(String s : dynamicLayers)
		// {
		// 	clone.getDynamicLayers().add(s);
		// }

		// for(Attribute a : getAttributes())
		// {
		// 	clone.getAttributes().add(a.clone());
		// }

		return clone;
	}
}
