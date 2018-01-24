package ca.bc.gov.databc.smks.model.layer;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.databc.smks.model.CollectionLayer;

@JsonInclude(Include.NON_NULL)
public class Folder extends CollectionLayer
{
	public Folder() { }

	protected Folder( Folder layer ) {
		super( layer );
	}

	public Folder clone()
	{
		Folder clone = new Folder( this );

		return clone;
	}
}
