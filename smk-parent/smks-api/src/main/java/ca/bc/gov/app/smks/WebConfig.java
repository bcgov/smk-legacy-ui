package ca.bc.gov.app.smks;

import java.net.MalformedURLException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.web.multipart.commons.CommonsMultipartResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

import com.fasterxml.jackson.core.JsonParser.Feature;
import com.fasterxml.jackson.databind.ObjectMapper;

import ca.bc.gov.app.smks.dao.CouchDAO;
import ca.bc.gov.app.smks.dao.LayerCatalogDAO;
import ca.bc.gov.app.smks.service.controller.MapConfigServiceController;
import ca.bc.gov.app.smks.service.controller.PublishedMapConfigServiceController;
import ca.bc.gov.app.smks.service.controller.SharedMapConfigController;

@Configuration
@EnableWebMvc
@ComponentScan(basePackages = "ca.bc.gov.app.smks")
@PropertySource("classpath:application.properties")
public class WebConfig extends WebMvcConfigurerAdapter
{
	private static Log logger = LogFactory.getLog(WebConfig.class);

	@Autowired
	private Environment env;

	@Bean
	public CouchDAO couchDAO() throws MalformedURLException
	{
		String name = env.getProperty("couchdb.name");
		logger.debug(" >> WebConfig.couchDAO() : Initialize Couch DAO Bean " + name );
		String url = env.getProperty("couchdb.url");
		String user = env.getProperty("couchdb.admin.name");
		String password = env.getProperty("couchdb.admin.password");

		return new CouchDAO(url, name, user, password);
	}

	@Bean
	public LayerCatalogDAO layerCatalogDao()
	{
		return new LayerCatalogDAO(env.getProperty("mpcm.rest.url"), env.getProperty("mpcm.arcgis.server"), env.getProperty("mpcm.wms.server"));
	}

	@Bean
	public CommonsMultipartResolver multipartResolver()
	{
		CommonsMultipartResolver resolver = new CommonsMultipartResolver();
		resolver.setMaxUploadSize(new Long(env.getProperty("attachment.max.size")));

		return resolver;
	}

	@Bean
	public ObjectMapper jsonObjectMapper()
	{
	    ObjectMapper mapper = new ObjectMapper();
	    mapper.configure(Feature.ALLOW_UNQUOTED_CONTROL_CHARS, true);
	    
	    return mapper;
	}
	
    @Bean
    public SharedMapConfigController sharedMapConfigController()
    {
        return new SharedMapConfigController();
    }
    
	@Bean
    public PublishedMapConfigServiceController publishedMapConfigServiceController()
    {
        return new PublishedMapConfigServiceController();
    }
	
	@Bean
    public MapConfigServiceController mapConfigServiceController()
    {
        return new MapConfigServiceController();
    }
	
	@Override
	public void addCorsMappings(CorsRegistry registry)
	{
		registry.addMapping("/**");
	}
}