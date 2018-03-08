package ca.bc.gov.app.smks.model.layer;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.CollectionLayer;
import ca.bc.gov.app.smks.model.Layer;

@JsonInclude(Include.NON_NULL)
public class Folder extends CollectionLayer
{
	public Folder() { }

	protected Folder( Folder layer ) {
		super( layer );
	}

	public String getType()
	{
		return Layer.Type.Folder.getJsonType();
	}

	public Folder clone()
	{
		Folder clone = new Folder( this );

		return clone;
	}
}
