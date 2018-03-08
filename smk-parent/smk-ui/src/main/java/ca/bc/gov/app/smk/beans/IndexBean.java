package ca.bc.gov.app.smk.beans;

import java.io.IOException;
import java.io.Serializable;
import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.annotation.PostConstruct;
import javax.faces.bean.ManagedBean;
import javax.faces.bean.ViewScoped;
import javax.faces.context.FacesContext;

import org.primefaces.context.RequestContext;

import ca.bc.gov.app.smk.dao.CouchDAO;
import ca.bc.gov.app.smk.dao.SMKServiceHandler;
import ca.bc.gov.app.smks.model.MapConfiguration;

@SuppressWarnings("restriction")
@ManagedBean(name="IndexBean", eager=true)
@ViewScoped
public class IndexBean implements Serializable
{
	private static final long serialVersionUID = -3809642415932829264L;

	private SMKServiceHandler service;

	@PostConstruct
    public void init()
	{
		try
		{
			FacesContext ctx = FacesContext.getCurrentInstance();

			String serviceUrl = ctx.getExternalContext().getInitParameter("lmfService");
			service  = new SMKServiceHandler(serviceUrl);
		}
		catch (MalformedURLException e)
		{
			e.printStackTrace();
		}
		catch (IOException e)
		{
			e.printStackTrace();
		}
	}

	@SuppressWarnings("rawtypes")
	public void publishResource()
	{
		FacesContext context = FacesContext.getCurrentInstance();
	    Map map = context.getExternalContext().getRequestParameterMap();
	    String value = (String) map.get("param");

	    MapConfiguration resourceToPublish = null;

	    for(MapConfiguration resource : getEditableConfigs())
		{
			if(resource.getLmfId().equals(value))
			{
				resourceToPublish = resource;
				break;
			}
		}

	    if(resourceToPublish != null)
	    {
		    try
			{
				service.publish(resourceToPublish);
			}
			catch (MalformedURLException e)
			{
				e.printStackTrace();
			}
			catch (IOException e)
			{
				e.printStackTrace();
			}
	    }

		RequestContext.getCurrentInstance().update("dmf:myMashups");
		RequestContext.getCurrentInstance().update("dmf:allMashups");
	}

	@SuppressWarnings("rawtypes")
	public void deleteResource()
	{
		FacesContext context = FacesContext.getCurrentInstance();
	    Map map = context.getExternalContext().getRequestParameterMap();
	    String value = (String) map.get("param");

		MapConfiguration deadResource = null;

		for(MapConfiguration resource : getPublishedConfigs())
		{
			if(resource.getLmfId().equals(value))
			{
				deadResource = resource;
				break;
			}
		}

		if(deadResource == null)
		{
			for(MapConfiguration resource : getEditableConfigs())
			{
				if(resource.getLmfId().equals(value))
				{
					deadResource = resource;
					break;
				}
			}
		}

		if(deadResource != null)
		{
			try
			{
				if(deadResource.isPublished())
				{
					service.unPublishResource(deadResource);
				}
				else
				{
					service.deleteResource(deadResource);
				}
			}
			catch (MalformedURLException e)
			{
				e.printStackTrace();
			}
			catch (IOException e)
			{
				e.printStackTrace();
			}

			RequestContext.getCurrentInstance().update("dmf:myMashups");
			RequestContext.getCurrentInstance().update("dmf:allMashups");
		}
	}

	public void exportResource()
	{

	}

	public List<MapConfiguration> getEditableConfigs()
	{
		try {
			return service.getEditableConfigs();
		}
		catch (MalformedURLException e)
		{
			e.printStackTrace();
		}
		catch (IOException e)
		{
			e.printStackTrace();
		}
		return null;
	}

	public List<MapConfiguration> getPublishedConfigs()
	{
		try {
			return service.getPublishedConfigs();
		}
		catch (MalformedURLException e)
		{
			e.printStackTrace();
		}
		catch (IOException e)
		{
			e.printStackTrace();
		}
		return null;
	}
}
