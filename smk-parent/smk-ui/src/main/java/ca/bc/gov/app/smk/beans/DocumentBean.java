package ca.bc.gov.app.smk.beans;

import java.io.Serializable;
import java.util.Map;
import java.util.Scanner;

import javax.annotation.PostConstruct;
import javax.faces.bean.ManagedBean;
import javax.faces.bean.ViewScoped;
import javax.faces.context.ExternalContext;
import javax.faces.context.FacesContext;

import org.ektorp.AttachmentInputStream;

import ca.bc.gov.app.smk.dao.CouchDAO;

@ManagedBean(name="DocumentBean", eager=true)
@ViewScoped
public class DocumentBean  implements Serializable
{
	private static final long serialVersionUID = -1182189816830431481L;

	private String data;
	private String type;

	@SuppressWarnings("restriction")
	@PostConstruct
    public void init()
	{
		try
		{
			ExternalContext externalContext = FacesContext.getCurrentInstance().getExternalContext();
			Map<String, String> queryString = externalContext.getRequestParameterMap();

			String documentId = queryString.get("docid");
			String attachmentId = queryString.get("attid");
			//String type = queryString.get("type");

			FacesContext ctx = FacesContext.getCurrentInstance();
			String myConstantValue = ctx.getExternalContext().getInitParameter("couchdb");

			CouchDAO dao = new CouchDAO(myConstantValue, "", "");
			AttachmentInputStream stream = dao.getAttachment(documentId, attachmentId);

			Scanner scanner = new Scanner(stream);
			data = scanner.useDelimiter("\\A").next();
			scanner.close(); // Put this call in a finally block
		}
		catch(Exception e)
		{
			e.printStackTrace();
		}
	}

	public String getData()
	{
		return data;
	}

	public void setData(String data)
	{
		this.data = data;
	}

	public String getType()
	{
		return type;
	}

	public void setType(String type)
	{
		this.type = type;
	}
}
