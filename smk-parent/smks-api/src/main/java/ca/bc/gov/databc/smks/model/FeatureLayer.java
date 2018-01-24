package ca.bc.gov.databc.smks.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class FeatureLayer extends Layer
{
	private List<Attribute> attributes;
	private String geometryAttribute;
    private String titleAttribute;

	public FeatureLayer()
	{
	}

	protected FeatureLayer( FeatureLayer layer )
	{
		super( layer );

		this.setGeometryAttribute(layer.getGeometryAttribute());
		this.setTitleAttribute(layer.getTitleAttribute());
		for(Attribute a : layer.getAttributes())
		{
			this.getAttributes().add(a.clone());
		}
		// this.setId(layer.getId());
		// this.setTitle(layer.getTitle());
		// this.setAttribution(layer.getAttribution());
		// this.setMetadataUrl(layer.getMetadataUrl());
		// this.setIsVisible(layer.getIsVisible());
		// this.setMaxScale(layer.getMaxScale());
		// this.setMinScale(layer.getMinScale());
		// this.setOpacity(layer.getOpacity());
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

		// clone.setGeometryAttribute(geometryAttribute);
		// clone.setTitleAttribute(titleAttribute);
		// for(Attribute a : attributes)
		// {
		// 	clone.getAttributes().add(a.clone());
		// }

		return clone;
	}

}
