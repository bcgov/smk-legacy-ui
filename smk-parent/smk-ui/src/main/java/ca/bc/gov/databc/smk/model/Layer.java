package ca.bc.gov.databc.smk.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

@JsonSerialize(include=JsonSerialize.Inclusion.NON_NULL)
@JsonIgnoreProperties({"layerTypeCode"})
public class Layer 
{
	public enum LayerTypes { folder, group, wmsLayer, featureLayer, dynamicServiceLayer, kmlLayer, jsonLayer };
	
	private Integer id;
	private Integer mpcmId;
	private String mpcmWorkspace;
	private String label;
	private String metadataUrl;
	private boolean isVisible;
	private Boolean isSelectable;
	private Boolean isExportable;
	private String attribution;
	private String type;
	private List<Layer> sublayers; // for group and folder objects
	private List<Attribute> attributes; // for a layer
	private String serviceUrl; // also used as path for KML and JSON
	private String wmsVersion;
	private String wmsStyle;
	private List<String> layers;
	private List<String> dynamicLayers;
	private String format;
	private Double opacity;
	private Boolean isTransparent;
	private Double strokeWidth;
	private String strokeStyle;
	private String strokeColor;
	private Double strokeOpacity;
	private String fillColor;
	private Double fillOpacity;
	private String markerSymbolPath;
	private Double minScale;
	private Double maxScale;
	private boolean useClustering;
	private boolean useHeatmapping;
	
	public Layer()
	{
	}

	public Integer getId() 
	{
		return id;
	}

	public void setId(Integer id) 
	{
		this.id = id;
	}

	public String getLabel() 
	{
		return label;
	}

	public void setLabel(String label) 
	{
		this.label = label;
	}
	
	public boolean getIsVisible() 
	{
		return isVisible;
	}

	public void setIsVisible(boolean isVisible) 
	{
		this.isVisible = isVisible;
	}

	public Boolean getIsSelectable() 
	{
		return isSelectable;
	}

	public void setIsSelectable(Boolean isSelectable) 
	{
		this.isSelectable = isSelectable;
	}

	public Boolean getIsExportable() 
	{
		return isExportable;
	}

	public void setIsExportable(Boolean isExportable) 
	{
		this.isExportable = isExportable;
	}

	public String getAttribution() 
	{
		return attribution;
	}

	public void setAttribution(String attribution) 
	{
		this.attribution = attribution;
	}

	public String getType() 
	{
		return type;
	}

	public void setType(String layerType) 
	{
		this.type = layerType;
	}

	public LayerTypes getLayerTypeCode() 
	{
		if(type.equals("folder")) return LayerTypes.folder;
		else if(type.equals("groupLayer")) return LayerTypes.group;
		else if(type.equals("wmsLayer")) return LayerTypes.wmsLayer;
		else if(type.equals("featureLayer")) return LayerTypes.featureLayer;
		else if(type.equals("dynamicServiceLayer")) return LayerTypes.dynamicServiceLayer;
		else if(type.equals("kmlLayer")) return LayerTypes.kmlLayer;
		else return LayerTypes.jsonLayer;
	}
	
	public void setLayerTypeCode(LayerTypes layerType) 
	{
		if(layerType == LayerTypes.folder) this.type = "folder";
		else if(layerType == LayerTypes.group) this.type = "groupLayer";
		else if(layerType == LayerTypes.wmsLayer) this.type = "wmsLayer";
		else if(layerType == LayerTypes.featureLayer) this.type = "featureLayer";
		else if(layerType == LayerTypes.dynamicServiceLayer) this.type = "dynamicServiceLayer";
		else if(layerType == LayerTypes.kmlLayer) this.type = "kmlLayer";
		else this.type = "jsonLayer";
		
	}
	
	public String getServiceUrl() 
	{
		return serviceUrl;
	}

	public void setServiceUrl(String serviceUrl) 
	{
		this.serviceUrl = serviceUrl;
	}

	public List<String> getLayers() 
	{
		if(layers == null) layers = new ArrayList<String>();
		return layers;
	}

	public void setLayers(List<String> layers) 
	{
		this.layers = layers;
	}

	public List<String> getDynamicLayers() 
	{
		if(dynamicLayers == null) dynamicLayers = new ArrayList<String>();
		return dynamicLayers;
	}

