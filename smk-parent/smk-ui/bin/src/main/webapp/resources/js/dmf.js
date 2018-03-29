function openMap(type)
{

	window.location.href = "./view.xhtml?id=" + getQueryString('id') + "&view=" + type;
}

var getQueryString = function ( field, url ) 
{
    var href = url ? url : window.location.href;
    var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
    var string = reg.exec(href);

    return string ? string[1] : null;
};

var serviceUrl = "../smks/";
var wmsUrl = "https://openmaps.gov.bc.ca/geo/pub/ows";
var wmsPostfix = "?service=WMS&request=GetCapabilities";
var wmsVersion = "1.3.0";
var mapConfigs = [];
var publishedMapConfigs = [];
var selectedMapConfig;
var basemapViewerMap;
var layerPreviewViewer;
var aboutEditor;
var editMode = false;

var data = {
	    lmfId: "",
	    lmfRevision: 1,
	    name: "",
	    createdBy: "",
	    published: false,
	    surround: {
	        type: "default",
	        title: ""
	    },
	    viewer: {
	        type: "leaflet",
	        initialExtent: [],
	        baseMap: "Imagery"
	    },
	    tools: [],
	    layers: [],
	    _id: null,
	    _rev: null
	};

function setToolActivation(toolType)
{
	data.tools.forEach(function(tool) 
   	{
		if(tool.type == toolType)
		{
			tool.enabled = !tool.enabled;
			 
			if(tool.type == "zoom" && tool.enabled == true)
			{
				$("#zoomOptions").show();
				$("#zoomControl").prop('checked', tool.control);
				$("#zoomBox").prop('checked', tool.box);
				$("#zoomDoubleClick").prop('checked', tool.doubleClick);
				$("#zoomMouseWheel").prop('checked', tool.mouseWheel);
			}
			else if(tool.type == "zoom" && tool.enabled == false) $("#zoomOptions").hide();
	    	else if(tool.type == "scale" && tool.enabled == true)
    		{
	    		$("#scaleOptions").show();
	    		$("#scaleFactor").prop('checked', tool.showFactor);
				$("#scaleBar").prop('checked', tool.showBar);
    		}
	    	else if(tool.type == "scale" && tool.enabled == false) $("#scaleOptions").hide();
	    	else if(tool.type == "minimap" && tool.enabled == true)
    		{
	    		$("#minimapOptions").show();
	    		$("#StreetsMini").prop('checked', tool.baseMap == "Streets");
	    		$("#TopographicMini").prop('checked', tool.baseMap == "Topographic");
	    		$("#NationalGeographicMini").prop('checked', tool.baseMap == "NationalGeographic");
	    		$("#OceansMini").prop('checked', tool.baseMap == "Oceans");
	    		$("#GrayMini").prop('checked', tool.baseMap == "Gray");
	    		$("#DarkGrayMini").prop('checked', tool.baseMap == "DarkGray");
	    		$("#ImageryMini").prop('checked', tool.baseMap == "Imagery");
	    		$("#ImageryClarityMini").prop('checked', tool.baseMap == "ImageryClarity");
	    		$("#ShadedReliefMini").prop('checked', tool.baseMap == "ShadedRelief");
	    		$("#TerrainMini").prop('checked', tool.baseMap == "Terrain");
    		}
	    	else if(tool.type == "minimap" && tool.enabled == false) $("#minimapOptions").hide();
	    	else if(tool.type == "about" && tool.enabled == true) 
    		{
	    		$("#aboutPanelOptions").show();
	    		setupQuillEditor(tool);
    		}
	    	else if(tool.type == "about" && tool.enabled == false) $("#aboutPanelOptions").hide();
	    	else if(tool.type == "baseMaps" && tool.enabled == true)
    		{
	    		$("#basemapPanelOptions").show();
	    		if(tool.choices == null) tool.choices = [];
	    		tool.choices.forEach(function(choice) 
	           	{
		    		$("#StreetsBml").prop('checked', tool.choices.indexOf("Streets") > -1);
		    		$("#TopographicBml").prop('checked', tool.choices.indexOf("Topographic") > -1);
		    		$("#NationalGeographicBml").prop('checked', tool.choices.indexOf("NationalGeographic") > -1);
		    		$("#OceansBml").prop('checked', tool.choices.indexOf("Oceans") > -1);
		    		$("#GrayBml").prop('checked', tool.choices.indexOf("Gray") > -1);
		    		$("#DarkGrayBml").prop('checked', tool.choices.indexOf("DarkGray") > -1);
		    		$("#ImageryBml").prop('checked', tool.choices.indexOf("Imagery") > -1);
		    		$("#ImageryClarityBml").prop('checked', tool.choices.indexOf("ImageryClarity") > -1);
		    		$("#ShadedReliefBml").prop('checked', tool.choices.indexOf("ShadedRelief") > -1);
		    		$("#TerrainBml").prop('checked', tool.choices.indexOf("Terrain") > -1);
	           	});
    		}
	    	else if(tool.type == "baseMaps" && tool.enabled == false) $("#basemapPanelOptions").hide();
			
			if(tool.enabled == true) Materialize.toast('Activated ' + tool.type + " tool!", 4000);
			else Materialize.toast('Deactivated ' + tool.type + " tool!", 4000);
		}
   	});
}

