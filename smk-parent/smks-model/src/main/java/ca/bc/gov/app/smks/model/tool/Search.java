package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Search extends Tool
{
    private static final long serialVersionUID = -4453998961283799235L;

    public Search() 
    {
        // empty constructor
    }

	public Search( Search search ) {
		super( search );
	}

	@Override
	public String getType() {
		return Tool.Type.SEARCH.toString();
	}

	@Override
	public String getTitle() {
		return "Search Panel";
	}

    @Override
    public boolean equals( Object other ) {
        return super.equals(other);
    }
}
