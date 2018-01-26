package ca.bc.gov.databc.smks.model;

import java.util.ArrayList;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonIgnoreProperties({})
@JsonInclude(Include.NON_NULL)
public class MPCMInfoLayer 
{
	private int id;
	private int mpcmId;
	private String label;
	private String layerUrl;
	private ArrayList<MPCMInfoLayer> sublayers;
	
	public MPCMInfoLayer() 
	{ 
		sublayers = new ArrayList<MPCMInfoLayer>();
	}

	public int getId() 
	{
		return id;
	}

	public void setId(int id) 
	{
		this.id = id;
	}

	public int getMpcmId() 
	{
		return mpcmId;
	}

	public void setMpcmId(int mpcmId) 
	{
		this.mpcmId = mpcmId;
	}

	public String getLabel()
	{
		return label;
	}

	public void setLabel(String label) 
	{
		this.label = label;
	}

	public ArrayList<MPCMInfoLayer> getSublayers() 
	{
		return sublayers;
	}

	public void setSublayers(ArrayList<MPCMInfoLayer> sublayers) 
	{
		this.sublayers = sublayers;
	}

	public String getLayerUrl() 
	{
		return layerUrl;
	}

	public void setLayerUrl(String layerUrl) 
	{
		this.layerUrl = layerUrl;
	}
}