function setupQuillEditor(tool)
{
	$("#about-toolbar").empty();
	$("#about-content").empty();
	$(".ql-toolbar").remove();
	
	var toolbarOptions = [
	                      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
	                      ['blockquote', 'code-block'],
	                      [{ 'header': 1 }, { 'header': 2 }],               // custom button values
	                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
	                      [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
	                      [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
	                      [{ 'direction': 'rtl' }],                         // text direction
	                      [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
	                      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
	                      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
	                      [{ 'font': [] }],
	                      [{ 'align': [] }],
	                      ['clean'],                                        // remove formatting button
	                      ['image', 'video']								// embedd options
	                    ];
	
	aboutEditor = new Quill('#about-content', 
	{
		modules: 
		{
	    	toolbar: toolbarOptions
	  	},
	  	theme: 'snow'
	});
	aboutEditor.on('text-change', function(delta, oldDelta, source) 
	{
		tool.content = document.querySelector(".ql-editor").innerHTML;
	});
	
	document.querySelector(".ql-editor").innerHTML = tool.content;
}

function setBasemapSelector(basemap)
{
	data.tools.forEach(function(tool) 
   	{
		if(tool.type == "baseMaps")
		{
			if(tool.choices == null) tool.choices = [];
			var contains = (tool.choices.indexOf(basemap) > -1);
			if(contains)
			{
				var index = tool.choices.indexOf(basemap);
				if (index !== -1) tool.choices.splice(index, 1);
			}
			else tool.choices.push(basemap);
		}
   	});
}

function toggleScaleOption(scaleOption)
{
	data.tools.forEach(function(tool) 
   	{
		if(tool.type == "scale")
		{
			if(zoomOption == "factor") tool.showFactor = !tool.showFactor;
			else if(zoomOption == "bar") tool.showBar = !tool.showBar;
		}
   	});
}

function toggleZoomOption(zoomOption)
{
	data.tools.forEach(function(tool) 
   	{
		if(tool.type == "zoom")
		{
			if(zoomOption == "control") tool.control = !tool.control;
			else if(zoomOption == "box") tool.box = !tool.box;
			else if(zoomOption == "doubleClick") tool.doubleClick = !tool.doubleClick;
			else if(zoomOption == "mouseWheel") tool.mouseWheel = !tool.mouseWheel;
		}
   	});
}

function setMinimapBasemap(id)
{
	data.tools.forEach(function(tool) 
   	{
		if(tool.type == "minimap")
		{
			tool.baseMap = id;
		}
   	});
}

function closeEditPanel()
{
	$("#editor-content").hide("fast");
	$("#menu-content").show("fast");
	$("#loadingBar").show();
	$("#appsTablePanel").hide();
	
	loadConfigs();
}

function editMapConfig(mapConfigId)
{
	mapConfigs.forEach(function(mapConfig)
	{
		if(mapConfig.lmfId == mapConfigId)
		{
			selectedMapConfig = mapConfig;
			
			data.lmfId = mapConfig.lmfId;
			data.name = mapConfig.name;
			data.lmfRevision = mapConfig.lmfRevision;
			data.createdBy = mapConfig.createdBy;
			data.published = mapConfig.published;
			data.surround = mapConfig.surround;
		    data.viewer = mapConfig.viewer;
		    data.tools = mapConfig.tools;
		    data.layers = mapConfig.layers;
		    data._id = mapConfig._id;
		    data._rev = mapConfig._rev;
		    
		    setupMapConfigToolsUI();
		    
			$("#menu-content").hide("fast");
        	$("#editor-content").show("fast");
        	
        	// reset the layer tree
        	var layerSource = [];
        	if(data.layers == null) data.layers = [];
        	data.layers.forEach(function(lyr) 
        	{
        		var lyrNode = {
								title: lyr.title, 
								folder: false, 
								expanded: false, 
								data: lyr, 
								children: []
							};
        		layerSource.push(lyrNode);
        		
        		var tree = $('#layer-tree').fancytree('getTree');
        		tree.reload(layerSource);
        	});
        	
        	basemapViewerMap.invalidateSize();	
        	layerPreviewViewer.invalidateSize();
        	
        	unsavedAttachments = [];
        	fileContents = null;
        	
        	$(document).ready(function() 
        	{
        	    Materialize.updateTextFields();
        	    
        	 // init basemap viewer			    			
        	    setBasemap(data.viewer.baseMap);
        	    layerPreviewViewer.setView(new L.latLng(rndLat, rndLon), rndZoom, { animate: true, duration: 60 } );
        	    layerPreviewViewer.fitBounds(basemapViewerMap.getBounds());
        	});
		}
	});
}

function setupMapConfigToolsUI()
{
	//set tool activations
    data.tools.forEach(function(tool) 
	{
    	if(tool.type == "coordinate") $("#coordinates").prop('checked', tool.enabled);
    	else if(tool.type == "attribution") $("#attribution").prop('checked', tool.enabled);
    	else if(tool.type == "sidebar") $("#sidebar").prop('checked', tool.enabled);
    	else if(tool.type == "layers") $("#layerPanel").prop('checked', tool.enabled);
    	else if(tool.type == "identify") $("#identifyPanel").prop('checked', tool.enabled);
    	else if(tool.type == "pan") $("#panning").prop('checked', tool.enabled);
    	else if(tool.type == "zoom")
		{
    		$("#zooming").prop('checked', tool.enabled);
    		if(tool.enabled) 
			{
    			$("#zoomOptions").show();
    			$("#zoomControl").prop('checked', tool.control);
				$("#zoomBox").prop('checked', tool.box);
				$("#zoomDoubleClick").prop('checked', tool.doubleClick);
				$("#zoomMouseWheel").prop('checked', tool.mouseWheel);
			}
		}
    	else if(tool.type == "measure") $("#measurement").prop('checked', tool.enabled);
    	else if(tool.type == "markup") $("#markup").prop('checked', tool.enabled);
    	else if(tool.type == "scale")
		{
    		$("#scale").prop('checked', tool.enabled);
    		if(tool.enabled) 
			{
    			$("#scaleOptions").show();
    			$("#scaleFactor").prop('checked', tool.showFactor);
				$("#scaleBar").prop('checked', tool.showBar);
			}
    	}
    	else if(tool.type == "minimap")
		{
    		$("#minimap").prop('checked', tool.enabled);
    		if(tool.enabled) 
			{
    			$("#minimapOptions").show();
    			$("#StreetsMini").prop('checked', tool.baseMap == "Streets");
	    		$("#TopographicMini").prop('checked', tool.baseMap == "Topographic");
	    		$("#NationalGeographicMini").prop('checked', tool.baseMap == "NationalGeographic");
	    		$("#OceansMini").prop('checked', tool.baseMap == "Oceans");
	    		$("#GrayMini").prop('checked', tool.baseMap == "Gray");
	    		$("#DarkGrayMini").prop('checked', tool.baseMap == "DarkGray");
	    		$("#ImageryMini").prop('checked', tool.baseMap == "Imagery");
	    		$("#ImageryClarityMini").prop('checked', tool.baseMap == "ImageryClarity");
	    		$("#ShadedReliefMini").prop('checked', tool.baseMap == "ShadedRelief");
	    		$("#TerrainMini").prop('checked', tool.baseMap == "Terrain")
			}
		}
    	else if(tool.type == "about")
		{
    		$("#aboutPanel").prop('checked', tool.enabled);
    		if(tool.enabled) 
			{
    			$("#aboutPanelOptions").show();
    			setupQuillEditor(tool);
			}
		}
    	else if(tool.type == "baseMaps")
		{
    		$("#basemapPanel").prop('checked', tool.enabled);
    		if(tool.enabled) 
			{
    			$("#basemapPanelOptions").show();
    			if(tool.choices == null) tool.choices = [];
    			tool.choices.forEach(function(choice) 
	           	{
		    		$("#StreetsBml").prop('checked', tool.choices.indexOf("Streets") > -1);
		    		$("#TopographicBml").prop('checked', tool.choices.indexOf("Topographic") > -1);
		    		$("#NationalGeographicBml").prop('checked', tool.choices.indexOf("NationalGeographic") > -1);
		    		$("#OceansBml").prop('checked', tool.choices.indexOf("Oceans") > -1);
		    		$("#GrayBml").prop('checked', tool.choices.indexOf("Gray") > -1);
		    		$("#DarkGrayBml").prop('checked', tool.choices.indexOf("DarkGray") > -1);
		    		$("#ImageryBml").prop('checked', tool.choices.indexOf("Imagery") > -1);
		    		$("#ImageryClarityBml").prop('checked', tool.choices.indexOf("ImageryClarity") > -1);
		    		$("#ShadedReliefBml").prop('checked', tool.choices.indexOf("ShadedRelief") > -1);
		    		$("#TerrainBml").prop('checked', tool.choices.indexOf("Terrain") > -1);
	           	});
			}
		}
    	else if(tool.type == "select") $("#selectionPanel").prop('checked', tool.enabled);
    	else if(tool.type == "search") $("#searchPanel").prop('checked', tool.enabled);
    	else if(tool.type == "directions") $("#directions").prop('checked', tool.enabled);
	});
    
    // clear out any layers
    var layerSource = [];
    var tree = $('#layer-tree').fancytree('getTree');
	tree.reload(layerSource);
    
    $('ul.tabs').tabs();
	$('ul.tabs').tabs('select_tab', 'identity');
	$('#layerTypeTabs').tabs('select_tab', 'dbcCatalog');
	$('.collapsible').collapsible();
	$('#vectorType').material_select();
}

function addNewMapConfig()
{
	data.lmfId = "";
	data.name = "";
	data.lmfRevision = 1;
	data.createdBy = "";
	data.published = false;
	data.surround = { type: "default", title: "" };
    data.viewer = {
			        type: "leaflet",
			        initialExtent: [
			            -139.1782,
			            47.6039,
			            -110.3533,
			            60.5939
			        ],
			        baseMap: "Imagery"
				};
    data.layers = [];
    data._id = null;
    data._rev = null;
    data.tools = [
		        {
			      "type": "coordinate",
			      "enabled": true
			    },
			    {
			      "type": "attribution",
			      "enabled": true
			    },
			    {
			      "type": "sidebar",
			      "enabled": true
			    },
			    {
			      "type": "layers",
			      "enabled": true
			    },
			    {
			      "type": "identify",
			      "enabled": true
			    },
			    {
			      "type": "pan",
			      "enabled": true
			    },
			    {
			      "type": "zoom",
			      "enabled": true,
			      "mouseWheel": true,
			      "doubleClick": true,
			      "box": true,
			      "control": true
			    },
			    {
			      "type": "measure",
			      "enabled": true
			    },
			    {
			      "type": "markup",
			      "enabled": true
			    },
			    {
			      "type": "scale",
			      "enabled": true,
			      "showFactor": true,
			      "showBar": true
			    },
			    {
			      "type": "minimap",
			      "enabled": true,
			      "baseMap": "Topographic"
			    },
			    {
			      "type": "directions",
			      "enabled": true
			    },
			    {
			      "type": "about",
			      "enabled": true,
			      "content": ""
			    },
			    {
			      "type": "baseMaps",
			      "enabled": true,
			      "choices": [
			        "Topographic",
			        "Streets",
			        "Imagery",
			        "Oceans",
			        "NationalGeographic",
			        "DarkGray",
			        "Gray"
			      ]
			    },
			    {
			      "type": "select",
			      "enabled": true
			    },
			    {
			      "type": "search",
			      "enabled": true
			    }
		    ];
	
    setupMapConfigToolsUI();
    
	$("#menu-content").hide("fast");
	$("#editor-content").show("fast");
	
	$('ul.tabs').tabs();
	$('ul.tabs').tabs('select_tab', 'identity');
	
	unsavedAttachments = [];
	fileContents = null;
	
	$(document).ready(function() 
	{
	    Materialize.updateTextFields();
	    
	 // init basemap viewer		
	 	var ne = L.latLng(data.viewer.initialExtent[3], data.viewer.initialExtent[2]);
		var sw = L.latLng(data.viewer.initialExtent[1], data.viewer.initialExtent[0]);
		var bounds = L.latLngBounds(ne, sw);   
		var centroid = bounds.getCenter();
		var zoom = basemapViewerMap.getBoundsZoom(bounds, true);
		
		//basemapViewerMap.setView(bounds.getCenter(), zoom);
		basemapViewerMap.fitBounds(bounds);
		
		basemapViewerMap.invalidateSize();		    			
	    setBasemap(data.viewer.baseMap);
	    
	    layerPreviewViewer.fitBounds(bounds);
	    
	    // reset the layer tree
		var tree = $('#layer-tree').fancytree('getTree');
		tree.reload([]);
	});
}

function saveMapConfig()
{
	finishLayerEdits(selectedLayerNode != null);
	
	var requestType = "put";
	var requestUrl = "MapConfigurations/" + data.lmfId;
	
	if(data._id == null)
	{
		requestType = "post";
		requestUrl = "MapConfigurations/";
		data._id = uuid();
	}
	
	console.log("Saving JSON: " + JSON.stringify(data));
	
	$.ajax
	({
		url: serviceUrl + requestUrl,
        type: requestType,
        dataType: 'json',
        data: JSON.stringify(data),
        contentType:'application/json',
        crossDomain: true,
        withCredentials: true,
        success: function (result) 
        {
        	Materialize.toast('Successfully saved application ' + data.lmfId, 4000);
        	
        	// now we need to complete any attachments before moving on.
        	
        	unsavedAttachments.forEach(function (attachment)
        	{
        		
        		var documentData = new FormData();
        		documentData.append('file', attachment.contents);
        		
        		var attchId;
        		if(attachment.type == "header_upload") attchId = "surroundImage";
        		else attchId = attachment.layer.id;
        		
        		$.ajax
        		({
        			url: serviceUrl + "MapConfigurations/" + data.lmfId + "/Attachments/?id=" + attchId,
        	        type: "post",
        	        data: documentData,
        	        crossDomain: true,
        	        withCredentials: true,
        	        cache: false,
        	        contentType: false,
        	        processData: false,
        	        success: function (result) 
        	        {
        	        	console.log("attachment " + attachment.layer.id + " uploaded!");
        	        	loadConfigs();
        	        },
        	        error: function (status) 
        	        {
        	            Materialize.toast('Error uploading attachment ' + attachment.layer.title, 4000);
        	        }
        		});
    		});

        	closeEditPanel();
        },
        error: function (status) 
        {
            Materialize.toast('Error saving application ' + data.lmfId, 4000);
            if(data._rev == null) data._id = null;
        }
	});
}

function unPublishMapConfig(mapConfigId)
{
	publishedMapConfigs.forEach(function(mapConfig)
	{
		if(mapConfig.lmfId == mapConfigId)
		{
			$.ajax
			({
				url: serviceUrl + 'MapConfigurations/Published/' + mapConfigId,
                type: 'delete',
                crossDomain: true,
                withCredentials: true,
                success: function (data) 
                {
                	Materialize.toast('Successfully un-published ' + mapConfigId, 4000);
                	$("#" + mapConfigId + "-pub").remove();
                	loadConfigs();
                },
                error: function (status) 
                {
                	Materialize.toast('Error un-publishing ' + mapConfigId, 4000);
                }
			});
		}
	});
}

function publishMapConfig(mapConfigId)
{
	mapConfigs.forEach(function(mapConfig)
	{
		if(mapConfig.lmfId == mapConfigId)
		{
			$("#loadingBar").show();
        	$("#appsTablePanel").hide();
        	
			$.ajax
			({
				url: serviceUrl + 'MapConfigurations/Published/' + mapConfigId,
                type: 'post',
                crossDomain: true,
                withCredentials: true,
                success: function (data) 
                {
                	Materialize.toast('Successfully published ' + mapConfigId, 4000);
                	loadConfigs();
                	$("#loadingBar").hide();
                	$("#appsTablePanel").show();
                },
                error: function (status) 
                {
                	Materialize.toast('Error publishing ' + mapConfigId, 4000);
                	$("#loadingBar").hide();
                	$("#appsTablePanel").show();
                }
			});
		}
	});
}

function exportMapConfig(mapConfigId)
{
	publishedMapConfigs.forEach(function(mapConfig)
	{
		if(mapConfig.lmfId == mapConfigId)
		{
			$("#loadingBar").show();
        	$("#appsTablePanel").hide();
			window.location = serviceUrl + "MapConfigurations/Published/" + mapConfigId + "/Export/"
			$("#loadingBar").hide();
        	$("#appsTablePanel").show();
		}
	});
}

function deleteMapConfig(mapConfigId)
{
	if (confirm('Are you sure you want to delete the application? This cannot be undone...')) 
	{
		$("#appsTablePanel").hide();
		$("#loadingBar").show();
		
		mapConfigs.forEach(function(mapConfig)
		{
			if(mapConfig.lmfId == mapConfigId)
			{
				$.ajax
    			({
    				url: serviceUrl + 'MapConfigurations/' + mapConfigId,
                    type: 'delete',
                    dataType: 'json',
                    contentType:'application/json',
                    crossDomain: true,
                    withCredentials: true,
                    success: function (data) 
                    {
                    	Materialize.toast(mapConfigId + ' has been successfully deleted.', 4000);
                    	$("#" + mapConfigId).remove();
                    	
                    	$("#loadingBar").hide();
                    	$("#appsTablePanel").show();
                    },
                    error: function (status) 
                    {
                    	Materialize.toast('Could not delete ' + mapConfigId + '. Ensure this map is not published before deleting', 4000);
                    }
    			});
			}
		});
	}
}

function previewEdits()
{
	var html = '<html><head><title>' + data.name + '</title><head><body><div id="smk-map-frame"></div><script src="../smk-client/smk-bootstrap.js" smk-standalone="true">return ' + JSON.stringify(data) + '</script></body></html>';

	var newWindow2 = window.open();
	newWindow2.document.write(html);
}


function previewMapConfig(mapConfigId)
{
	mapConfigs.forEach(function(mapConfig)
	{
		if(mapConfig.lmfId == mapConfigId)
		{
			var html = '<html><head><title>' + mapConfig.name + '</title><head><body><div id="smk-map-frame"></div><script src="../smk-client/smk-bootstrap.js" smk-standalone="true">return ' + JSON.stringify(mapConfig) + '</script></body></html>';
			
			//var newWindow = window.open();
			//newWindow.document.body.innerHTML = html;
			
			var newWindow2 = window.open();
			newWindow2.document.write(html);
		}
	});
}

function previewPublishedMapConfig(mapConfigId)
{
	publishedMapConfigs.forEach(function(mapConfig)
	{
		if(mapConfig.lmfId == mapConfigId)
		{
			var html = '<html><head><title>' + mapConfig.name + '</title><head><body><div id="smk-map-frame"></div><script src="../smk-client/smk-bootstrap.js" smk-standalone="true">return ' + JSON.stringify(mapConfig) + '</script></body></html>';
			
			//var newWindow = window.open();
			//newWindow.document.body.innerHTML = html;
			
			var newWindow2 = window.open();
			newWindow2.document.write(html);
		}
	});
}

function setBasemap(id)
{
	basemapViewerMap.eachLayer(function (layer) 
	{
		basemapViewerMap.removeLayer(layer);
		layerPreviewViewer.removeLayer(layer);
	});
	
	basemapViewerMap.addLayer(L.esri.basemapLayer(id));
	layerPreviewViewer.addLayer(L.esri.basemapLayer(id));
	//resetBasemapView();
}

function resetBasemapView()
{
	$(document).ready(function()
	{
		basemapViewerMap.invalidateSize();
		
		var sw = L.latLng(data.viewer.initialExtent[1], data.viewer.initialExtent[2]);
		var ne = L.latLng(data.viewer.initialExtent[3], data.viewer.initialExtent[0]);
		var bounds = L.latLngBounds(sw, ne);   
	
		basemapViewerMap.fitBounds(bounds);
		
		editMode = true;
	});
}

var selectedLayerNode;
var selectedLayerPreviewObject;

function finishLayerEdits(save)
{
	if(save)
	{
		if(selectedLayerNode.data.type == "wms") 
		{
			//set fields
			selectedLayerNode.data.isVisible = $("#wmsVisible").is(":checked");
			selectedLayerNode.data.title = $("#wmsName").val();
			selectedLayerNode.data.attribution = $("#wmsAttribution").val();
			selectedLayerNode.data.opacity = $("#wmsOpacity").val();
			selectedLayerNode.title = $("#wmsName").val();
			
			if(selectedLayerNode.data.attributes == null) selectedLayerNode.data.attributes = [];
			selectedLayerNode.data.attributes.forEach(function (attribute) 
			{
				attribute.visible = $("#" + attribute.id + "_visible").is(":checked");
				attribute.title = $("#" + attribute.id + "_label").val();
			});
		}
		else if(selectedLayerNode.data.type == "esri-dynamic") 
		{
			//set fields
			selectedLayerNode.data.isVisible = $("#dbcVisible").is(":checked");
			selectedLayerNode.data.title = $("#dbcName").val();
			selectedLayerNode.data.attribution = $("#dbcAttribution").val();
			selectedLayerNode.data.opacity = $("#dbcOpacity").val();
			selectedLayerNode.title = $("#dbcName").val();
			
			selectedLayerNode.data.attributes.forEach(function (attribute) 
			{
				attribute.visible = $("#" + attribute.id + "_visible").is(":checked");
				attribute.title = $("#" + attribute.id + "_label").val();
			});
		}
		else // kml, geojson 
		{
			selectedLayerNode.data.isVisible = $("#vectorVisible").is(":checked");
			selectedLayerNode.data.title = $("#vectorName").val();
			selectedLayerNode.data.opacity = $("#vectorOpacity").val();
			selectedLayerNode.data.useClustering = $("#vectorClustering").is(":checked");
			selectedLayerNode.data.useHeatmapping = $("#vectorHeatmapping").is(":checked");
			selectedLayerNode.data.style.strokeWidth = $("#vectorStrokeWidth").val();
			selectedLayerNode.data.style.stylestrokeStyle = $("#vectorStrokeStyle").val();
			selectedLayerNode.data.style.strokeColor = $("#vectorStrokeColor").val();
			selectedLayerNode.data.style.strokeOpacity = $("#vectorStrokeOpacity").val();
			selectedLayerNode.data.style.fillColor = $("#vectorFillColor").val();
			selectedLayerNode.data.style.fillOpacity = $("#vectorFillOpacity").val();
			
			// add the attachment data to the cache for upload after save
			if(fileContents != null)
			{
				unsavedAttachments.push(
				{
					type: "vector_upload",
					layer: selectedLayerNode.data,
					contents: fileContents
				});
			}
			
			document.getElementById("layersForm").reset();
		}
		
		var root = $("#layer-tree").fancytree('getTree').getRootNode().children;
		var tree = $("#layer-tree").fancytree('getTree');
		tree.reload(root);
		
		//replace layer in source data
		data.layers.forEach(function (lyr) 
		{
			if(lyr.id == selectedLayerNode.data.id)
			{
				var index = data.layers.indexOf(lyr);
				if (index !== -1)
				{
					var layerData = selectedLayerNode.data;
					
					if(layerData.hasOwnProperty("li")) delete layerData["li"];
					if(layerData.hasOwnProperty("parent")) delete layerData["parent"];
					if(layerData.hasOwnProperty("span")) delete layerData["span"];
					if(layerData.hasOwnProperty("tree")) delete layerData["tree"];
					if(layerData.hasOwnProperty("ul")) delete layerData["ul"];
					
					data.layers.splice(index, 1);
					data.layers.push(layerData);
				}
			}
      	});
	}
	
	$("#dbcAttributes").empty();
	$("#wmsAttributes").empty();
	$("#editLayerPanel").hide();
	$("#layerEditDataBCPanel").hide();
	$("#layerEditWMSPanel").hide();
	$("#layerEditVectorPanel").hide();
	$("#layerAddPanel").show();
	
	document.getElementById("layersForm").reset();
	
	selectedLayerNode = null;
	fileContents = null;
}

function editSelectedLayer()
{
	var nodes = $("#layer-tree").fancytree('getTree').getSelectedNodes();
	$("#dbcAttributes").empty();
	$("#wmsAttributes").empty();
	
	nodes.forEach(function(node) 
   	{
		// display edit panel with node object
		$("#editLayerPanel").show();
		$("#layerAddPanel").hide();
		
		layerPreviewViewer.invalidateSize();

		selectedLayerNode = node;
		// setup the preview map
		if(selectedLayerPreviewObject != null) layerPreviewViewer.removeLayer(selectedLayerPreviewObject);
		
		if(node.data.type == "wms") 
		{
			$("#layerEditWMSPanel").show();
			
			var layer = L.tileLayer.wms(node.data.serviceUrl, 
		    {
		        layers: [node.data.layerName],
		        styles: [node.data.styleName],
		        version: node.data.version,
		        format: 'image/png',
		        transparent: true,
		        attribution: node.data.attribution
		    });
		    
		    layer.setOpacity(node.data.opacity);
		    
		    selectedLayerPreviewObject = layer;
		    layerPreviewViewer.addLayer(layer);
		    
		    //set fields
			$("#wmsVisible").prop('checked', node.data.isVisible);
			$("#wmsName").val(node.data.title);
			$("#wmsAttribution").val(node.data.attribution);
			$("#wmsOpacity").val(node.data.opacity);
			
			if(node.data.attributes == null) node.data.attributes = [];
			node.data.attributes.forEach(function (attribute) 
			{
				$("#wmsAttributes").append('<div class="row"><div class="col s4"><p><input type="checkbox" id="' + attribute.id + '_visible" /><label class="black-text" for="' + attribute.id + '_visible">Visible</label></p></div><div class="col s8 input-field"><input id="' + attribute.id + '_label" type="text"><label for="' + attribute.id + '_label">Label</label></div></div>');
				$("#" + attribute.id + "_visible").prop('checked', attribute.visible);
				$("#" + attribute.id + "_label").val(attribute.title);
			});
		}
		else if(node.data.type == "esri-dynamic") 
		{			
			$("#layerEditDataBCPanel").show();
			
			var layer = L.esri.dynamicMapLayer(
		    {
		        url: node.data.serviceUrl,
		        opacity: node.data.opacity,
		        layers: [node.data.mpcmId],
		        dynamicLayers: [JSON.parse(node.data.dynamicLayers[0])],
		        useCors: false
		    });
			
			selectedLayerPreviewObject = layer;
			layerPreviewViewer.addLayer(layer);
			
			//set fields
			$("#dbcVisible").prop('checked', node.data.isVisible);
			$("#dbcName").val(node.data.title);
			$("#dbcAttribution").val(node.data.attribution);
			$("#dbcOpacity").val(node.data.opacity);
			
			if(node.data.attributes == null) node.data.attributes = [];
			node.data.attributes.forEach(function (attribute) 
			{
				$("#dbcAttributes").append('<div class="row"><div class="col s4"><p><input type="checkbox" id="' + attribute.id + '_visible" /><label class="black-text" for="' + attribute.id + '_visible">Visible</label></p></div><div class="col s8 input-field"><input id="' + attribute.id + '_label" type="text"><label for="' + attribute.id + '_label">Label</label></div></div>');
				$("#" + attribute.id + "_visible").prop('checked', attribute.visible);
				$("#" + attribute.id + "_label").val(attribute.title);
			});
		}
		else 
		{
			$("#layerEditVectorPanel").show(); //kml, geojson
			
			$("#vectorVisible").prop('checked', node.data.isVisible);
			$("#vectorName").val(node.data.title);
			$("#vectorOpacity").val(node.data.opacity);
			$("#vectorClustering").prop('checked', node.data.useClustering);
			$("#vectorHeatmapping").prop('checked', node.data.useHeatmapping);
			$("#vectorStrokeWidth").val(node.data.style.strokeWidth);
			$("#vectorStrokeStyle").val(node.data.stylestrokeStyle);
		    $("#vectorStrokeColor").val(node.data.style.strokeColor);
		    $("#vectorStrokeOpacity").val(node.data.style.strokeOpacity);
		    $("#vectorFillColor").val(node.data.style.fillColor);
		    $("#vectorFillOpacity").val(node.data.style.fillOpacity);
		    
		    if(node.data.attributes == null) node.data.attributes = [];
			node.data.attributes.forEach(function (attribute) 
			{
				$("#vectorAttributes").append('<div class="row"><div class="col s4"><p><input type="checkbox" id="' + attribute.id + '_visible" /><label class="black-text" for="' + attribute.id + '_visible">Visible</label></p></div><div class="col s8 input-field"><input id="' + attribute.id + '_label" type="text"><label for="' + attribute.id + '_label">Label</label></div></div>');
				$("#" + attribute.id + "_visible").prop('checked', attribute.visible);
				$("#" + attribute.id + "_label").val(attribute.title);
			});
		}
		
		Materialize.updateTextFields();
   	});
}

function removeSelectedLayer()
{
	var nodes = $("#layer-tree").fancytree('getTree').getSelectedNodes();
	
	nodes.forEach(function(node) 
   	{
		var tree = $('#layer-tree').fancytree('getTree');
    	var layerSource = tree.getRootNode().children;
    	
    	var containsNode = (layerSource.indexOf(node) > -1);
		if(containsNode)
		{
			var nodeIndex = layerSource.indexOf(node);
			if (nodeIndex !== -1) layerSource.splice(nodeIndex, 1);
		}
    	
		tree.reload(layerSource);
		
		data.layers.forEach(function(lyr) 
          	{
			if(lyr.id == node.data.id)
			{
				var contains = (data.layers.indexOf(lyr) > -1);
				if(contains)
				{
					var index = data.layers.indexOf(lyr);
					if (index !== -1) data.layers.splice(index, 1);
				}
			}
          	});
   	});
}

function uploadVectorLayer()
{
	// create kml doc
	var layer = 
	{
		type: $("#vectorType").val(),
		id: $("#kmlName").val().replace(/\s+/g, '-').toLowerCase(),
	    title: $("#kmlName").val(),
	    isVisible: $("#kmlIsVisible").is(":checked"),
	    opacity: $("#kmlOpacity").val(),
	    attributes: [],
		useClustering: $("#kmlClustering").is(":checked"),
		useHeatmapping: $("#kmlHeatmapping").is(":checked"),
		style: 
		{
			strokeWidth: $("#kmlStrokeWidth").val(),
			strokeStyle: $("#kmlStrokeStyle").val(),
		    strokeColor: $("#kmlStrokeColor").val(),
		    strokeOpacity: $("#kmlStrokeOpacity").val(),
		    fillColor: $("#kmlFillColor").val(),
		    fillOpacity: $("#kmlFillOpacity").val()
		}
	};
	
	// add to data
	data.layers.push(layer);
	
	// add to layer tree
	var lyrNode = 
	{
		title: layer.title, 
		folder: false, 
		expanded: false, 
		data: layer, 
		children: []
	};
	
	var tree = $('#layer-tree').fancytree('getTree');
	var layerSource = tree.getRootNode().children;
	layerSource.push(lyrNode);
	tree.reload(layerSource);
	
	// add the attachment data to the cache for upload after save
	unsavedAttachments.push(
	{
		type: "vector_upload",
		layer: layer,
		contents: fileContents
	});
	
	document.getElementById("layersForm").reset();
}

function addSelectedWmsLayer()
{
	var nodes = $("#wms-catalog-tree").fancytree('getTree').getSelectedNodes();
	
	nodes.forEach(function(node) 
   	{
		node.setSelected(false);
		
		if(node.folder == false)
		{	
			var wmsData = null;
			var wmsStyleData = null;
			
			if(node.data.wms != null)
			{
				wmsData = node.data.wms;
				wmsStyleData = node.data.style;
			}
			else wmsData = node.data;
			
			var wmsItem = {
					type: "wms",
					version: wmsVersion,
					serviceUrl: wmsUrl,
					layerName: wmsData.name,
					styleName: wmsStyleData != null ? wmsStyleData.name : null,
					id: wmsStyleData != null ? wmsData.name + "-" + wmsStyleData.name : wmsData.name,
					title: wmsStyleData != null ? wmsData.title + " " + wmsStyleData.title : wmsData.title,
					isVisible: true,
					attribution: "",
					metadataUrl: "",
					opacity: 0.65,
					attributes: []
				  };
			
			data.layers.push(wmsItem);
			
			var lyrNode = {
					title: wmsItem.title, 
					folder: false, 
					expanded: false, 
					data: wmsItem, 
					children: []
				};
			
			var tree = $('#layer-tree').fancytree('getTree');
			var layerSource = tree.getRootNode().children;
			layerSource.push(lyrNode);
			tree.reload(layerSource);
		}
   	});
}

function uploadSurroundHeader()
{
	unsavedAttachments.push(
	{
		type: "header_upload",
		contents: fileContents
	});
	
	document.getElementById("themesForm").reset();
}

function addSelectedDataBCLayer()
{
	var nodes = $("#catalog-tree").fancytree('getTree').getSelectedNodes();
	
	nodes.forEach(function(node) 
   	{
		loadSelectedDataBCCatalogLayers(node);
		node.setSelected(false);
   	});
}

function loadSelectedDataBCCatalogLayers(node)
{
	if(node.folder == false)
	{
		getCompleteCatalogItem(node.data.mpcmId);
	}
}

function getCompleteCatalogItem(mpcmId)
{
	if(mpcmId != 0)
	{
		$.ajax
		({
			url: serviceUrl + 'LayerLibrary/' + mpcmId,
            type: 'get',
            dataType: 'json',
            contentType:'application/json',
            crossDomain: true,
            withCredentials: true,
            success: function (catalogCompleteItem) 
            {
            	if(data.layers == null) data.layers = [];
            	data.layers.push(catalogCompleteItem);
            	
            	var lyrNode = {
						title: catalogCompleteItem.title, 
						folder: false, 
						expanded: false, 
						data: catalogCompleteItem, 
						children: []
					};
            	
            	var tree = $('#layer-tree').fancytree('getTree');
            	var layerSource = tree.getRootNode().children;
            	layerSource.push(lyrNode);
        		tree.reload(layerSource);
            },
            error: function (status) 
            {
                // error handler
                Materialize.toast('Error MPCM Layer ' + catalogItem.mpcmId, 4000);
            }
		});
	}
}

function createTreeItem(catalogItem)
{
	var item = {
					title: catalogItem.label, 
					folder: catalogItem.mpcmId == 0, 
					expanded: false, 
					data: catalogItem, 
					children: []
				};
	
	for (var subItem in catalogItem.sublayers)
	{
		item.children.push(createTreeItem(catalogItem.sublayers[subItem]));
	}
	
	return item
}

function createWmsTreeItem(wmsItem)
{
	var item = {
			title: wmsItem.title, 
			folder: wmsItem.styles.length > 0, 
			expanded: false,  
			data: wmsItem,
			children: []
		};

	for (var subItem in wmsItem.styles)
	{
		var styleData = wmsItem.styles[subItem];
		
		var styleItem = {
				title: styleData.title, 
				folder: false, 
				expanded: false, 
				data: { wms: wmsItem, style: styleData }
			};
		
		item.children.push(styleItem);
	}
	
	return item
}

function loadCatalogLayers()
{
	// setup catalog layers
	var catalogTreeSource = [];
	
	$("#catalog-tree").fancytree({
	    checkbox: true,
	    selectMode: 3,
	    source: catalogTreeSource,
	    activate: function(event, data)
	    {
	    },
	    select: function(event, data)
	    {
	    }
	  });
	
	$.ajax
	({
		url: serviceUrl + 'LayerLibrary/',
        type: 'get',
        dataType: 'json',
        contentType:'application/json',
        crossDomain: true,
        withCredentials: true,
        success: function (data) 
        {
        	data.forEach(function(catalogItem) 
        	{
        		catalogTreeSource.push(createTreeItem(catalogItem));
        		
        		var tree = $('#catalog-tree').fancytree('getTree');
        		tree.reload(catalogTreeSource);
        	});
        },
        error: function (status) 
        {
            // error handler
            Materialize.toast('Error loading DataBC Layer catalog. Please try again later', 4000);
        }
	});
}

function loadWmsLayers()
{
	$("#wmsPanelLoading").show();
	$("#wmsPanel").hide();
	
	var catalogTreeSource = [];
	
	$("#wms-catalog-tree").fancytree({
	    checkbox: true,
	    selectMode: 3,
	    source: catalogTreeSource,
	    activate: function(event, data)
	    {
	    },
	    select: function(event, data)
	    {
	    }
	  });
	
	wmsUrl = $("#wmsUrlField").val();
	wmsVersion = $("#wmsVersionField").val();
	
	$.ajax
	({
		url: serviceUrl + "LayerLibrary/wms/?url=" + encodeURIComponent(wmsUrl + wmsPostfix),
        type: 'get',
        dataType: 'json',
        contentType:'application/json',
        success: function (data) 
        {
        	data.forEach(function(catalogItem) 
        	{
        		catalogTreeSource.push(createWmsTreeItem(catalogItem));
        		
        		var tree = $('#wms-catalog-tree').fancytree('getTree');
        		tree.reload(catalogTreeSource);
        	});
        	
        	$("#wmsPanelLoading").hide();
        	$("#wmsPanel").show();
        },
        error: function (status) 
        {
            // error handler
            Materialize.toast('Error loading GetCapabilities from ' + wmsUrl + '. Please try again later', 4000);
            $("#wmsPanelLoading").hide();
        	$("#wmsPanel").show();
        }
	});
}

function loadConfigs()
{
	// clear the tables
	$("#appsTable > tbody").html("");
	$("#publishedAppsTable > tbody").html("");
	$("#dbcAttributes").empty();
	$("#wmsAttributes").empty();
	
	mapConfigs = [];
	publishedMapConfigs = [];
	selectedMapConfig = null;
	editMode = false;
	
	// trigger the ajax load for edit copy configs
	$.ajax
	({
		url: serviceUrl + 'MapConfigurations/',
        type: 'get',
        dataType: 'json',
        contentType:'application/json',
        crossDomain: true,
        withCredentials: true,
        success: function (data) 
        {
        	// finished building table
        	$("#loadingBar").hide();
        	$("#appsTablePanel").show();
        	
        	data.forEach(function(appConfigStub) 
        	{
        		$.ajax
    			({
    				url: serviceUrl + 'MapConfigurations/' + appConfigStub.id,
                    type: 'get',
                    dataType: 'json',
                    contentType:'application/json',
                    crossDomain: true,
                    withCredentials: true,
                    success: function (appConfig) 
                    {                            	
                    	mapConfigs.push(appConfig);
                		$("#appsTable > tbody:last-child").append("<tr id='" + appConfig.lmfId + "\'><td><a href='#' onclick='previewMapConfig(\"" + appConfig.lmfId + "\");' class='blue-text'>" + appConfig.name + "</a></td><td>" + appConfig.viewer.type + "</td><td>" + appConfig.lmfRevision + "." + (parseInt(appConfig._rev.split('-')[0]) - 1) + "</td><td><a href='#' onclick='editMapConfig(\"" + appConfig.lmfId + "\");' class='blue-text'>Edit</a></td><td><a href='#' onclick='publishMapConfig(\"" + appConfig.lmfId + "\");' class='blue-text'>Publish</a></td><td><a href='#' onclick='deleteMapConfig(\"" + appConfig.lmfId + "\");' class='blue-text'>Delete</a></td></tr>");
                    },
                    error: function (status) 
                    {
                        // error handler
                        Materialize.toast('Error loading application ' + appConfigStub.id, 4000);
                    }
    			});
        	});
        },
        error: function (status) 
        {
            // error handler
            Materialize.toast('Error loading applications. Please try again later', 4000);
        }
	});
	
	//trigger the load for published configs
	$.ajax
	({
		url: serviceUrl + 'MapConfigurations/Published/',
        type: 'get',
        dataType: 'json',
        contentType:'application/json',
        crossDomain: true,
        withCredentials: true,
        success: function (data) 
        {
        	data.forEach(function(appConfigStub) 
        	{
        		$.ajax
    			({
    				url: serviceUrl + 'MapConfigurations/Published/' + appConfigStub.id,
                    type: 'get',
                    dataType: 'json',
                    contentType:'application/json',
                    crossDomain: true,
                    withCredentials: true,
                    success: function (appConfig) 
                    {                            	
                    	publishedMapConfigs.push(appConfig);
                		$("#publishedAppsTable > tbody:last-child").append("<tr id='" + appConfig.lmfId + "\-pub'><td><a href='#' onclick='previewPublishedMapConfig(\"" + appConfig.lmfId + "\");' class='blue-text'>" + appConfig.name + "</a></td><td>" + appConfig.viewer.type + "</td><td>" + appConfig.lmfRevision + "." + (parseInt(appConfig._rev.split('-')[0]) - 1) + "</td><td><a href='#' onclick='unPublishMapConfig(\"" + appConfig.lmfId + "\");' class='blue-text'>Un-Publish</a></td><td><a href='" + serviceUrl + "MapConfigurations/Published/" + appConfig.lmfId + "/Export/' download='export_client.war' class='blue-text'>Export</a></td></tr>");
                    },
                    error: function (status) 
                    {
                        Materialize.toast('Error loading published application ' + appConfigStub.id, 4000);
                    }
    			});
        	});
        },
        error: function (status) 
        {
            Materialize.toast('Error loading published applications. Please try again later', 4000);
        }
	});
}

$(document).ready(function()
	{
	
	// init vue
	var app = new Vue(
	{
	  el: '#app',
	  data: data
	});
	
	var bmLayers = [];
	bmLayers.push(L.esri.basemapLayer("Streets"));
	bmLayers.push(L.esri.basemapLayer("Topographic"));
	bmLayers.push(L.esri.basemapLayer("NationalGeographic"));
	bmLayers.push(L.esri.basemapLayer("ImageryClarity"));
	
	// init background map
	var map = L.map('map', { zoomControl: false });
	map.touchZoom.disable();
	map.doubleClickZoom.disable();
	map.scrollWheelZoom.disable();
	map.boxZoom.disable();
	map.keyboard.disable();
	var bm = bmLayers[Math.floor((Math.random() * bmLayers.length - 1) + 1)];
	map.addLayer(bm);
	
	var rndLat = Math.random() * (60 - 48.3) + 47.294;
	var rndLon = (Math.random() * (124 - 111.291) + 114) * -1;
	var rndZoom = Math.floor(Math.random() * (11 - 6) + 6);

	map.setView(new L.latLng(rndLat, rndLon), rndZoom, { animate: true, duration: 60 } );
	
	// reset preview to basemap exent on config edit
	layerPreviewViewer = L.map('layerPreviewViewer');
	layerPreviewViewer.setView(new L.latLng(rndLat, rndLon), rndZoom, { animate: true, duration: 60 } );
	
	// set basemap
	basemapViewerMap = L.map('basemapViewer');
		basemapViewerMap.on('moveend', function() 
		{
			if(editMode)
			{
				var bounds = basemapViewerMap.getBounds();
				
				if(bounds.getWest() != bounds.getEast() && bounds.getNorth() != bounds.getSouth())
				{
					data.viewer.initialExtent[0] = bounds.getWest();
					data.viewer.initialExtent[1] = bounds.getNorth();
					data.viewer.initialExtent[2] = bounds.getEast();
					data.viewer.initialExtent[3] = bounds.getSouth();
				}
			}
		});
	
		//set wms defaults
		$("#wmsUrlField").val(wmsUrl);
		$("#wmsVersionField").val(wmsVersion);
		
		// hide editor
	$("#editor-content").hide();
	
		// init the layer tree
		// setup catalog layers
	var layerTreeSource = [];
	
	$("#layer-tree").fancytree({
	    checkbox: true,
	    selectMode: 1,
	    source: [],
	    activate: function(event, data)
	    {
	    },
	    select: function(event, data)
	    {
	    }
	  });
		
	$('ul.tabs').tabs();
	$('ul.tabs').tabs('select_tab', 'editCopyMaps');
	
	loadConfigs();
	loadCatalogLayers();
	
	//init the file upload components
	document.getElementById('vectorFileUpload').addEventListener('change', readFile, false);
	document.getElementById('headerImageFileUpload').addEventListener('change', readFile, false);
	document.getElementById('replaceVectorFileUpload').addEventListener('change', readFile, false);
});

var fileContents;
var unsavedAttachments = [];

function readFile(e) 
{
	fileContents = null;
	
	var file = e.target.files[0];
	
	if (!file) 
	{
	    return;
	}
	
	fileContents = file;
}

var fileString;
function fileToString(file)
{
	fileString = null;
	var reader = new FileReader();
	
	reader.onload = function(e) 
	{
		fileString = e.target.result;
	};

	reader.readAsText(file);
}

function uuid() 
{
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) 
	{
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}