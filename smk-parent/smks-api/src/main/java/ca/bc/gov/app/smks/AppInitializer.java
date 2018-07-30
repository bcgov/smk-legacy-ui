package ca.bc.gov.app.smks;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer;

public class AppInitializer extends AbstractAnnotationConfigDispatcherServletInitializer 
{
	private static Log localLogger = LogFactory.getLog(AppInitializer.class);
	
	@SuppressWarnings({ "unchecked", "rawtypes" })
	@Override
	protected Class[] getRootConfigClasses()
	{
	    localLogger.debug(" >> Initializer.getRootConfigClasses()");
		return new Class[] { WebConfig.class };
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	@Override
	protected Class[] getServletConfigClasses() 
	{
	    localLogger.debug(" >> Initializer.getServletConfigClasses()");
		return new Class[]{};
	}

	@Override
	protected String[] getServletMappings() 
	{
	    localLogger.debug(" >> Initializer.getServletMappings()");
		return new String[] { "/" };
	}
}
