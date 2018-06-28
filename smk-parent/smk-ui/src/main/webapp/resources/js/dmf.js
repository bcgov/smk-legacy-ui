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

function isURL(str) 
{
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  
  return pattern.test(str);
}

var serviceUrl = "../smks-api/";
var wmsUrl = "https://openmaps.gov.bc.ca/geo/pub/ows";
var wmsPostfix = "?service=WMS&request=GetCapabilities";
var wmsVersion = "1.3.0";
var mapConfigs = [];
var publishedMapConfigs = [];
var selectedMapConfig;
var basemapViewerMap;
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
	        location:{ extent:[]},
	        baseMap: "Imagery"
	    },
	    tools: [
			{ "type": "menu" },
			{ "type": "dropdown" }
	    ],
	    layers: [],
	    _id: null,
	    _rev: null
	};

function parseKmlLayerStyle(fileText)
{
	var layer = omnivore.kml.parse(fileText);
	
	var firstLayer = Object.keys(layer._layers)[0];
	// parsed styles from omnivore (incomplete)
	var options = layer._layers[firstLayer].options;
	
	var dom = (new DOMParser()).parseFromString(fileText, 'text/xml');
	// parsed styles from direct dom (dom.firstChild(kml).firstChild(document)
	var styleNodes = dom.firstElementChild.firstElementChild.childNodes;
	
	var opacity = options.opacity != null ? options.opacity : 1.0;
	var strokeOpacity = 1.0;
	var fillOpacity = options.fillOpacity != null ? options.fillOpacity : 0.65;
	var strokeWidth = options.weight != null ? options.weight : "1";
	var strokeStyle = options.dashArray != null ? options.dashArray : "1";
	var strokeColor = options.color != null ? options.color : "#000000";
	var fillColor = options.fillColor != null ? options.fillColor : options.color != null ? options.color : "#000000";
	var markerSize = 1;
	var markerUrl = null;
	var markerOffsetX = 0;
	var markerOffsetY = 0;
	
	for(var i = 0; i < styleNodes.length; i++)
	{
		var node = styleNodes[i];
		if(node.localName == "Style")
		{
			for(var styleIndex = 0; styleIndex < node.childNodes.length; styleIndex++)
			{
				var styleNode = node.childNodes[styleIndex];
				
				if(styleNode.nodeName != "#text")
				{
					if(styleNode.getElementsByTagName("color").length) 
					{
						fillColor = styleNode.getElementsByTagName("color")[0].innerHTML;
						strokeColor = styleNode.getElementsByTagName("color")[0].innerHTML;
					}
					
					if(styleNode.localName == "LineStyle")
					{
						if(styleNode.getElementsByTagName("width").length) strokeWidth = styleNode.getElementsByTagName("width")[0].innerHTML;
					}
					else if(styleNode.localName == "PolyStyle")
					{
						if(styleNode.getElementsByTagName("fill").length) fillOpacity = styleNode.getElementsByTagName("fill")[0].innerHTML;
						if(styleNode.getElementsByTagName("outline").length) strokeWidth = styleNode.getElementsByTagName("outline")[0].innerHTML;
					}
					else if(styleNode.localName == "IconStyle")
					{
						if(styleNode.getElementsByTagName("scale").length) markerSize = styleNode.getElementsByTagName("scale")[0].innerHTML;
						if(styleNode.getElementsByTagName("hotSpot").length) markerOffsetX = styleNode.getElementsByTagName("hotSpot")[0].getAttribute("x").innerHTML;
						if(styleNode.getElementsByTagName("hotSpot").length) markerOffsetY = styleNode.getElementsByTagName("hotSpot")[0].getAttribute("y").innerHTML;
						if(styleNode.getElementsByTagName("Icon").length) markerUrl = styleNode.getElementsByTagName("Icon")[0].getElementsByTagName("href")[0].innerHTML;
					}
				}
			}
		}
	}
	
	if(markerUrl != null)
	{
		unsavedAttachments.push(
		{
			type: "marker_upload",
			layer: null,
			contents: getBase64Image(markerUrl)
		});
	}
	
	if(fillColor.length > 7) fillColor = "#" + fillColor.substring(0, 6);
	if(strokeColor.length > 7) strokeColor = "#" + strokeColor.substring(0, 6);

	// set the vector layer panel options
	if(selectedLayerNode == null) // new file panel
	{
		$("#kmlOpacity").val(opacity);
		$("#kmlStrokeOpacity").val(strokeOpacity);
		$("#kmlFillOpacity").val(fillOpacity);
		$("#kmlStrokeWidth").val(strokeWidth);
		$("#kmlStrokeStyle").val(strokeStyle);
		$("#kmlStrokeColor").val(strokeColor);
		$("#kmlFillColor").val(fillColor);
		
		if(markerUrl != null)
		{
			$("#kmlMarkerSizeX").val(parseInt(markerSize));
			$("#kmlMarkerSizeY").val(parseInt(markerSize));
			$("#kmlMarkerOffsetX").val(parseInt(markerOffsetX));
			$("#kmlMarkerOffsetY").val(parseInt(markerOffsetY));
		}
	}
	else // edit panel
	{
		$("#vectorOpacity").val(opacity);
		$("#vectorStrokeOpacity").val(strokeOpacity);
		$("#vectorFillOpacity").val(fillOpacity);
		$("#vectorStrokeWidth").val(strokeWidth);
		$("#vectorStrokeStyle").val(strokeStyle);
		$("#vectorStrokeColor").val(strokeColor);
		$("#vectorFillColor").val(fillColor);
		
		if(markerUrl != null)
		{
			$("#vectorMarkerSizeX").val(parseInt(markerSize));
			$("#vectorMarkerSizeY").val(parseInt(markerSize));
			$("#vectorMarkerOffsetX").val(parseInt(markerOffsetX));
			$("#vectorMarkerOffsetY").val(parseInt(markerOffsetY));
		}
	}
	
	Materialize.updateTextFields();
}

function getBase64Image(imgUrl) 
{
    var image   = new Image();
    var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");
	
	image.src = imgUrl;
	context.drawImage(image, 0, 0);
	
	var dataURL = canvas.toDataURL("image/png");
	return dataURL; // dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}


function openLayerTemplateEditor()
{
	// configure layer-popup-content
	$('#layer-popup-content').trumbowyg(
	{
		resetCss: true,
		semantic: false,
		btns: [
		        ['viewHTML'],
		        ['undo', 'redo'], // Only supported in Blink browsers
		        ['formatting'],
		        ['strong', 'em', 'del'],
		        ['superscript', 'subscript'],
		        ['foreColor', 'backColor'],
		        ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
		        ['unorderedList', 'orderedList'],
		        ['horizontalRule'],
		        ['preformatted'],
		        ['template'],
		        ['removeformat'],
		        ['link'],
		        ['insertImage', 'base64'],
		        ['noembed'],
		        ['fullscreen']
		    ]
	});
	
	$('#layer-popup-content').on('tbwchange', function(delta, oldDelta, source)
	{
		selectedLayerNode.data.popupTemplate = $("#layer-popup-content").trumbowyg('html');
	});

	$("#layer-popup-content").empty();
	$("#layer-popup-content").trumbowyg('html', "");
	$('#layer-popup-content').trumbowyg('toggle');
	$("#layer-popup-content").trumbowyg('html', selectedLayerNode.data.popupTemplate);

	$('#layerPopupTemplateModal').modal('open');
}

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
	    		$("#ShadedReliefMini").prop('checked', tool.baseMap == "ShadedRelief");
    		}
	    	else if(tool.type == "minimap" && tool.enabled == false) $("#minimapOptions").hide();
	    	else if(tool.type == "about" && tool.enabled == true)
    		{
	    		$("#aboutPanelOptions").show();
	    		setupQuillEditor(tool);
    		}
	    	else if(tool.type == "about" && tool.enabled == false) $("#aboutPanelOptions").hide();
	    	else if(tool.type == "identify" && tool.enabled == true)
    		{
	    		$("#identifyOptions").show();
	    		
	    		$("#identifyStyleOpacity").val(tool.styleOpacity);
    			$("#identifyStyleStrokeOpacity").val(tool.style.strokeOpacity);
    			$("#identifyStyleFillOpacity").val(tool.style.fillOpacity);
    			$("#identifyStyleStrokeWidth").val(tool.style.strokeWidth);
    			$("#identifyStyleStrokeStyle").val(tool.style.strokeStyle);
    			$("#identifyStyleStrokeColor").val(tool.style.strokeColor);
    			$("#identifyStyleFillColor").val(tool.style.fillColor);
    			$("#identifyPanelVisible").prop('checked', tool.showPanel);
    			$("#identifyClickRadius").val(tool.tolerance);
    		}
	    	else if(tool.type == "identify" && tool.enabled == false) $("#identifyOptions").hide();
	    	else if(tool.type == "select" && tool.enabled == true)
    		{
	    		$("#selectionOptions").show();
	    		
	    		$("#selectStyleOpacity").val(tool.styleOpacity);
    			$("#selectStyleStrokeOpacity").val(tool.style.strokeOpacity);
    			$("#selectStyleFillOpacity").val(tool.style.fillOpacity);
    			$("#selectStyleStrokeWidth").val(tool.style.strokeWidth);
    			$("#selectStyleStrokeStyle").val(tool.style.strokeStyle);
    			$("#selectStyleStrokeColor").val(tool.style.strokeColor);
    			$("#selectStyleFillColor").val(tool.style.fillColor);
    		}
	    	else if(tool.type == "select" && tool.enabled == false) $("#selectionOptions").hide();
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
		    		$("#ShadedReliefBml").prop('checked', tool.choices.indexOf("ShadedRelief") > -1);
	           	});
    		}
	    	else if(tool.type == "baseMaps" && tool.enabled == false) $("#basemapPanelOptions").hide();

			//if(tool.enabled == true) Materialize.toast('Activated ' + tool.type + " tool!", 4000);
			//else Materialize.toast('Deactivated ' + tool.type + " tool!", 4000);
		}
   	});
}

