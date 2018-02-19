package ca.bc.gov.databc.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonIgnore;

import ca.bc.gov.databc.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Search extends Tool
{
	public Search() {}

	protected Search( Search about ) {
		super( about );
	}

	public String getType() {
		return Tool.Type.search.toString();
	}

	public String getTitle() {
		return "Search Panel";
	}

	public Search clone()
	{
		Search clone = new Search( this );

		return clone;
	}

}
