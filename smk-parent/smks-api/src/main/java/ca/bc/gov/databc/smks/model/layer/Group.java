package ca.bc.gov.databc.smks.model.layer;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.databc.smks.model.CollectionLayer;

@JsonInclude(Include.NON_NULL)
public class Group extends CollectionLayer
{
	public Group() { }

	protected Group( Group layer ) {
		super( layer );
	}

	public Group clone()
	{
		Group clone = new Group( this );

		return clone;
	}
}