function setupQuillEditor(tool)
{
	$('#about-content').trumbowyg(
	{
		resetCss: true,
		btns: [
		        ['viewHTML'],
		        ['undo', 'redo'], // Only supported in Blink browsers
		        ['formatting'],
		        ['strong', 'em', 'del'],
		        ['superscript', 'subscript'],
		        ['foreColor', 'backColor'],
		        ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
		        ['unorderedList', 'orderedList'],
		        ['horizontalRule'],
		        ['preformatted'],
		        ['template'],
		        ['removeformat'],
		        ['link'],
		        ['insertImage', 'base64'],
		        ['noembed'],
		        ['fullscreen']
		    ]
	});
	$('#about-content').on('tbwchange', function(delta, oldDelta, source)
	{
		tool.content = $("#about-content").trumbowyg('html');
	});

	$("#about-content").empty();
	$("#about-content").trumbowyg('html', tool.content);
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
	finishLayerEdits(false);
	
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
			// reload, in case of changes made by other users
			$.ajax
			({
				url: serviceUrl + 'MapConfigurations/' + mapConfigId,
		        type: 'get',
		        dataType: 'json',
		        contentType:'application/json',
		        crossDomain: true,
		        withCredentials: true,
		        success: function (loadedConfig)
		        {
		        	mapConfig = loadedConfig;
		        	selectedMapConfig = loadedConfig;

					data.lmfId = loadedConfig.lmfId;
					data.name = loadedConfig.name;
					data.lmfRevision = loadedConfig.lmfRevision;
					data.createdBy = loadedConfig.createdBy;
					data.published = loadedConfig.published;
					data.surround = loadedConfig.surround;
				    data.viewer = loadedConfig.viewer;
				    data.tools = loadedConfig.tools;
				    data.layers = loadedConfig.layers;
				    data._id = loadedConfig._id;
				    data._rev = loadedConfig._rev;

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

		        	unsavedAttachments = [];
		        	fileContents = null;

		        	$(document).ready(function()
		        	{
		        	    Materialize.updateTextFields();

		        	 // init basemap viewer
		        	    setBasemap(data.viewer.baseMap);
		        	    var southWest = L.latLng(47.294133725, -113.291015625),
		                	northEast = L.latLng(61.1326289908, -141.064453125),
		                	bounds = L.latLngBounds(southWest, northEast);
		        	    basemapViewerMap.fitBounds(bounds);
		        	});
		        },
		        error: function (status)
    	        {
    	            Materialize.toast('Map config loading failed. Please refresh and try again. Error: ' + status.responseText, 10000);
    	            console.log('Map config loading failed. Please refresh and try again. Error: ' + status.responseText);
    	        }
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
    	else if(tool.type == "layers") $("#layerPanel").prop('checked', tool.enabled);
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
	    		$("#ShadedReliefMini").prop('checked', tool.baseMap == "ShadedRelief");
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
		    		$("#ShadedReliefBml").prop('checked', tool.choices.indexOf("ShadedRelief") > -1);
	           	});
			}
		}
    	else if(tool.type == "select") 
		{
    		$("#selectionPanel").prop('checked', tool.enabled);
    		if(tool.enabled)
			{
    			$("#selectionOptions").show();
    			
    			$("#selectStyleOpacity").val(tool.styleOpacity);
    			$("#selectStyleStrokeOpacity").val(tool.style.strokeOpacity);
    			$("#selectStyleFillOpacity").val(tool.style.fillOpacity);
    			$("#selectStyleStrokeWidth").val(tool.style.strokeWidth);
    			$("#selectStyleStrokeStyle").val(tool.style.strokeStyle);
    			$("#selectStyleStrokeColor").val(tool.style.strokeColor);
    			$("#selectStyleFillColor").val(tool.style.fillColor);
			}
		}
    	else if(tool.type == "identify") 
		{
    		$("#identifyPanel").prop('checked', tool.enabled);
    		if(tool.enabled)
			{
    			$("#identifyOptions").show();
    			
    			$("#identifyStyleOpacity").val(tool.styleOpacity);
    			$("#identifyStyleStrokeOpacity").val(tool.style.strokeOpacity);
    			$("#identifyStyleFillOpacity").val(tool.style.fillOpacity);
    			$("#identifyStyleStrokeWidth").val(tool.style.strokeWidth);
    			$("#identifyStyleStrokeStyle").val(tool.style.strokeStyle);
    			$("#identifyStyleStrokeColor").val(tool.style.strokeColor);
    			$("#identifyStyleFillColor").val(tool.style.fillColor);
    			$("#identifyPanelVisible").prop('checked', tool.showPanel);
    			$("#identifyClickRadius").val(tool.tolerance);
			}
		}
    	else if(tool.type == "search") $("#searchPanel").prop('checked', tool.enabled);
    	else if(tool.type == "location") $("#location").prop('checked', tool.enabled);
    	else if(tool.type == "directions") $("#directions").prop('checked', tool.enabled);
    	else if(tool.type == "dropdown") $("#dropdown").prop('checked', tool.enabled);
    	else if(tool.type == "menu") $("#menu").prop('checked', tool.enabled);
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

function finishToolEdits()
{
	data.tools.forEach(function(tool)
	{
		if(tool.type == "identify") 
		{
			tool.styleOpacity = $("#identifyStyleOpacity").val();
			tool.style.strokeOpacity = $("#identifyStyleStrokeOpacity").val();
			tool.style.fillOpacity = $("#identifyStyleFillOpacity").val();
			tool.style.strokeWidth = $("#identifyStyleStrokeWidth").val();
			tool.style.strokeStyle = $("#identifyStyleStrokeStyle").val();
			tool.style.strokeColor = $("#identifyStyleStrokeColor").val();
			tool.style.fillColor = $("#identifyStyleFillColor").val();
			tool.tolerance = $("#identifyClickRadius").val();
			tool.showPanel = $("#identifyPanelVisible").is(":checked");
		}
		else if(tool.type == "select") 
		{
			tool.styleOpacity = $("#selectStyleOpacity").val();
			tool.style.strokeOpacity = $("#selectStyleStrokeOpacity").val();
			tool.style.fillOpacity = $("#selectStyleFillOpacity").val();
			tool.style.strokeWidth = $("#selectStyleStrokeWidth").val();
			tool.style.strokeStyle = $("#selectStyleStrokeStyle").val();
			tool.style.strokeColor = $("#selectStyleStrokeColor").val();
			tool.style.fillColor = $("#selectStyleFillColor").val();
		}
		/*else if(tool.type == "dropdown" && tool.enabled == false)
		{
			// move any queries from the dropdown to the bar
			for(var i = 0; i < data.tools.length; i++)
			{
				var tool = data.tools[i];
				if(tool.type == "query" && tool.position == "dropdown")
				{
					//tool.position = "toolbar"; // or just remove it entirely
				}
			}
		}*/
	});
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
    	    "type": "leaflet",
    	    "location": {
    	      "extent": [
    	        -142.33886718750003,
    	        61.77312286453146,
    	        -107.22656250000001,
    	        45.920587344733654
    	      ],
    	      "center": [
    	        -139.1782,
    	        47.6039
    	      ],
    	      "zoom": 5
    	    },
    	    "baseMap": "Streets"
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
			      "type": "layers",
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
			      "type": "location",
				  "enabled": true,
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
			        "enabled": true,
			        "title": "Selection Panel",
			        "style": {
			          "strokeWidth": 1,
			          "strokeStyle": "1, 1",
			          "strokeColor": "#000000",
			          "strokeOpacity": 0.8,
			          "fillColor": "#000000",
			          "fillOpacity": 0.5,
			          "markerSize": [
			            20,
			            20
			          ],
			          "markerOffset": [
			            10,
			            0
			          ]
			        },
			        "styleOpacity": 1
			      },
			    {
			        "type": "identify",
			        "enabled": true,
			        "title": "Identify Panel",
			        "style": {
			          "strokeWidth": 1,
			          "strokeStyle": "1, 1",
			          "strokeColor": "#000000",
			          "strokeOpacity": 0.8,
			          "fillColor": "#000000",
			          "fillOpacity": 0.5,
			          "markerSize": [
			            20,
			            20
			          ],
			          "markerOffset": [
			            10,
			            0
			          ]
			        },
			        "styleOpacity": 1
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
	 	var ne = L.latLng(data.viewer.location.extent[3], data.viewer.location.extent[2]);
		var sw = L.latLng(data.viewer.location.extent[1], data.viewer.location.extent[0]);
		var bounds = L.latLngBounds(ne, sw);
		var centroid = bounds.getCenter();
		var zoom = basemapViewerMap.getBoundsZoom(bounds, true);

		//basemapViewerMap.setView(bounds.getCenter(), zoom);
		basemapViewerMap.fitBounds(bounds);

		basemapViewerMap.invalidateSize();
	    setBasemap(data.viewer.baseMap);

	    // reset the layer tree
		var tree = $('#layer-tree').fancytree('getTree');
		tree.reload([]);
	});
}

