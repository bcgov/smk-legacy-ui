package ca.bc.gov.databc.smks.model.layer;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.databc.smks.model.Layer;

@JsonInclude(Include.NON_NULL)
public class EsriDynamic extends Layer
{
	private Integer mpcmId;
	private String mpcmWorkspace;
	// private String metadataUrl;
	private List<String> dynamicLayers;

	public EsriDynamic() { }

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

	public DynamicServiceLayer clone()
	{
		DynamicServiceLayer clone = new DynamicServiceLayer();

		clone.setAttribution(getAttribution());
		clone.setFormat(getFormat());
		clone.setId(getId());
		clone.setIsTransparent(getIsTransparent());
		clone.setIsVisible(getIsVisible());
		clone.setLabel(getLabel());
		clone.setMaxScale(getMaxScale());
		clone.setMinScale(getMinScale());
		clone.setOpacity(getOpacity());
		clone.setServiceUrl(getServiceUrl());
		clone.setMetadataUrl(metadataUrl);
		clone.setMpcmId(mpcmId);
		clone.setMpcmWorkspace(mpcmWorkspace);

		for(String s : dynamicLayers)
		{
			clone.getDynamicLayers().add(s);
		}

		for(Attribute a : getAttributes())
		{
			clone.getAttributes().add(a.clone());
		}

		return clone;
	}
}
