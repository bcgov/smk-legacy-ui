package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class About extends Tool
{
    private static final long serialVersionUID = 8108413477451380277L;

    private String content;

	public About() {}

	public About( About about ) {
		super( about );
		this.setContent( about.getContent());
	}

	@Override
	public String getType() {
		return Tool.Type.ABOUT.toString();
	}

	@Override
	public String getTitle() {
		return "About Panel";
	}

	@Override
    public String getDescription() {
        return "Provide the contents of about panel.";
    }

    @Override
    public boolean equals( Object other ) {
        return super.equals(other);
    }
    
    @Override
    public int hashCode() {
        return getType().hashCode();
    }
    
	@Override
    public boolean isConfigured() {
        return true;
    }
    
    public String getContent() {
		return content;
	}
	public void setContent(String content) {
		this.content = content;
	}
}
