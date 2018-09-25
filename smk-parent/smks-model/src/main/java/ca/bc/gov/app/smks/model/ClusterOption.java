package ca.bc.gov.app.smks.model;

import java.io.Serializable;

public class ClusterOption implements Serializable 
{
    private static final long serialVersionUID = -3878995442889255428L;

    private boolean showCoverageOnHover;
    
    public ClusterOption()
    {
        showCoverageOnHover = false;
    }

    public boolean isShowCoverageOnHover()
    {
        return showCoverageOnHover;
    }

    public void setShowCoverageOnHover(boolean showCoverageOnHover)
    {
        this.showCoverageOnHover = showCoverageOnHover;
    }
}
