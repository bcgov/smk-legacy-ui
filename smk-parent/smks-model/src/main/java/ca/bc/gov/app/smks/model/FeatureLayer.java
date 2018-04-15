package ca.bc.gov.app.smks.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.JsonNode;

@JsonInclude(Include.NON_NULL)
public class FeatureLayer extends Layer
{
	private List<Attribute> attributes;
	private String geometryAttribute;
    private String titleAttribute;
    private Object queries;
    
	public FeatureLayer()
	{
	}

	protected FeatureLayer( FeatureLayer layer )
	{
		super( layer );

		this.setGeometryAttribute(layer.getGeometryAttribute());
		this.setTitleAttribute(layer.getTitleAttribute());
		this.setQueries(layer.getQueries());
		for(Attribute a : layer.getAttributes())
		{
			this.getAttributes().add(a.clone());
		}
	}

	@JsonRawValue
	public JsonNode getQueries() 
	{
		return (JsonNode)queries;
	}

	public void setQueries(JsonNode node) 
	{
	    this.queries = node;
	}
	  
	public String getGeometryAttribute()
	{
		return geometryAttribute;
	}

	public void setGeometryAttribute(String geometryAttribute)
	{
		this.geometryAttribute = geometryAttribute;
	}

	public String getTitleAttribute()
	{
		return titleAttribute;
	}

	public void setTitleAttribute(String titleAttribute)
	{
		this.titleAttribute = titleAttribute;
	}

	public List<Attribute> getAttributes()
	{
		if(attributes == null) attributes = new ArrayList<Attribute>();
		return attributes;
	}

	public void setAttributes(List<Attribute> attributes)
	{
		this.attributes = attributes;
	}
	
	public FeatureLayer clone()
	{
		FeatureLayer clone = new FeatureLayer( this );

		return clone;
	}

}
