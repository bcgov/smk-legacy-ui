package ca.bc.gov.app.smks;

import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.documentationConfiguration;
import static org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.delete;
import static org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.get;
import static org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.post;
import static org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.put;
import static org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath;
import static org.springframework.restdocs.payload.PayloadDocumentation.responseFields;
import static org.springframework.restdocs.request.RequestDocumentation.parameterWithName;
import static org.springframework.restdocs.request.RequestDocumentation.pathParameters;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.List;

import javax.annotation.Resource;

import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.restdocs.JUnitRestDocumentation;
import org.springframework.restdocs.payload.FieldDescriptor;
import org.springframework.restdocs.request.ParameterDescriptor;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

import com.fasterxml.jackson.databind.ObjectMapper;

import ca.bc.gov.app.smks.WebConfig;
import ca.bc.gov.app.smks.dao.CouchDAO;
import ca.bc.gov.app.smks.model.MapConfiguration;
import ca.bc.gov.app.smks.model.MapSurround;
import ca.bc.gov.app.smks.model.MapViewer;
import ca.bc.gov.app.smks.model.ViewerLocation;
import ca.bc.gov.app.smks.model.tool.Dropdown;
import ca.bc.gov.app.smks.model.tool.Menu;

/**
 * Unit tests for SMK endpoints.
 */

@EnableWebMvc
@RunWith(SpringJUnit4ClassRunner.class)
@ComponentScan(basePackages = "ca.bc.gov.app.smks")
@ContextConfiguration(classes = WebConfig.class)
@WebAppConfiguration("src/main/webapp")
public class AppTest extends WebMvcConfigurationSupport
{
	@Rule
	public JUnitRestDocumentation restDocumentation = new JUnitRestDocumentation();

	@Resource
	private WebApplicationContext context;
	private MockMvc mockMvc;

	@Autowired
	private CouchDAO couchDAO;

	@Before
	public void setUp() {
		this.mockMvc = MockMvcBuilders.webAppContextSetup(this.context)
				.apply(documentationConfiguration(this.restDocumentation))
				.build();
	}

    public AppTest( )
    {
    }

    /**
     * Rigourous Testing :-)
     */
    @Test
    public void testHealthCheck()
    {
    	try {
			generateRootServiceDocs();
		} catch (Exception e) {
			e.printStackTrace();
		}
    }

	@Test
    public void testLayerConfig()
    {
    	try {
	    	generateLayerConfigServiceDocs();
		} catch (Exception e) {
			e.printStackTrace();
		}
    }

	@Test
    public void testMapConfig()
    {
    	try {
	    	generateMapConfigServiceDocs();
		} catch (Exception e) {
			e.printStackTrace();
		}
    }

