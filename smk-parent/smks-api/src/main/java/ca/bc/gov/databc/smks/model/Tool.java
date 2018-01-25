package ca.bc.gov.databc.smks.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class Tool implements Cloneable
{
	public Tool() { }

	protected Tool( Tool tool ) {}

	public Tool clone()
	{
		Tool clone = new Tool( this );

		return clone;
	}

}
