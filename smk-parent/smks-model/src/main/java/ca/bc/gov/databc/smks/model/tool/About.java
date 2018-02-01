package ca.bc.gov.databc.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonIgnore;

import ca.bc.gov.databc.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class About extends Tool
{
    private String content;

	public About() {}

	protected About( About about ) {
		super( about );
		this.setContent( about.getContent());
	}

	public String getType() {
		return Tool.Type.about.toString();
	}

	public String getTitle() {
		return "About Panel";
	}

	public String getContent() { return content; }
	public void setContent(String content) { this.content = content; }

	public About clone()
	{
		About clone = new About( this );

		return clone;
	}

}