    public void generateMapConfigServiceDocs() throws Exception
    {
    	// crud operations for map configurations
    	this.mockMvc.perform(get("/MapConfigurations/")
    				.accept(MediaType.APPLICATION_JSON))
    				.andExpect(status().isOk())
    				.andDo(document("mapconfig-all", responseFields(fieldWithPath("[].name").description("The name of the SMK Map Configuration"),
    																fieldWithPath("[].id").description("The ID of the SMK Map Configuration"),
    																fieldWithPath("[].revision").description("The current revision of the SMK Map Configuration"),
																	fieldWithPath("[].creator").description("The creator of the SMK Map Configuration").optional(),
																	fieldWithPath("[].valid").description("A flag indicating if the configuration matches the current SMK version specification").optional())));

    	// create and update
    	MapConfiguration test = new MapConfiguration();
    	test.setLmfId("my-application");
    	test.setName("My Application");
    	test.setSurround(new MapSurround());
    	test.getSurround().setType("default");
    	test.getSurround().setTitle("My Application");
    	test.setViewer(new MapViewer());
    	test.getViewer().setType("leaflet");
    	test.getViewer().setLocation(new ViewerLocation());
    	test.getViewer().getLocation().setExtent(new Double[4]);
    	test.getViewer().setBaseMap("Imagery");
    	test.getTools().add(new Menu());
    	test.getTools().add(new Dropdown());
    	
    	ObjectMapper mapper = new ObjectMapper();
    	String json = mapper.writeValueAsString(test);

    	// the create new
    	this.mockMvc.perform(post("/MapConfigurations/")
    				.contentType(MediaType.APPLICATION_JSON)
    				.content(json.getBytes())
    				.accept(MediaType.APPLICATION_JSON))
    				.andExpect(status().isCreated())
    				.andDo(document("mapconfig-crt"));

    	test = couchDAO.getMapConfiguration("my-application");

    	// get
    	this.mockMvc.perform(get("/MapConfigurations/{id}", "my-application")
					.accept(MediaType.APPLICATION_JSON))
					.andExpect(status().isOk())
					.andDo(document("mapconfig-get", pathParameters(parameterWithName("id").description("The SMK Map Configuration ID"))));

    	test.setName("My Application Edited");
    	json = mapper.writeValueAsString(test);

    	// the update
    	this.mockMvc.perform(put("/MapConfigurations/{id}", "my-application")
    				.contentType(MediaType.APPLICATION_JSON)
    				.content(json.getBytes())
    				.accept(MediaType.APPLICATION_JSON))
    				.andExpect(status().isOk())
    				.andDo(document("mapconfig-upd", pathParameters(parameterWithName("id").description("The SMK Map Configuration ID"))));

    	// stub attachment (just a simple geojson file)
    	json = "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"id\":\"test\",\"properties\":{\"_style\":4,\"name\":\"TestBox\",\"description\":\"This is a test box.\"},\"geometry\":{\"type\":\"Polygon\",\"coordinates\":[[[-123.631897,48.679514],[-123.298874,48.694445],[-123.30574,48.541927],[-123.666916,48.485524],[-123.631897,48.679514]]]}}]}";
    	// crud operations for map configurations attachments
    	// create an attachment
    	//@RequestParam("id") String id, @RequestParam("type") String type)
    	
    	List<ParameterDescriptor> requestParams = new ArrayList<ParameterDescriptor>();
    	requestParams.add(parameterWithName("file").description("The file to attach"));
    	requestParams.add(parameterWithName("id").description("The ID to use for the attachment"));
    	requestParams.add(parameterWithName("type").description("The type of attachment, to help differentiate between octet-streams"));
    	
    	MockMultipartFile myFile = new MockMultipartFile("file", "file.json", "application/json", json.getBytes());
    	
    	// can't be documented yet. MockMvc form multipart request don't appear to work with the documentation classes
    	this.mockMvc.perform(MockMvcRequestBuilders.fileUpload("/MapConfigurations/{config_id}/Attachments/", "my-application")
    	            .file(myFile)
    	            //.contentType(MediaType.APPLICATION_JSON)
                    .param("id", "my-attachment")
                    .param("type", "geojson")
    	            .accept(MediaType.APPLICATION_JSON))
    	            .andExpect(status().isOk());
    	            //.andDo(document("mapconfig-attch-crt", pathParameters(parameterWithName("config_id").description("The SMK Map Configuration ID"))))
    	            //.andDo(document("mapconfig-attch-crt", org.springframework.restdocs.request.RequestDocumentation.requestParameters(requestParams)));
    	                    
    	// get all
    	this.mockMvc.perform(get("/MapConfigurations/{config_id}/Attachments/", "my-application")
    	            .accept(MediaType.APPLICATION_JSON))
    	            .andExpect(status().isOk())
    	            .andDo(document("mapconfig-attch-all", pathParameters(parameterWithName("config_id").description("The SMK Map Configuration ID"))));
    	
    	// get specific
    	this.mockMvc.perform(get("/MapConfigurations/{config_id}/Attachments/{attachment_id}", "my-application", "my-attachment")
    	            .accept(MediaType.APPLICATION_JSON))
    	            .andExpect(status().isOk())
    	            .andDo(document("mapconfig-attch-get", pathParameters(parameterWithName("config_id").description("The SMK Map Configuration ID"), parameterWithName("attachment_id").description("The attachment ID for a map configurations attachment"))));
    	
    	// update - same issue as create :(
    	this.mockMvc.perform(MockMvcRequestBuilders.fileUpload("/MapConfigurations/{config_id}/Attachments/{attachment_id}", "my-application", "my-attachment")
    	            .file(myFile)
    	            .accept(MediaType.APPLICATION_JSON))
    	            .andExpect(status().isOk());
    	            //.andDo(document("mapconfig-attch-upd", pathParameters(parameterWithName("config_id").description("The SMK Map Configuration ID"), 
    	            //                                                      parameterWithName("attachment_id").description("The attachment ID for a map configurations attachment"))));
    	
    	// delete
    	this.mockMvc.perform(delete("/MapConfigurations/{config_id}/Attachments/{attachment_id}", "my-application", "my-attachment")
    	            .accept(MediaType.APPLICATION_JSON)).andExpect(status().isOk())
    	            .andDo(document("mapconfig-attch-del", pathParameters(parameterWithName("config_id").description("The SMK Map Configuration ID"), 
    	                                                   parameterWithName("attachment_id").description("The attachment ID for a map configurations attachment"))));
        
    	// publish
    	this.mockMvc.perform(post("/MapConfigurations/Published/{id}", "my-application")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andDo(document("mapconfig-pub", pathParameters(parameterWithName("id").description("The SMK Map Configuration ID"))));
    	
    	// get all
    	this.mockMvc.perform(get("/MapConfigurations/Published/")
    	            .accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andDo(document("mapconfig-pub-all"));
    	
    	// get one
    	this.mockMvc.perform(get("/MapConfigurations/Published/{id}", "my-application")
                    .accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andDo(document("mapconfig-pub-get", pathParameters(parameterWithName("id").description("The SMK Map Configuration ID"))));
    	
    	// un-publish
    	this.mockMvc.perform(delete("/MapConfigurations/Published/{id}", "my-application")
                    .accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andDo(document("mapconfig-pub-del", pathParameters(parameterWithName("id").description("The SMK Map Configuration ID"))));
    	
    	// Delete map config
        this.mockMvc.perform(delete("/MapConfigurations/{id}", "my-application")
                    .accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andDo(document("mapconfig-del", pathParameters(parameterWithName("id").description("The SMK Map Configuration ID"))));
        
        
    }

    public void generateRootServiceDocs() throws Exception
    {
    	this.mockMvc.perform(get("/Health")
    			    .accept(MediaType.APPLICATION_JSON))
    	            .andExpect(status().isOk())
    	            .andDo(document("index", responseFields(fieldWithPath("serviceStatus").description("Indicates if the service is running"),
    	            										fieldWithPath("couchDBStatus").description("Indicates if the Couch DB is running"))));
    }

    public void generateLayerConfigServiceDocs() throws Exception
    {
    	FieldDescriptor[] mpcmInfoLayer = new FieldDescriptor[]
    	{
			fieldWithPath("id").description("The layer ID used by SMK"),
			fieldWithPath("mpcmId").description("The layers ID used in MPCM"),
			fieldWithPath("label").description("The default layer label"),
			fieldWithPath("sublayers").description("A listing of layers that are referenced by this folder or group"),
			fieldWithPath("layerUrl").description("The URL used for referencing this layer in the MPCM Layer Catalog")
		};

    	// default "all" fetch for DataBC layer catalog
    	this.mockMvc.perform(get("/LayerLibrary/")
    						 .accept(MediaType.APPLICATION_JSON))
    						 .andExpect(status().isOk())
    						 .andDo(document("layercatalog-all"));


    	FieldDescriptor[] dynamicService = new FieldDescriptor[]
		{
			fieldWithPath(".type").description("The layer type. MPCM layers are always DynamicServiceLayers"),
			fieldWithPath(".id").description("The layer ID used by SMK"),
			fieldWithPath(".label").description("The label / name for the layer"),
			fieldWithPath(".isVisible").description("Indicates if the layer will be visible in SMK by default"),
			fieldWithPath(".isSelectable").description("Indicates if the layer will be selectable in SMK by default"),
			fieldWithPath(".isExportable").description("Indicates if the layer will be exportable in SMK by default"),
			fieldWithPath(".attribution").description("The layer attribution and copyright details"),
			fieldWithPath(".serviceUrl").description("The layers map service URL"),
			fieldWithPath(".opacity").description("The default layer opacity"),
			fieldWithPath(".minScale").description("The minimum scale the layer is displayed at"),
			fieldWithPath(".maxScale").description("The maximum scale the layer is displayed at"),
			fieldWithPath(".mpcmId").description("The layers ID used in MPCM"),
			fieldWithPath(".mpcmWorkspace").description("The layers workspace used in MPCM"),
			fieldWithPath(".metadataUrl").description("The layers metadata URL"),
			fieldWithPath(".attributes").ignored(),
			fieldWithPath(".dynamicLayers").ignored()
		};
    	// fetch a single record
    	this.mockMvc.perform(get("/LayerLibrary/{id}", 1)
					 .accept(MediaType.APPLICATION_JSON))
					 .andExpect(status().isOk())
					 .andDo(document("layercatalog-get", pathParameters(parameterWithName("id").description("The MPCM id of a Layer in the Layer Catalog"))))
					 .andDo(document("index"));

    	FieldDescriptor[] wmsInfoLayer = new FieldDescriptor[]
    	{
			fieldWithPath("title").description("The title of the layer"),
			fieldWithPath("name").description("The identifying name of the layer used by GeoServer"),
			fieldWithPath("serviceUrl").description("The URL used for referencing this layer in GeoServer"),
			fieldWithPath("wmsVersion").description("A listing of layers that are referenced by this folder or group"),
			fieldWithPath("metadataUrl").description("The URL used for referencing this layer in the MPCM Layer Catalog"),
			fieldWithPath("styles").description("The URL used for referencing this layer in the MPCM Layer Catalog")
		};

    	// a WMS fetch to DataBC's default GeoServer
    	this.mockMvc.perform(get("/LayerLibrary/wms/{id}/", "WHSE_WATER_MANAGEMENT.WLS_PWD_APPLICATIONS_SVW")
    				.accept(MediaType.APPLICATION_JSON))
				 	.andExpect(status().isOk())
				 	.andDo(document("layercatalog-wms-get", pathParameters(parameterWithName("id").description("The GeoServer WMS id of a Layer in the DataBC WMS Layer Catalog"))));
    }
}