function saveMapConfig()
{
	finishLayerEdits(selectedLayerNode != null);

	finishToolEdits();
	
	// check if the dropdown tool is disabled, but we have queries that use dropdown
	// if we do, change the queries location from "dropdown"
	
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
        	if(result.hasOwnProperty("lmfId")) data.lmfId = result.lmfId;
        	Materialize.toast('Successfully saved application ' + data.lmfId + '. Checking for attachment uploads...', 4000);

        	// now we need to complete any attachments before moving on.
        	
        	if(unsavedAttachments.length > 0)
    		{
        		$("#editor-content").hide("fast");
        		$("#menu-content").show("fast");
        		$("#loadingBar").show();
        		$("#appsTablePanel").hide();
        		
	        	processAttachments(unsavedAttachments).then(function()
	        	{
	        		Materialize.toast('Attachment upload complete', 4000);
	        		closeEditPanel();
	        	});
    		}
        	else
    		{
        		Materialize.toast('No attachments to process. Save complete.', 4000);
        		closeEditPanel();
    		}
        },
        error: function (status)
        {
            Materialize.toast('Error saving application ' + data.lmfId + '. Error: ' + status.responseText, 10000);
            console.log('Error saving application ' + data.lmfId + '. Error: ' + status.responseText);
            if(data._rev == null) data._id = null;
            closeEditPanel();
        }
	});
}

function processAttachments(unsavedAttachments)
{
	var i = 0;
    function next() 
    {
        if (i < unsavedAttachments.length) 
        {
        	attachment = unsavedAttachments[i];
        	
        	if(attachment.contents != null)
        	{
	    		var documentData = new FormData();
	    		
	    		var attchId;
	    		var attchType;
	    		
	    		if(attachment.type == "header_upload") 
	    		{
	    			attchId = "surroundImage";
	    			attchType = "image";
	    			documentData.append('file', attachment.contents);
	    		}
	    		else if(attachment.type == "marker_upload") 
	    		{
	    			attchId = attachment.layer.id + "-marker";
	    			attchType = "image";
	    			documentData.append('file', dataURLToBlob(attachment.contents));
	    		}
	    		else 
	    		{
	    			attchId = attachment.layer.id;
	    			attchType = attachment.type;
	    			documentData.append('file', attachment.contents);
	    		}
	    		
	    		if(attchType == null) attchType = "vector";
	    		    		
	            return handleAttachmentUpload(data.lmfId, attchId, attchType, documentData).then(function(unsavedAttachments) 
	            {
	                ++i;
	                return next();
	            });
        	}
         }
         else 
         {
             // all done with loop
         }
    }
    return next();
}

function handleAttachmentUpload(lmfId, attchId, attchType, documentData)
{
	return Promise.resolve($.ajax
	({
		url: serviceUrl + "MapConfigurations/" + lmfId + "/Attachments/?id=" + attchId + "&type=" + attchType,
        type: "post",
        data: documentData,
        crossDomain: true,
        withCredentials: true,
        cache: false,
        contentType: false,
        processData: false,
        error: function (status)
        {
            Materialize.toast('Error uploading attachment ' + attchId + '. Error: ' + status.responseText, 10000);
            console.log('Error uploading attachment ' + attchId + '. Error: ' + status.responseText);
            closeEditPanel();
        }
	}));
}

function dataURLToBlob(dataURL) 
{
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) 
    {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = parts[1];
        
        return new Blob([raw], {type: contentType});
    }
    else 
    {
        var parts = dataURL.split(BASE64_MARKER);
        var contentType = parts[0].split(':')[1];
        var raw = window.atob(parts[1]);
        var rawLength = raw.length;
        
        var uInt8Array = new Uint8Array(rawLength);
        
        for (var i = 0; i < rawLength; ++i) 
        {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        
        return new Blob([uInt8Array], {type: contentType});
    }
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
                	Materialize.toast('Error un-publishing ' + mapConfigId, 10000);
                	console.log('Error un-publishing ' + mapConfigId + '. Error: ' + status.responseText);
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
                	Materialize.toast('Error publishing ' + mapConfigId, 10000);
                	console.log('Error publishing ' + mapConfigId + '. Error: ' + status.responseText);
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
                    	Materialize.toast('Could not delete ' + mapConfigId + '. Ensure this map is not published before deleting', 10000);
                    	console.log('Error un-publishing ' + mapConfigId + '. Error: ' + status.responseText);
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
			//window.open("viewer.html?type=edit&id=" + mapConfig.lmfId);
			window.open("viewer.html?config=../smks-api/MapConfigurations/" + mapConfig.lmfId + "/");
		}
	});
}

function previewPublishedMapConfig(mapConfigId)
{
	publishedMapConfigs.forEach(function(mapConfig)
	{
		if(mapConfig.lmfId == mapConfigId)
		{
			//window.open("viewer.html?type=published&id=" + mapConfig.lmfId);
			window.open("viewer.html?config=../smks-api/MapConfigurations/Published/" + mapConfig.lmfId + "/");
		}
	});
}

function setBasemap(id)
{
	basemapViewerMap.eachLayer(function (layer)
	{
		basemapViewerMap.removeLayer(layer);
	});

	basemapViewerMap.addLayer(L.esri.basemapLayer(id));
	//resetBasemapView();
}

function resetBasemapView()
{
	$(document).ready(function()
	{
		basemapViewerMap.invalidateSize();

		var sw = L.latLng(data.viewer.location.extent[1], data.viewer.location.extent[2]);
		var ne = L.latLng(data.viewer.location.extent[3], data.viewer.location.extent[0]);
		var bounds = L.latLngBounds(sw, ne);

		basemapViewerMap.fitBounds(bounds);

		editMode = true;
	});
}

var selectedLayerNode;

function downloadSelectedVector()
{
	//trigger the load for published configs
	$.ajax
	({
		url: serviceUrl + 'MapConfigurations/' + data.lmfId + '/Attachments/' + selectedLayerNode.data.id,
		method: 'GET',
        xhrFields: {
            responseType: 'blob'
        },
        success: function (data)
        {
        	var a = document.createElement('a');
            var url = window.URL.createObjectURL(data);
            a.href = url;
            a.download = selectedLayerNode.data.title + '.json';
            a.click();
            window.URL.revokeObjectURL(url);
        },
        error: function (status)
        {
            Materialize.toast('Error loading JSON. Please try again later. Error: ' + status.responseText, 10000);
            console.log('Error loading JSON. Error: ' + status.responseText);
        }
	});
}

function setTitleAttribute(val)
{
	selectedLayerNode.data.titleAttribute = val; 
}

