package ca.bc.gov.app.smks.model.layer;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.CollectionLayer;
import ca.bc.gov.app.smks.model.Layer;

@JsonInclude(Include.NON_NULL)
public class Folder extends CollectionLayer
{
    private static final long serialVersionUID = 1274298216353015757L;

    public Folder() { }

	protected Folder( Folder layer ) {
		super( layer );
	}

	@Override
	public String getType()
	{
		return Layer.Type.FOLDER.getJsonType();
	}
}
