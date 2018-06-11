package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonIgnore;

import ca.bc.gov.app.smks.model.LayerStyle;
import ca.bc.gov.app.smks.model.Tool;

@JsonInclude(Include.NON_NULL)
public class Identify extends Tool
{
	private LayerStyle style;
	private Double styleOpacity;
	private Integer tolerance;
	public Identify() {}

	protected Identify( Identify identify ) {
		super( identify );
		this.tolerance = identify.getTolerance();
		this.styleOpacity = identify.getStyleOpacity();
		this.style = identify.getStyle();
	}

	public String getType() {
		return Tool.Type.identify.toString();
	}

	public String getTitle() {
		return "Identify Panel";
	}

	public Identify clone()
	{
		Identify clone = new Identify( this );
		
		return clone;
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
