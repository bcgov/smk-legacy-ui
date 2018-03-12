package ca.bc.gov.app.smks;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer;

public class AppInitializer extends AbstractAnnotationConfigDispatcherServletInitializer 
{
	private static Log logger = LogFactory.getLog(AppInitializer.class);
	
	@SuppressWarnings({ "unchecked", "rawtypes" })
	@Override
	protected Class[] getRootConfigClasses()
	{
		logger.debug(" >> Initializer.getRootConfigClasses()");
		return new Class[] { WebConfig.class };
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	@Override
	protected Class[] getServletConfigClasses() 
	{
		logger.debug(" >> Initializer.getServletConfigClasses()");
		return null;
	}

	@Override
	protected String[] getServletMappings() 
	{
		logger.debug(" >> Initializer.getServletMappings()");
		return new String[] { "/" };
	}
}
