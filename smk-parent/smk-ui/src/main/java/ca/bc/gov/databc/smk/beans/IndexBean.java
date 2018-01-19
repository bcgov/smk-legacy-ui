package ca.bc.gov.databc.smk.beans;

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

import ca.bc.gov.databc.smk.dao.CouchDAO;
import ca.bc.gov.databc.smk.dao.SMKServiceHandler;
import ca.bc.gov.databc.smk.model.DMFResource;

@SuppressWarnings("restriction")
@ManagedBean(name="IndexBean", eager=true)
@ViewScoped
public class IndexBean implements Serializable
{
	private static final long serialVersionUID = -3809642415932829264L;

	//private CouchDAO mashupDao;
	private SMKServiceHandler service;
	private List<DMFResource> editableConfigs;
	private List<DMFResource> publishedConfigs;
	
	@PostConstruct
    public void init() 
	{
		try 
		{
			FacesContext ctx = FacesContext.getCurrentInstance();
			//String myConstantValue = ctx.getExternalContext().getInitParameter("couchdb");
			
			String serviceUrl = ctx.getExternalContext().getInitParameter("lmfService");
			service  = new SMKServiceHandler(serviceUrl);

			editableConfigs = service.getEditableConfigs();
			publishedConfigs = service.getPublishedConfigs();

			// set published document flags
			for(DMFResource published : publishedConfigs)
			{
				for(DMFResource editable : editableConfigs)
				{
					if(published.getLmfId().equals(editable.getLmfId()))
					{
						editable.setPublished(true);
						break;
					}
				}
			}
			
			//mashupDao = new CouchDAO(myConstantValue);
			//allMashups = mashupDao.getAllResources();
			
		} 
		catch (MalformedURLException e) 
		{
			// TODO Auto-generated catch block
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
	    
	    DMFResource resourceToPublish = null;
	    
	    for(DMFResource resource : editableConfigs)
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
		
		DMFResource deadResource = null;
		
		for(DMFResource resource : publishedConfigs)
		{
			if(resource.getLmfId().equals(value))
			{
				deadResource = resource;
				break;
			}
		}
		
		if(deadResource == null)
		{
			for(DMFResource resource : editableConfigs)
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
			
			//mashupDao.removeResource(deadResource);
			
			RequestContext.getCurrentInstance().update("dmf:myMashups");
			RequestContext.getCurrentInstance().update("dmf:allMashups");
		}
	}
	
	public void exportResource()
	{
		
	}
	
	public List<DMFResource> getEditableConfigs()
	{
		return editableConfigs;
	}

	public void setEditableConfigs(List<DMFResource> configs) 
	{		
		this.editableConfigs = configs;
	}
	
	public List<DMFResource> getPublishedConfigs()
	{
		return publishedConfigs;
	}

	public void setPublishedConfigs(List<DMFResource> configs) 
	{		
		this.publishedConfigs = configs;
	}
}
