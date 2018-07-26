package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Measure extends Tool
{
    private static final long serialVersionUID = -6590326493245303797L;

    public Measure() 
	{
	    // empty constructor
	}

    public Measure( Measure about ) {
		super( about );
	}

	@Override
	public String getType() {
		return Tool.Type.MEASURE.toString();
	}

	@Override
	public String getTitle() {
		return "Measurement";
	}

    @Override
    public boolean equals( Object other ) {
        return super.equals(other);
    }
}