	public void setDynamicLayers(List<String> dynamicLayers) 
	{
		this.dynamicLayers = dynamicLayers;
	}

	public String getFormat() 
	{
		return format;
	}

	public void setFormat(String format) 
	{
		this.format = format;
	}

	public Double getOpacity() 
	{
		return opacity;
	}

	public void setOpacity(Double opacity) 
	{
		this.opacity = opacity;
	}

	public Boolean getIsTransparent() 
	{
		return isTransparent;
	}

	public void setIsTransparent(Boolean isTransparent) 
	{
		this.isTransparent = isTransparent;
	}

	public Double getStrokeWidth() 
	{
		return strokeWidth;
	}

	public void setStrokeWidth(Double strokeWidth) 
	{
		this.strokeWidth = strokeWidth;
	}

	public String getStrokeStyle() 
	{
		return strokeStyle;
	}

	public void setStrokeStyle(String strokeStyle) 
	{
		this.strokeStyle = strokeStyle;
	}

	public String getStrokeColor() 
	{
		return strokeColor;
	}

	public void setStrokeColor(String strokeColor) 
	{
		this.strokeColor = strokeColor;
	}

	public Double getStrokeOpacity() 
	{
		return strokeOpacity;
	}

	public void setStrokeOpacity(Double strokeOpacity) 
	{
		this.strokeOpacity = strokeOpacity;
	}

	public String getFillColor() 
	{
		return fillColor;
	}

	public void setFillColor(String fillColor) 
	{
		this.fillColor = fillColor;
	}

	public Double getFillOpacity() 
	{
		return fillOpacity;
	}

	public void setFillOpacity(Double fillOpacity)
	{
		this.fillOpacity = fillOpacity;
	}

	public String getMarkerSymbolPath() 
	{
		return markerSymbolPath;
	}

	public void setMarkerSymbolPath(String markerSymbolPath) 
	{
		this.markerSymbolPath = markerSymbolPath;
	}

	public Integer getMpcmId() 
	{
		return mpcmId;
	}

	public void setMpcmId(Integer mpcmId) 
	{
		this.mpcmId = mpcmId;
	}

	public String getMpcmWorkspace() 
	{
		return mpcmWorkspace;
	}

	public void setMpcmWorkspace(String mpcmWorkspace) 
	{
		this.mpcmWorkspace = mpcmWorkspace;
	}

	public Double getMinScale() 
	{
		return minScale;
	}

	public void setMinScale(Double minScale) 
	{
		this.minScale = minScale;
	}

	public Double getMaxScale() 
	{
		return maxScale;
	}

	public void setMaxScale(Double maxScale) 
	{
		this.maxScale = maxScale;
	}

	public String getMetadataUrl() 
	{
		return metadataUrl;
	}

	public void setMetadataUrl(String metadataUrl) 
	{
		this.metadataUrl = metadataUrl;
	}

	public List<Layer> getSublayers() 
	{
		if(sublayers == null) sublayers = new ArrayList<Layer>();
		return sublayers;
	}

	public void setSublayers(List<Layer> sublayers) 
	{
		this.sublayers = sublayers;
	}

	public String getWmsVersion() 
	{
		return wmsVersion;
	}

	public void setWmsVersion(String wmsVersion) 
	{
		this.wmsVersion = wmsVersion;
	}

	public String getWmsStyle() 
	{
		return wmsStyle;
	}

	public void setWmsStyle(String wmsStyle) 
	{
		this.wmsStyle = wmsStyle;
	}

	@Override
	public String toString() 
	{
		return this.getLabel();
	}

	public boolean getUseClustering() 
	{
		return useClustering;
	}

	public void setUseClustering(boolean useClustering) 
	{
		this.useClustering = useClustering;
	}

	public boolean getUseHeatmapping() 
	{
		return useHeatmapping;
	}

	public void setUseHeatmapping(boolean useHeatmapping) 
	{
		this.useHeatmapping = useHeatmapping;
	}

	public List<Attribute> getAttributes() 
	{
		if(attributes == null) attributes = new ArrayList<Attribute>();
		return attributes;
	}

	public void setAttributes(List<Attribute> attributes) 
	{
		this.attributes = attributes;
	}
}
