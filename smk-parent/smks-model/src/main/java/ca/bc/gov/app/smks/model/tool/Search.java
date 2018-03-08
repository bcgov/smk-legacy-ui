package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

import com.fasterxml.jackson.annotation.JsonIgnore;

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
