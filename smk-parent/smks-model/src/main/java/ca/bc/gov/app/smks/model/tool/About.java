package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

import com.fasterxml.jackson.annotation.JsonIgnore;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

@JsonInclude(Include.NON_NULL)
public class About extends Tool
{
	private static Log logger = LogFactory.getLog(About.class);

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

    public String getDescription() {
        return "Provide the contents of about panel.";
    }

    public boolean isConfigured() {
        return true;
    }

	public String getContent() {
		// logger.debug( "get " + content );
		return content;
	}
	public void setContent(String content) {
		// logger.debug( "set " + content );
		this.content = content;
	}

	public About clone()
	{
		About clone = new About( this );

		return clone;
	}

}
