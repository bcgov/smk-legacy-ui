package ca.bc.gov.app.smks.model;

import java.io.Serializable;

public class ViewerLocation implements Serializable 
{
    private static final long serialVersionUID = 1029985545555331272L;
    
    private Double[] extent = {-139.1782, 47.6039, -110.3533, 60.5939};
    private Double[] center = {-139.1782, 47.6039};
    private Double zoom = 5.0;
    
    public ViewerLocation()
    {
        //empty constructor
    }
    
    public ViewerLocation(ViewerLocation clone)
    {
        this.setExtent(clone.getExtent());
        this.setCenter(clone.getCenter());
        this.setZoom(clone.getZoom());
    }
    
    public Double[] getExtent() {
      if ( extent == null ) extent = new Double[4];
      return extent;
    }
    
    public void setExtent(Double[] initialExtent) { this.extent = initialExtent; }

    public Double[] getCenter()
    {
        return center;
    }

    public void setCenter(Double[] center)
    {
        this.center = center;
    }

    public Double getZoom()
    {
        return zoom;
    }

    public void setZoom(Double zoom)
    {
        this.zoom = zoom;
    }
}
