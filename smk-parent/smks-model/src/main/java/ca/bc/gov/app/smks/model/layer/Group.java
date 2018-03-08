package ca.bc.gov.app.smks.model.layer;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.CollectionLayer;
import ca.bc.gov.app.smks.model.Layer;

@JsonInclude(Include.NON_NULL)
public class Group extends CollectionLayer
{
	public Group() { }

	protected Group( Group layer ) {
		super( layer );
	}

	public String getType()
	{
		return Layer.Type.Group.getJsonType();
	}

	public Group clone()
	{
		Group clone = new Group( this );

		return clone;
	}
}
