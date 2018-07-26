package ca.bc.gov.app.smks.model.layer;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.CollectionLayer;
import ca.bc.gov.app.smks.model.Layer;

@JsonInclude(Include.NON_NULL)
public class Group extends CollectionLayer
{
    private static final long serialVersionUID = -5270343788295638530L;

    public Group() { }

	protected Group( Group layer ) {
		super( layer );
	}

	@Override
	public String getType()
	{
		return Layer.Type.GROUP.getJsonType();
	}
}
