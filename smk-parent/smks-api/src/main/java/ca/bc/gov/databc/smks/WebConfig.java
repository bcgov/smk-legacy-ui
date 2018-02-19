package ca.bc.gov.databc.smks;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.web.multipart.commons.CommonsMultipartResolver;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import ca.bc.gov.databc.smks.dao.CouchDAO;
import ca.bc.gov.databc.smks.dao.LayerCatalogDAO;

@Configuration
@EnableWebMvc
@ComponentScan(basePackages = "ca.bc.gov.databc.smks")
@PropertySource("classpath:application.properties")
public class WebConfig
{
	private static Log logger = LogFactory.getLog(WebConfig.class);

	@Autowired
	private Environment env;

	@Bean
	public CouchDAO couchDAO() throws Exception
	{
		String name = env.getProperty("couchdb.name");
		logger.debug(" >> WebConfig.couchDAO() : Initialize Couch DAO Bean " + name );
		String url = env.getProperty("couchdb.url");
		String user = env.getProperty("couchdb.admin.name");
		String password = env.getProperty("couchdb.admin.password");

		return new CouchDAO(url, name, user, password);
	}

	@Bean
	public LayerCatalogDAO layerCatalogDao() throws Exception
	{
		LayerCatalogDAO lcDao = new LayerCatalogDAO(env.getProperty("mpcm.rest.url"), env.getProperty("mpcm.arcgis.server"), env.getProperty("mpcm.wms.server"));

		return lcDao;
	}

	@Bean
	public CommonsMultipartResolver multipartResolver() throws Exception
	{
		CommonsMultipartResolver resolver = new CommonsMultipartResolver();
		resolver.setMaxUploadSize(new Long(env.getProperty("attachment.max.size")));

		return resolver;
	}
}