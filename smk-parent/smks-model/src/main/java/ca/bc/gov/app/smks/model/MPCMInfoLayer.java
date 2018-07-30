package ca.bc.gov.app.smks.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonIgnoreProperties({})
@JsonInclude(Include.NON_NULL)
public class MPCMInfoLayer implements Serializable  
{
    private static final long serialVersionUID = 660251431583697516L;
    
    private int id;
	private int mpcmId;
	private String label;
	private String layerUrl;
	private List<MPCMInfoLayer> sublayers;
	
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

	public List<MPCMInfoLayer> getSublayers() 
	{
		return sublayers;
	}

	public void setSublayers(List<MPCMInfoLayer> sublayers) 
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
