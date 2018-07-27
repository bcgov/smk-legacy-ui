package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import ca.bc.gov.app.smks.model.LayerStyle;
import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Identify extends Tool
{
    private static final long serialVersionUID = 4091129321421088691L;

    private LayerStyle style;
	private Double styleOpacity;
	private Integer tolerance = 5;
	
	public Identify() 
	{
	    // empty constructor
	}

	public Identify( Identify identify ) {
		super( identify );
		this.tolerance = identify.getTolerance();
		this.styleOpacity = identify.getStyleOpacity();
		this.style = new LayerStyle(identify.getStyle());
	}

	@Override
	public String getType() {
		return Tool.Type.IDENTIFY.toString();
	}

	@Override
	public String getTitle() {
		return "Identify Panel";
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
	
	public Integer getTolerance()
	{
	    return this.tolerance;
	}
	
	public void setTolerance(Integer tolerance)
	{
	    this.tolerance = tolerance;
	}
}
