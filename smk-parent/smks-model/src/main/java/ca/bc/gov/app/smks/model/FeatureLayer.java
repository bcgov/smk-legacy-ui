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
    private static final long serialVersionUID = 2025337389308495121L;

    private List<Attribute> attributes;
	private String geometryAttribute;
    private String titleAttribute;
    private Object queries;
    
	public FeatureLayer()
	{
	    // empty constructor
	}

	protected FeatureLayer( FeatureLayer layer )
	{
		super( layer );

		this.setGeometryAttribute(layer.getGeometryAttribute());
		this.setTitleAttribute(layer.getTitleAttribute());
		this.setQueries(layer.getQueries());
		
		for(Attribute a : layer.getAttributes())
		{
			this.getAttributes().add(new Attribute(a));
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
}