function finishLayerEdits(save)
{
	if(save)
	{
		if(selectedLayerNode.data.type == "wms")
		{
			//set fields
			selectedLayerNode.data.isVisible = $("#wmsVisible").is(":checked");
			selectedLayerNode.data.isQueryable = $("#wmsQueryable").is(":checked");
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
			selectedLayerNode.data.isQueryable = $("#dbcQueryable").is(":checked");
			selectedLayerNode.data.title = $("#dbcName").val();
			selectedLayerNode.data.attribution = $("#dbcAttribution").val();
			selectedLayerNode.data.opacity = $("#dbcOpacity").val();
			selectedLayerNode.title = $("#dbcName").val();
			
			// update definition expression
			if($("#dbcDefinitionExpression").val() != null)
			{
				var dynamicJson = JSON.parse(selectedLayerNode.data.dynamicLayers[0]);
				dynamicJson.definitionExpression = $("#dbcDefinitionExpression").val();
				selectedLayerNode.data.dynamicLayers[0] = JSON.stringify(dynamicJson);
			}

			selectedLayerNode.data.attributes.forEach(function (attribute)
			{
				attribute.visible = $("#" + attribute.id + "_visible").is(":checked");
				attribute.title = $("#" + attribute.id + "_label").val();
			});
		}
		else // vector
		{
			// if user activated clustering, change vector type
			if(selectedLayerNode.data.type == "vector" && $("#vectorClustering").is(":checked")) 
			{
				selectedLayerNode.data.type == "clustered";
			}
			if(selectedLayerNode.data.type == "clustered" && !$("#vectorClustering").is(":checked")) 
			{
				selectedLayerNode.data.type == "vector";
			}
			
			selectedLayerNode.data.isVisible = $("#vectorVisible").is(":checked");
			selectedLayerNode.data.isQueryable = $("#vectorQueryable").is(":checked");
			selectedLayerNode.data.title = $("#vectorName").val();
			selectedLayerNode.data.dataUrl = $("#vectorUrl").val();
			selectedLayerNode.data.opacity = $("#vectorOpacity").val();
			selectedLayerNode.data.useRaw = !$("#vectorClustering").is(":checked");
			selectedLayerNode.data.useClustering = $("#vectorClustering").is(":checked");
			selectedLayerNode.data.useHeatmap = $("#vectorHeatmapping").is(":checked");
			selectedLayerNode.data.style.strokeWidth = $("#vectorStrokeWidth").val();
			selectedLayerNode.data.style.strokeStyle = $("#vectorStrokeStyle").val();
			selectedLayerNode.data.style.strokeColor = $("#vectorStrokeColor").val();
			selectedLayerNode.data.style.strokeOpacity = $("#vectorStrokeOpacity").val();
			selectedLayerNode.data.style.fillColor = $("#vectorFillColor").val();
			selectedLayerNode.data.style.fillOpacity = $("#vectorFillOpacity").val();
			selectedLayerNode.data.style.markerSize = [$("#vectorMarkerSizeX").val(), $("#vectorMarkerSizeY").val()];
			selectedLayerNode.data.style.markerOffset = [$("#vectorMarkerOffsetX").val(), $("#vectorMarkerOffsetY").val()];
			
			// add the attachment data to the cache for upload after save
			// currently you cannot re-upload and must create a new layer
			if(fileContents !== null)
			{
				unsavedAttachments.push(
				{
					type: $("#vectorType").val(),
					layer: selectedLayerNode.data,
					contents: fileContents
				});
			}

			unsavedAttachments.forEach(function(attch)
			{
				if(attch.type == "marker_upload" && attch.layer == null)
				{
					attch.layer = selectedLayerNode.data;
					selectedLayerNode.data.style.markerUrl = "@" +  selectedLayerNode.data.id + "-marker";
				}
			});
			
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

	$("#attributePanel").empty();
	$("#queriesTable tr").remove();
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
	$("#attributePanel").empty();
	$("#queriesTable tr").remove();
	
	var firstEdited = false;
	
	nodes.forEach(function(node)
   	{
		if(!firstEdited)
		{
			firstEdited = true;
			// display edit panel with node object
			$("#editLayerPanel").show();
			$("#layerAddPanel").hide();
	
			selectedLayerNode = node;
	
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
	
			    //set fields
				$("#wmsVisible").prop('checked', node.data.isVisible);
				$("#wmsQueryable").prop('checked', node.data.isQueryable);
				$("#wmsName").val(node.data.title);
				$("#wmsAttribution").val(node.data.attribution);
				$("#wmsOpacity").val(node.data.opacity);
	
				if(node.data.attributes == null) node.data.attributes = [];
				$("#attributePanel").empty();
				
				node.data.attributes.forEach(function (attribute)
				{
					$("#attributePanel").append('<div class="row"><div class="col s2"><p><input type="checkbox" id="' + attribute.id + '_visible" /><label class="black-text" for="' + attribute.id + '_visible">Visible</label></p></div><div class="col s2"><p><input name="titleGroup" type="radio" id="' + attribute.id + '_title" onclick="setTitleAttribute(\'' + attribute.name + '\')" /><label for="' + attribute.id + '_title"></label></p></div><div class="col s8 input-field"><input id="' + attribute.id + '_label" type="text"><label for="' + attribute.id + '_label">' + attribute.name + '</label></div></div>');
					$("#" + attribute.id + "_visible").prop('checked', attribute.visible);
					$("#" + attribute.id + "_label").val(attribute.title);
					
					if(node.data.hasOwnProperty("titleAttribute") && node.data.titleAttribute == attribute.name)
					{
						$("#" + attribute.id + "_title").prop('checked', true);
					}
					else
					{
						$("#" + attribute.id + "_title").prop('checked', false);
					}
				});
				
				if(node.data.queries == null) node.data.queries = [];
				$("#queriesTable tr").remove();
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
	
				//set fields
				$("#dbcVisible").prop('checked', node.data.isVisible);
				$("#dbcQueryable").prop('checked', node.data.isQueryable);
				$("#dbcName").val(node.data.title);
				$("#dbcAttribution").val(node.data.attribution);
				$("#dbcOpacity").val(node.data.opacity);
				
				// get the defnition expression
				if(node.data.dynamicLayers != null && node.data.dynamicLayers[0] != null)
				{
					var dynamicJson = JSON.parse(node.data.dynamicLayers[0]);
					if(dynamicJson.hasOwnProperty('definitionExpression'))
					{
						$("#dbcDefinitionExpression").val(dynamicJson.definitionExpression);
					}
				}
				
				if(node.data.attributes == null) node.data.attributes = [];
				$("#attributePanel").empty();
				
				node.data.attributes.forEach(function (attribute)
				{
					$("#attributePanel").append('<div class="row"><div class="col s2"><p><input type="checkbox" id="' + attribute.id + '_visible" /><label class="black-text" for="' + attribute.id + '_visible">Visible</label></p></div><div class="col s2"><p><input name="titleGroup" type="radio" id="' + attribute.id + '_title" /><label for="' + attribute.id + '_title" onclick="setTitleAttribute(\'' + attribute.name + '\')"></label></p></div><div class="col s8 input-field"><input id="' + attribute.id + '_label" type="text"><label for="' + attribute.id + '_label">' + attribute.name + '</label></div></div>');
					$("#" + attribute.id + "_visible").prop('checked', attribute.visible);
					$("#" + attribute.id + "_label").val(attribute.title);
					
					if(node.data.hasOwnProperty("titleAttribute") && node.data.titleAttribute == attribute.name)
					{
						$("#" + attribute.id + "_title").prop('checked', true);
					}
					else
					{
						$("#" + attribute.id + "_title").prop('checked', false);
					}
				}); 
				
				if(node.data.queries == null) node.data.queries = [];
				$("#queriesTable tr").remove();
			}
			else
			{
				$("#layerEditVectorPanel").show(); // vector
	
				$("#vectorVisible").prop('checked', node.data.isVisible);
				$("#vectorQueryable").prop('checked', node.data.isQueryable);
				$("#vectorName").val(node.data.title);
				$("#vectorOpacity").val(node.data.opacity);
				$("#vectorRawVector").prop('checked', node.data.useRaw);
				$("#vectorClustering").prop('checked', node.data.useClustering);
				$("#vectorHeatmapping").prop('checked', node.data.useHeatmap);
				$("#vectorStrokeWidth").val(node.data.style.strokeWidth);
				$("#vectorStrokeStyle").val(node.data.style.strokeStyle);
			    $("#vectorStrokeColor").val(node.data.style.strokeColor);
			    $("#vectorStrokeOpacity").val(node.data.style.strokeOpacity);
			    $("#vectorFillColor").val(node.data.style.fillColor);
			    $("#vectorFillOpacity").val(node.data.style.fillOpacity);
			    $("#vectorMarkerSizeX").val(node.data.style.markerSize[0]);
			    $("#vectorMarkerSizeY").val(node.data.style.markerSize[1]);
			    $("#vectorMarkerOffsetX").val(node.data.style.markerOffset[0]);
			    $("#vectorMarkerOffsetY").val(node.data.style.markerOffset[1]);
			    
			    if(node.data.attributes == null) node.data.attributes = [];
			    $("#attributePanel").empty();

			    node.data.attributes.forEach(function (attribute)
				{
					$("#attributePanel").append('<div class="row"><div class="col s2"><p><input type="checkbox" id="' + attribute.id + '_visible" /><label class="black-text" for="' + attribute.id + '_visible">Visible</label></p></div><div class="col s2"><p><input name="titleGroup" type="radio" id="' + attribute.id + '_title" /><label for="' + attribute.id + '_title" onclick="setTitleAttribute(\'' + attribute.name + '\')"></label></p></div><div class="col s8 input-field"><input id="' + attribute.id + '_label" type="text"><label for="' + attribute.id + '_label">' + attribute.name + '</label></div></div>');
					$("#" + attribute.id + "_visible").prop('checked', attribute.visible);
					$("#" + attribute.id + "_label").val(attribute.title);
					
					if(node.data.hasOwnProperty("titleAttribute") && node.data.titleAttribute == attribute.name)
					{
						$("#" + attribute.id + "_title").prop('checked', true);
					}
					else
					{
						$("#" + attribute.id + "_title").prop('checked', false);
					}
				}); 
			    
			    if(node.data.queries == null) node.data.queries = [];
			    $("#queriesTable tr").remove();
			}
	
			Materialize.updateTextFields();
   		}
   	});
}

function removeSelectedLayer()
{
	var nodes = $("#layer-tree").fancytree('getTree').getSelectedNodes();
	var nodesToRemoveCount = nodes.length;
	var index = 0;
	
	nodes.forEach(function(node)
   	{
		index++;
		
		var tree = $('#layer-tree').fancytree('getTree');
    	var layerSource = tree.getRootNode().children;

    	var containsNode = (layerSource.indexOf(node) > -1);
		if(containsNode)
		{
			var nodeIndex = layerSource.indexOf(node);
			if (nodeIndex !== -1) layerSource.splice(nodeIndex, 1);
		}

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
		
		if(index == nodesToRemoveCount) tree.reload(layerSource);
   	});
}

function openQueryEditor()
{
	queryArgumentCount = 0;
	selectedQuery = null;
	argumentIds = [];
	newQuery = false;
	dropdownOptions = [];
	
	$("#queryArguments").empty();
	$("#queriesTable tr").remove();
	document.getElementById("queryEditorForm").reset();
	
	if(selectedLayerNode.data.queries != null)
	{
		$.each(selectedLayerNode.data.queries, function (i, query) 
		{
			// add a row per query
			$("#queriesTable > tbody:last-child").append("<tr id='" + query.id + "-query'><td>" + query.id + "</td><td>" + query.title + "</td><td>" + query.description + "</td><td><a href='#' onclick='editQuery(\"" + query.id + "\")' class='blue-text'>Edit</a></td><td><a href='#' onclick='deleteQuery(\"" + query.id + "\")' class='blue-text'>Delete</a></td></tr>");
		});
	}
	
	$("#queryTable").show();
	$("#queryEditor").hide();
	$('#queriesModal').modal('open');
}

function deleteQuery(id)
{
	// remove row, and trim out the query from the node data
	$("#" + id + "-query").remove();
	selectedLayerNode.data.queries.forEach(function(query)
	{
		if(query.id == id)
		{
			//selectedLayerNode.data.queries.pop(query);
			var idx = selectedLayerNode.data.queries.indexOf(query);
			if(idx > -1)
			{
				selectedLayerNode.data.queries.splice(idx, 1)
			}
			
			// remove the tool
			for(var i = 0; i < data.tools.length; i++)
			{
				var tool = data.tools[i];
				if(tool.type == "query" && tool.instance == selectedLayerNode.data.id + "--" + id)
				{
					var toolIdx = data.tools.indexOf(tool);
					if(toolIdx > -1)
					{
						data.tools.splice(toolIdx, 1)
					}
				}
			}
		}
	});
}

function addNewQuery()
{
	if(selectedLayerNode.data.queries == null) selectedLayerNode.data.queries = [];
	var query = {};
	query.predicate = {};
	selectedQuery = query;
	newQuery = true;
	dropdownOptions = [];
	
	$("#queryTable").hide();
	$("#queryEditor").show();
	$("#queryIcon").val("search");
	
	// we should make sure that the config includes the menu and dropdown tools
	var menuExists = false;
	var dropdownExists = false;
	for(var i = 0; i < data.tools.length; i++)
	{
		var tool = data.tools[i];
		if(tool.type == "menu" && menuExists == false) menuExists = true;
		if(tool.type == "dropdown" && dropdownExists == false) dropdownExists = true;
	}
	
	if(!menuExists)
	{
		var tool = { type: "menu" };
		data.tools.push(tool);
	}
	
	if(!dropdownExists)
	{
		var tool = { type: "dropdown" };
		data.tools.push(tool);
	}
}

function editQuery(id)
{
	queryArgumentCount = 0;
	argumentIds = [];
	dropdownOptions = [];
	
	selectedLayerNode.data.queries.forEach(function(query)
	{
		if(query.id == id)
		{
			selectedQuery = query;
			
			$("#queryName").val(query.title);
			$("#queryDescription").val(query.description);
			$("#queryAndOrToggle").prop('checked', query.predicate.operator == "or" ? true : false);
			
			for(var i = 0; i < data.tools.length; i++)
			{
				if(data.tools[i].type == "query" && data.tools[i].instance == selectedLayerNode.data.id + "--" + selectedQuery.id)
				{
					$("#queryOnDropdown").prop('checked', data.tools[i].position == "dropdown" ? true : false);
					$("#queryIcon").val(data.tools[i].icon);
					break;
				}
			}
			
			// build argument chain
	
			for(var i = 0; i < query.predicate.arguments.length; i++)
			{
				var queryArgs = query.predicate.arguments[i];
				
				queryArgumentCount++;
				argumentIds.push(queryArgumentCount);
				
				$("#queryArguments").append('<div class="row" id="' + queryArgumentCount + '_queryArg"><div class="col s4"><label>Attribute</label><select id="' + queryArgumentCount + '_queryAttributes" class="browser-default"><option value="" disabled selected>-----</option></select></div><div class="col s2"><label>Operator optionality</label><select id="' + queryArgumentCount + '_queryOptionality" class="browser-default"><option value="is" selected>Is</option><option value="not">Is Not</option></select></div><div class="col s2"><label>Operator</label><select id="' + queryArgumentCount + '_queryOperator" class="browser-default"><option value="equals" selected>Equals</option><option value="contains">Contains</option><option value="less-than">Less Than</option><option value="greater-than">Greater Than</option><option value="starts-with">Starts With</option><option value="ends-with">Ends With</option></select></div><div id="' + queryArgumentCount + '_inputTypeBox" class="col s2"><label>Input Type</label><select id="' + queryArgumentCount + '_queryInputType" class="browser-default" onchange="toggleDropdownOptionsButton(' + queryArgumentCount + ');"><option value="input" selected>Textbox</option><option value="select">Dropdown</option></select></div><div class="col s1" id="' + queryArgumentCount + '_dropdownEditButton" style="display: none;"><a class="btn-floating btn-large waves-effect waves-light nrpp-blue-dark" onclick="editQueryDropdownOptions(' + queryArgumentCount + ');"><i class="material-icons left">mode_edit</i></a></div><div class="col s1" id="' + queryArgumentCount + '_removeArgumentButton"><a class="btn-floating btn-large waves-effect waves-light nrpp-blue-dark" onclick="removeQueryArgument(' + queryArgumentCount + ');"><i class="material-icons left">delete_forever</i></a></div>');
				
				if(queryArgs.operator == "not")
				{
					// replace with the inner arguments for the rest of the details
					queryArgs = queryArgs.arguments[0];
					
					$("#" + queryArgumentCount + "_queryOptionality option[value=not]").attr('selected','selected');
				}
				else
				{
					$("#" + queryArgumentCount + "_queryOptionality option[value=is]").attr('selected','selected');
				}

				// set the query operator
				$("#" + queryArgumentCount + "_queryOperator option[value=" + queryArgs.operator + "]").attr('selected','selected');
				
				// get the attribute name and the param type
				var arg1 = queryArgs.arguments[0];
				var arg2 = queryArgs.arguments[1];
				var name = arg1.name != null ? arg1.name : arg2.name != null ? arg2.name : null;
				var paramId = arg1.operand == "parameter" ? arg1.id : arg2.operand == "parameter" ? arg2.id : null;
				
				//set the selected type
				$.each(query.parameters, function (i, parameter) 
				{
					if(parameter.id == paramId)
					{
						$("#" + queryArgumentCount + "_inputTypeBox option[value=" + parameter.type + "]").attr('selected','selected');
						
						if(parameter.type == "select")
						{
							$("#" + queryArgumentCount + "_dropdownEditButton").show();
							dropdownOptions[queryArgumentCount] = parameter.choices;
						}
					}
				});
				
				// set the selected attribute
				$.each(selectedLayerNode.data.attributes, function (i, attribute) 
				{
					$("#" + queryArgumentCount + "_queryAttributes").append($('<option>', 
					{ 
						value:  attribute.name,
						text : attribute.title 
					}));

					if(name != null && attribute.name.toUpperCase() == name.toUpperCase())
					{
						$("#" + queryArgumentCount + "_queryAttributes option[value=" + name.toUpperCase() + "]").attr('selected','selected');
					}
				});
			}
			
			Materialize.updateTextFields();
			
			$("#queryTable").hide();
			$("#queryEditor").show();
		}
	});
}

var queryArgumentCount = 0;
var argumentIds = [];
function addNewQueryArgument()
{
	queryArgumentCount++;
	
	$("#queryArguments").append('<div class="row" id="' + queryArgumentCount + '_queryArg"><div class="col s4"><label>Attribute</label><select id="' + queryArgumentCount + '_queryAttributes" class="browser-default"><option value="" disabled selected>-----</option></select></div><div class="col s2"><label>Operator optionality</label><select id="' + queryArgumentCount + '_queryOptionality" class="browser-default"><option value="is" selected>Is</option><option value="not">Is Not</option></select></div><div class="col s2"><label>Operator</label><select id="' + queryArgumentCount + '_queryOperator" class="browser-default"><option value="equals" selected>Equals</option><option value="contains">Contains</option><option value="less-than">Less Than</option><option value="greater-than">Greater Than</option><option value="starts-with">Starts With</option><option value="ends-with">Ends With</option></select></div><div id="' + queryArgumentCount + '_inputTypeBox" class="col s2"><label>Input Type</label><select id="' + queryArgumentCount + '_queryInputType" class="browser-default" onchange="toggleDropdownOptionsButton(' + queryArgumentCount + ');"><option value="input" selected>Textbox</option><option value="select">Dropdown</option></select></div><div class="col s1" id="' + queryArgumentCount + '_dropdownEditButton" style="display: none;"><a class="btn-floating btn-large waves-effect waves-light nrpp-blue-dark" onclick="editQueryDropdownOptions(' + queryArgumentCount + ');"><i class="material-icons left">mode_edit</i></a></div><div class="col s1" id="' + queryArgumentCount + '_removeArgumentButton"><a class="btn-floating btn-large waves-effect waves-light nrpp-blue-dark" onclick="removeQueryArgument(' + queryArgumentCount + ');"><i class="material-icons left">delete_forever</i></a></div>');
	
	// add query attributes to selection
	
	$.each(selectedLayerNode.data.attributes, function (i, attribute) 
	{
		$("#" + queryArgumentCount + "_queryAttributes").append($('<option>', 
		{ 
			value:  attribute.name,
			text : attribute.title 
		}));
	});
	
	argumentIds.push(queryArgumentCount);
	dropdownOptions[queryArgumentCount] = [];
}

function toggleDropdownOptionsButton(id)
{
	if($("#" + id + "_queryInputType").val() == "select")
	{
		$("#" + id + "_dropdownEditButton").show();
	}
	else
	{
		$("#" + id + "_dropdownEditButton").hide();
	}
}

function removeQueryArgument(id)
{
	$("#" + id + "_queryArg").empty();
	$("#" + id + "_queryArg").remove();
	
	var idx = argumentIds.indexOf(id);
	if(idx > -1)
	{
		argumentIds.splice(idx, 1)
		dropdownOptions[id] = [];
	}
}

var selectedQuery;
var newQuery = false;

function saveQuery()
{
	if(newQuery) selectedQuery.id = $("#queryName").val().replace(/\s+/g, '-').toLowerCase();
	selectedQuery.title = $("#queryName").val();
	selectedQuery.description = $("#queryDescription").val();
	selectedQuery.parameters = [];
	selectedQuery.predicate.operator =  $("#queryAndOrToggle").is(":checked") ? "or" : "and";
	selectedQuery.predicate.arguments = [];
	
	// add arguments and params to query
	for(var i = 0; i < argumentIds.length; i++)
	{
		var argId = argumentIds[i];
		var mainArgument = {};
		var not = $("#" + argId + "_queryOptionality").val();
		
		mainArgument = 
		{
            operator: $("#" + argId + "_queryOperator").val(),
            arguments: [
                {
                    operand: "attribute",
                    name: $("#" + argId + "_queryAttributes").val()
                },
                {
                    operand: "parameter",
                    id: "param" + argId
                }
            ]
        };
		
		var paramTitle = $("#" + argId + "_queryAttributes option:selected").text();
		if(not == "not") paramTitle += " not";
		paramTitle += " " + mainArgument.operator.replace(/-/g, ' ');
			
		var param = 
		{
            id: "param" + argId,
            type: $("#" + argId + "_queryInputType").val(),
            title: paramTitle,
            value: null
        };
		
		if(param.type == "select")
		{
			param.choices = dropdownOptions[argId];
		}
		
		selectedQuery.parameters.push(param);
		
		if(not == "not")
		{
			var notArgument = 
			{
	            operator: not,
	            arguments: []
	        };
			
			notArgument.arguments.push(mainArgument);
			mainArgument = notArgument;
		}
		
		selectedQuery.predicate.arguments.push(mainArgument);
	}

	if(newQuery) 
	{
		// push the data into the query array
		selectedLayerNode.data.queries.push(selectedQuery);
		// add a tool
		
		var tool =
		{
			type: "query", 
			instance: selectedLayerNode.data.id + "--" + selectedQuery.id,
			position: $("#queryOnDropdown").is(":checked") ? "dropdown" : "toolbar", 
			icon: $("#queryIcon").val()
		};
		
		data.tools.push(tool);
	}
	else
	{
		for(var i = 0; i < data.tools.length; i++)
		{
			if(data.tools[i].type == "query" && data.tools[i].instance == selectedLayerNode.data.id + "--" + selectedQuery.id)
			{
				data.tools[i].position = $("#queryOnDropdown").is(":checked") ? "dropdown" : "toolbar";
				data.tools[i].icon = $("#queryIcon").val();
				break;
			}
		}
	}
	
	newQuery = false;
	selectedQuery = null;
	
	$("#queryEditor").hide();
	$("#queryArguments").empty();
	
	document.getElementById("queryEditorForm").reset();

	queryArgumentCount = 0;
	argumentIds = [];
	
	$("#queriesTable tr").remove();
	if(selectedLayerNode.data.queries != null)
	{
		$.each(selectedLayerNode.data.queries, function (i, query) 
		{
			// add a row per query
			$("#queriesTable > tbody:last-child").append("<tr id='" + query.id + "-query'><td>" + query.id + "</td><td>" + query.title + "</td><td>" + query.description + "</td><td><a href='#' onclick='editQuery(\"" + query.id + "\")' class='blue-text'>Edit</a></td><td><a href='#' onclick='deleteQuery(\"" + query.id + "\");' class='blue-text'>Delete</a></td></tr>");
		});
	}
	
	$("#queryTable").show();
}

function updateQueryIconPrefix()
{
	var txt = $("#iconDemo").text();
	var val = $("#queryIcon").val();
	$("#iconDemo").text($("#queryIcon").val());
}

function loadDropdownChoiceFromLayer()
{
	var layer = selectedLayerNode.data;
	if(layer.type == "vector")
	{
		// fetch json from service, parse all attributes
		alert("Not yet implemented");
	}
	else if(layer.type == "esri-dynamic")
	{
		// run an ArcGIS query on the layer, no geom return, just the selected attribute
		alert("Not yet implemented");
	}
	else if(layer.type == "wms")
	{
		// wfs query to get all layer data.
		var attribute = $("#" + currentDropdownId + "_queryAttributes").val();
		var url = layer.serviceUrl + "?service=WFS&request=GetFeature&typeNames=" + layer.layerName + "&propertyName=" + attribute + "&outputformat=application%2Fjson";
		
		// fire a request to the wfs URL. take all the results and create choices out of them
		$.ajax
		({
			url: url,
	        type: 'get',
	        dataType: 'json',
	        contentType:'application/json',
	        crossDomain: true,
	        withCredentials: true,
	        success: function (resultData)
	        {
	        	var processedVals = [];
	        	
	        	for(var i = 0; i < resultData.features.length; i++)
        		{
	        		var feature = resultData.features[i];
	        		var value = feature.properties[attribute];
	        		
	        		if(!processedVals.includes(value))
	        		{
	        			processedVals.push(value);
	        			
		        		choiceId++;
		        		choicesIds.push(choiceId);
	
		        		$("#dropdownOptionsPanel").append('<div id="' + choiceId + '_choice" class="row"><div class="col s5 input-field"><input id="' + choiceId + '_dropdownValue" type="text"><label for="' + choiceId + '_dropdownValue">Value</label></div><div class="col s5 input-field"><input id="' + choiceId + '_dropdownTitle" type="text"><label for="' + choiceId + '_dropdownTitle">Description Text</label></div><div class="col s2"><a class="btn-floating btn-large waves-effect waves-light nrpp-blue-dark" onclick="removeChoice(' + choiceId + ');"><i class="material-icons left">delete_forever</i></a></div></div>');
		        		
		        		$("#" + choiceId + "_dropdownValue").val(feature.properties[attribute]);
		        		$("#" + choiceId + "_dropdownTitle").val(feature.properties[attribute]);
        			}
        		}
	        	
	        	Materialize.updateTextFields();
	        }
		});
		
	}
}

var dropdownOptions = [];
var choicesIds = [];
var choiceId;
var currentDropdownId;

function editQueryDropdownOptions(id)
{
	// Build the dropdown csv for the textareas
	$("#dropdownOptionsPanel").empty();
	currentDropdownId = id;
	choicesIds = [];
	choiceId = 0;
	var options = dropdownOptions[id]; // choices array
	
	options.forEach(function (option)
	{
		choiceId++;
		choicesIds.push(choiceId);
		
		$("#dropdownOptionsPanel").append('<div id="' + choiceId + '_choice" class="row"><div class="col s5 input-field"><input id="' + choiceId + '_dropdownValue" type="text"><label for="' + choiceId + '_dropdownValue">Value</label></div><div class="col s5 input-field"><input id="' + choiceId + '_dropdownTitle" type="text"><label for="' + choiceId + '_dropdownTitle">Description Text</label></div><div class="col s2"><a class="btn-floating btn-large waves-effect waves-light nrpp-blue-dark" onclick="removeChoice(' + choiceId + ');"><i class="material-icons left">delete_forever</i></a></div></div>');
		
		$("#" + choiceId + "_dropdownValue").val(option.value);
		$("#" + choiceId + "_dropdownTitle").val(option.title);
	});
	
	Materialize.updateTextFields();
	
	// and finally, open the modal
	$("#queryDropdownModal").modal('open');
}

function addNewChoice()
{
	choiceId++;
	choicesIds.push(choiceId);
	
	$("#dropdownOptionsPanel").append('<div id="' + choiceId + '_choice" class="row"><div class="col s5 input-field"><input id="' + choiceId + '_dropdownValue" type="text"><label for="' + choiceId + '_dropdownValue">Value</label></div><div class="col s5 input-field"><input id="' + choiceId + '_dropdownTitle" type="text"><label for="' + choiceId + '_dropdownTitle">Description Text</label></div><div class="col s2"><a class="btn-floating btn-large waves-effect waves-light nrpp-blue-dark" onclick="removeChoice(' + choiceId + ');"><i class="material-icons left">delete_forever</i></a></div></div>');
}

function removeChoice(id)
{

	$("#" + id + "_choice").empty();
	$("#" + id + "_choice").remove();
	
	var idx = choicesIds.indexOf(id);
	if(idx > -1)
	{
		choicesIds.splice(idx, 1)
	}
}

function updateDropdownList()
{
	dropdownOptions[currentDropdownId] = [];
	
	for(var i = 0; i < choicesIds.length; i++)
	{
		var choiceId = choicesIds[i];
		var option = 
		{
			value: $("#" + choiceId + "_dropdownValue").val(),
			title: $("#" + choiceId + "_dropdownTitle").val()
		};
		
		dropdownOptions[currentDropdownId].push(option);
	}
}

function uploadVectorLayer()
{
	var layer =
	{
		type: "vector",
		id: $("#kmlName").val().replace(/\s+/g, '-').toLowerCase(),
	    title: $("#kmlName").val(),
	    isVisible: $("#kmlIsVisible").is(":checked"),
	    isQueryable: $("#kmlQueryable").is(":checked"),
	    opacity: $("#kmlOpacity").val(),
	    attributes: [],
	    useRaw: !$("#kmlClustering").is(":checked"),
		useClustering: $("#kmlClustering").is(":checked"),
		useHeatmap: $("#kmlHeatmapping").is(":checked"),
		dataUrl: $("#vectorUrl").val(),
		style:
		{
			strokeWidth: $("#kmlStrokeWidth").val(),
			strokeStyle: $("#kmlStrokeStyle").val(),
		    strokeColor: $("#kmlStrokeColor").val(),
		    strokeOpacity: $("#kmlStrokeOpacity").val(),
		    fillColor: $("#kmlFillColor").val(),
		    fillOpacity: $("#kmlFillOpacity").val(),
		    markerSize: [$("#kmlMarkerSizeX").val(), $("#kmlMarkerSizeY").val()],
		    markerOffset: [$("#kmlMarkerOffsetX").val(), $("#kmlMarkerOffsetY").val()]
		}
	};

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
	if($("#vectorUrl").val() == null || $("#vectorUrl").val() == "")
	{
		unsavedAttachments.push(
		{
			type: $("#vectorType").val(),
			layer: layer,
			contents: fileContents
		});
		
		// if a marker has been updloaded, set the layer
		
		unsavedAttachments.forEach(function(attch)
		{
			if(attch.type == "marker_upload" && attch.layer == null)
			{
				attch.layer = layer;
				layer.style.markerUrl = "@" +  layer.id + "-marker";
			}
		});
	}

	document.getElementById("layersForm").reset();
}

var dbcSelected = false;
var wmsSelected = false;
var uploadSelected = false;

function selectLayerType(type)
{
	dbcSelected = false;
	wmsSelected = false;
	uploadSelected = false;
	
	if(type == "dbc") dbcSelected = true;
	else if(type == "wms") wmsSelected = true;
	else if(type == "upload") uploadSelected = true;
}

function addSelectedDataLayer()
{
	if(dbcSelected) addSelectedDataBCLayer();
	else if(wmsSelected) addSelectedWmsLayer();
	else if(uploadSelected) uploadVectorLayer();
	
	// clear the File Upload form
	document.getElementById("layersDisplayForm").reset();
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
					isQueryable: true,
					attribution: "",
					metadataUrl: "",
					opacity: 0.65,
					attributes: wmsData.attributes
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
            	if(catalogCompleteItem.mpcmWorkspace == "MPCM_ALL_PUB")
        		{
	            	catalogCompleteItem.isVisible = true;
	            	catalogCompleteItem.isQueryable = true;
	            	
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
        		}
            	else
        		{
            		alert("This layer is flagged as secure, and cannot be added to an SMK Application at this time.");
        		}
            },
            error: function (status)
            {
                // error handler
                Materialize.toast('Error loading MPCM Layer. This layer may be secure and unloadable.', 4000);
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

var defaultFilterOptions = {
	    autoApply: true,
        autoExpand: true,
        counter: true,
        fuzzy: false,
        hideExpandedCounter: true,
        hideExpanders: false,
        highlight: true,
        leavesOnly: false,
        nodata: true,
        mode: "hide"
      };

function dbcTreeFilter()
{
	  var tree = $("#catalog-tree").fancytree('getTree');
	  var match = $("#searchDbcTree").val();
	  var opts = defaultFilterOptions;
	  var n;

	  if(match.length > 2)
	  {
		  n = tree.filterBranches.call(tree, match, opts);
		  $("#btnResetDbcTreeSearch").attr("disabled", false);
		  $("#dbcTreeMatches").text("(" + n + " matches)");
	  }
	  else
	  {
		  $("#catalog-tree").fancytree("getTree").clearFilter();
		  $("#dbcTreeMatches").text("");
	  }
}

function wmsTreeFilter()
{
	  var tree = $("#wms-catalog-tree").fancytree('getTree');
	  var match = $("#searchWmsTree").val();
	  var opts = defaultFilterOptions;
	  var n;

	  if(match.length > 2)
	  {
		  n = tree.filterBranches.call(tree, match, opts);
		  $("#btnResetWmsTreeSearch").attr("disabled", false);
		  $("#wmsTreeMatches").text("(" + n + " matches)");
	  }
	  else
	  {
		  $("#wms-catalog-tree").fancytree("getTree").clearFilter();
		  $("#wmsTreeMatches").text("");
	  }
}

function layerTreeFilter()
{
	  var tree = $("#layer-tree").fancytree('getTree');
	  var match = $("#searchLayerTree").val();
	  var opts = defaultFilterOptions;
	  var n;

	  n = tree.filterBranches.call(tree, match, opts);
	  $("#btnResetLayerTreeSearch").attr("disabled", false);
	  $("#layerTreeMatches").text("(" + n + " matches)");
}

function loadCatalogLayers()
{
	// setup catalog layers
	var catalogTreeSource = [];

	$("#catalog-tree").fancytree({
		extensions: ["filter"],
		quicksearch: true,
		filter: {
			autoApply: true,
	        autoExpand: true,
	        counter: true,
	        fuzzy: false,
	        hideExpandedCounter: true,
	        hideExpanders: false,
	        highlight: true,
	        leavesOnly: false,
	        nodata: true,
	        mode: "hide"
	      },
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
	  
	  $("#btnResetDbcTreeSearch").click(function(e)
	  {
	      $("#searchDbcTree").val("");
	      $("#dbcTreeMatches").text("");
	      $("#catalog-tree").fancytree("getTree").clearFilter();
	      $("#btnResetDbcTreeSearch").attr("disabled", true);
	  }).attr("disabled", true);

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
            Materialize.toast('Error loading DataBC Layer catalog. Please try again later. Error: ' + status.responseText, 10000);
            console.log('Error loading DataBC Layer catalog. Error: ' + status.responseText);
        }
	});
}

function loadWmsLayers()
{
	$("#wmsPanelLoading").show();
	$("#wmsRefreshButton").hide();
	$("#wmsPanel").hide();

	var catalogTreeSource = [];

	$("#wms-catalog-tree").fancytree({
		extensions: ["filter"],
		quicksearch: true,
		filter: {
			autoApply: true,
	        autoExpand: true,
	        counter: true,
	        fuzzy: false,
	        hideExpandedCounter: true,
	        hideExpanders: false,
	        highlight: true,
	        leavesOnly: false,
	        nodata: true,
	        mode: "hide"
	      },
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

	$("#btnResetWmsTreeSearch").click(function(e)
	{
	    $("#searchWmsTree").val("");
	    $("#wmsTreeMatches").text("");
	    $("#wms-catalog-tree").fancytree("getTree").clearFilter();
	    $("#btnResetWmsTreeSearch").attr("disabled", true);
	}).attr("disabled", true);
	
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
        	$("#wmsRefreshButton").show();
        	$("#wmsPanel").show();
        },
        error: function (status)
        {
            // error handler
            Materialize.toast('Error loading GetCapabilities from ' + wmsUrl + '. Please try again later. Error: ' + status.responseText, 10000);
            console.log('Error loading GetCapabilities from ' + wmsUrl + '. Error: ' + status.responseText);
            $("#wmsPanelLoading").hide();
            $("#wmsRefreshButton").show();
        	$("#wmsPanel").show();
        }
	});
}

