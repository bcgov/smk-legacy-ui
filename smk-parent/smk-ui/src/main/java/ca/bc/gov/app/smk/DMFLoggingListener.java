package ca.bc.gov.app.smk;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

public class DMFLoggingListener implements ServletContextListener
{
	public void contextInitialized(ServletContextEvent arg)
	{
		// Bridge java.util.logging to log4j to support JSF logging. Currently 
		// disabled for performance reasons.
		// SLF4JBridgeHandler.removeHandlersForRootLogger();
		// SLF4JBridgeHandler.install();
	}

	public void contextDestroyed(ServletContextEvent arg)
	{
	}
}