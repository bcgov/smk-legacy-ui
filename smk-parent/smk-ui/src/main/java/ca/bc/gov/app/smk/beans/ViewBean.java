package ca.bc.gov.app.smk.beans;

import java.io.IOException;
import java.io.Serializable;
import java.net.MalformedURLException;
import java.util.Map;

import javax.annotation.PostConstruct;
import javax.faces.application.FacesMessage;
import javax.faces.bean.ManagedBean;
import javax.faces.bean.ViewScoped;
import javax.faces.context.ExternalContext;
import javax.faces.context.FacesContext;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import ca.bc.gov.app.smk.dao.SMKServiceHandler;
import ca.bc.gov.app.smks.model.MapConfiguration;

@SuppressWarnings("restriction")
@ManagedBean(name="ViewBean", eager=true)
@ViewScoped
public class ViewBean implements Serializable
{
	private static final long serialVersionUID = -2177139413897969637L;

	private MapConfiguration resource;
	// private CouchDAO dao;
	// private HashMap<String, Document> loadedMpcmAttributes;
	// private String contentStyle;
	// private boolean showPublishedVersion;
	// private String serviceUrl;

	@PostConstruct
    public void init()
	{
		ExternalContext externalContext = FacesContext.getCurrentInstance().getExternalContext();
		Map<String, String> queryString = externalContext.getRequestParameterMap();
		// showPublishedVersion = true;

		if(queryString.containsKey("id"))
		{
			// load the resource from couch... that's pretty much it.
			try
			{
				String serviceUrl = externalContext.getInitParameter("lmfService");
				SMKServiceHandler service  = new SMKServiceHandler(serviceUrl);

				resource = service.getResource(queryString.get("id"));
			}
			catch (MalformedURLException e)
			{
				FacesContext.getCurrentInstance().addMessage(null, new FacesMessage(FacesMessage.SEVERITY_ERROR, "Error loading DMF resource:", e.getMessage()));
				e.printStackTrace();
			}
			catch (IOException e)
			{
				FacesContext.getCurrentInstance().addMessage(null, new FacesMessage(FacesMessage.SEVERITY_ERROR, "Error loading DMF resource:", e.getMessage()));
				e.printStackTrace();
			}
		}
	}

	public String getConfiguration() {
		if ( resource == null )
			return "{\"error\":\"no configuration loaded for " + FacesContext.getCurrentInstance().getExternalContext().getRequestParameterMap().get("id") + "\"}";
		try {
        	ObjectMapper mapper = new ObjectMapper();
        	return mapper.writeValueAsString(resource);
		}
		catch ( JsonProcessingException e ) {
			return "{\"error\":\"" + e + "\"}";
		}
	}

	public String getIdentification() {
		if ( resource == null ) return "(unknown)";
		return resource.getLmfId() + " v" + resource.getLmfRevision();
	}
}
