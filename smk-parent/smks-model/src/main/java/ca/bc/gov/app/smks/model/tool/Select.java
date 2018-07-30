package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.LayerStyle;
import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Select extends Tool
{
    private static final long serialVersionUID = -957897867850455509L;

    private LayerStyle style;
	private Double styleOpacity;
	
	public Select() 
	{
	    this.setTitle("Selection Panel");
	    this.setDescription("Select Panel");
	    this.setType(Tool.Type.SELECT.toString());
	}

	public Select( Select select ) {
		super( select );
		
		this.setStyle(new LayerStyle(select.getStyle()));
		this.setStyleOpacity(select.getStyleOpacity());
	}

    @Override
    public boolean equals( Object other ) {
        return super.equals(other);
    }

    @Override
    public int hashCode() {
        return getType().hashCode();
    }
    
	public LayerStyle getStyle()
	{
		if ( style == null ) style = new LayerStyle();
		return style;
	}

	public void setStyle(LayerStyle style)
	{
		this.style = style;
	}
	
	public Double getStyleOpacity()
	{
		return styleOpacity;
	}
	
	public void setStyleOpacity(Double styleOpacity)
	{
		this.styleOpacity = styleOpacity;
	}
}
