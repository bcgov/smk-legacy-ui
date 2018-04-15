package ca.bc.gov.app.smks.model.tool;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonIgnore;

import ca.bc.gov.app.smks.model.LayerStyle;
import ca.bc.gov.app.smks.model.Tool;

import com.fasterxml.jackson.annotation.JsonIgnore;

@JsonInclude(Include.NON_NULL)
public class Identify extends Tool
{
	private LayerStyle style;
	private Double styleOpacity;
	
	public Identify() {}

	protected Identify( Identify about ) {
		super( about );
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
}