function loadConfigs()
{
	// clear the tables
	$("#appsTable > tbody").html("");
	$("#publishedAppsTable > tbody").html("");
	$("#attributePanel").empty();
	$("#queriesTable tr").remove();

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
        success: function (resultData)
        {
        	// finished building table
        	$("#loadingBar").hide();
        	$("#appsTablePanel").show();

        	resultData.forEach(function(appConfigStub)
        	{
        		if(appConfigStub.valid)
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
	                    	if($("#" + appConfig.lmfId).length == 0) 
	                    	{
	                    		mapConfigs.push(appConfig);
	                    		$("#appsTable > tbody:last-child").append("<tr id='" + appConfig.lmfId + "\'><td><a href='#' onclick='previewMapConfig(\"" + appConfig.lmfId + "\");' class='blue-text'>" + appConfig.name + "</a></td><td>" + appConfig.viewer.type + "</td><td>" + appConfig.lmfRevision + "." + (parseInt(appConfig._rev.split('-')[0]) - 1) + "</td><td><a href='#' onclick='editMapConfig(\"" + appConfig.lmfId + "\");' class='blue-text'>Edit</a></td><td><a href='#' onclick='publishMapConfig(\"" + appConfig.lmfId + "\");' class='blue-text'>Publish</a></td><td><a href='#' onclick='deleteMapConfig(\"" + appConfig.lmfId + "\");' class='blue-text'>Delete</a></td></tr>");
	                    	}
	                    },
	                    error: function (status)
	                    {
	                        // error handler
	                        Materialize.toast('Error loading application ' + appConfigStub.id + 'Error: ' + status.responseText, 10000);
	                        console.log('Error loading application ' + appConfigStub.id + '. Error: ' + status.responseText);
	                    }
	    			});
        		}
        		else
    			{
        			$("#appsTable > tbody:last-child").append("<tr id='" + appConfigStub.id + "\'><td>" + appConfigStub.name + " (Invalid Config)</a></td><td>---</td><td>---</td><td></td><td></td><td></td></tr>");
        		}
        	});
        },
        error: function (status)
        {
            // error handler
            Materialize.toast('Error loading applications. Please try again later. Error: ' + status.responseText, 10000);
            console.log('Error loading applications. Error: ' + status.responseText);
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
                		$("#publishedAppsTable > tbody:last-child").append("<tr id='" + appConfig.lmfId + "\-pub'><td><a href='#' onclick='previewPublishedMapConfig(\"" + appConfig.lmfId + "\");' class='blue-text'>" + appConfig.name + "</a></td><td>" + appConfig.viewer.type + "</td><td>" + appConfig.lmfRevision + "." + (parseInt(appConfig._rev.split('-')[0]) - 1) + "</td><td><a href='#' onclick='unPublishMapConfig(\"" + appConfig.lmfId + "\");' class='blue-text'>Un-Publish</a></td><td><a href='" + serviceUrl + "MapConfigurations/Published/" + appConfig.lmfId + "/Export/' download='smk_client.zip' class='blue-text'>Export</a></td></tr>");
                    },
                    error: function (status)
                    {
                        Materialize.toast('Error loading published application ' + appConfigStub.id + 'Error: ' + status.responseText, 10000);
                        console.log('Error loading published applications. Error: ' + status.responseText);
                    }
    			});
        	});
        },
        error: function (status)
        {
            Materialize.toast('Error loading published applications. Please try again later. Error: ' + status.responseText, 10000);
            console.log('Error loading published applications. Error: ' + status.responseText);
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

	// set basemap
	basemapViewerMap = L.map('basemapViewer');
		basemapViewerMap.on('moveend', function()
		{
			if(editMode)
			{
				var bounds = basemapViewerMap.getBounds();

				if(bounds.getWest() != bounds.getEast() && bounds.getNorth() != bounds.getSouth())
				{
					data.viewer.location.extent[0] = bounds.getWest();
					data.viewer.location.extent[1] = bounds.getNorth();
					data.viewer.location.extent[2] = bounds.getEast();
					data.viewer.location.extent[3] = bounds.getSouth();
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
		extensions: ["filter"],
		quicksearch: true,
		filter: {
			autoApply: true,
	        autoExpand: true,
	        counter: true,
	        fuzzy: false,
	        hideExpandedCounter: true,
	        hideExpanders: false,
	        highlight: true,
	        leavesOnly: false,
	        nodata: true,
	        mode: "hide"
	      },
	    checkbox: true,
	    selectMode: 3,
	    source: [],
	    activate: function(event, data)
	    {
	    },
	    select: function(event, data)
	    {
	    }
	  });

	$("#btnResetLayerTreeSearch").click(function(e)
    {
        $("#searchLayerTree").val("");
        $("#layerTreeMatches").text("");
        $("#layer-tree").fancytree("getTree").clearFilter();
        $("#btnResetLayerTreeSearch").attr("disabled", true);
    }).attr("disabled", true);
	
	$('ul.tabs').tabs();
	$('ul.tabs').tabs('select_tab', 'editCopyMaps');

	loadConfigs();
	loadCatalogLayers();

	//init the file upload components
	document.getElementById('vectorFileUpload').addEventListener('change', readFile, false);
	//document.getElementById('headerImageFileUpload').addEventListener('change', readHeaderFile, false);
	document.getElementById('replaceVectorFileUpload').addEventListener('change', readFile, false);
	document.getElementById('customMarkerFileUploadUpdate').addEventListener('change', readMarkerFile, false);
	document.getElementById('customMarkerFileUploadNew').addEventListener('change', readMarkerFile, false);
	
	// init modals
	$('.modal').modal();
	$('#attributesModal').modal({ dismissible: false });
	$('#queriesModal').modal({ dismissible: false });
	$('#queryDropdownModal').modal(
	{
		dismissible: false,
	    complete: function() 
	    { 
	    	updateDropdownList();
	    }
	});
	$('#layerPopupTemplateModal').modal({ dismissible: false });

});

var fileContents;
var unsavedAttachments = [];

//function readHeaderFile(e)
//{
//	readFile(e);
//
//	unsavedAttachments.push(
//	{
//		type: "header_upload",
//		contents: fileContents
//	});
//}

function readMarkerFile(e)
{
	readFile(e);

	var reader = new FileReader();

	reader.onload = function(re)
	{
		unsavedAttachments.push(
		{
			type: "marker_upload",
			layer: selectedLayerNode != null ? selectedLayerNode.data : {},
			contents: re.target.result
		});
		fileContents = null;
		selectedLayerNode.data.style.markerUrl = "@" + selectedLayerNode.data.id + "-marker";
	};

	reader.readAsDataURL(fileContents);
}

function readFile(e)
{
	fileContents = null;

	var file = e.target.files[0];

	if (!file)
	{
	    return;
	}

	fileContents = file;
	
	if(file.type == "application/vnd.google-earth.kml+xml")
	{
		// get style info via omnivore
		var reader = new FileReader();

		reader.onload = function(e)
		{
			parseKmlLayerStyle(e.target.result);
		};

		reader.readAsText(fileContents);
	}
}

function uuid()
{
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c)
	{
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}
