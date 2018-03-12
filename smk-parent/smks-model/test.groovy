#!/usr/bin/env groovy -cp src/main/groovy

@Grapes( [
    @GrabResolver( name='libs-release', root='http://apps.vividsolutions.com/artifactory/libs-release/', m2compatible='true' ),
    @GrabResolver( name='libs-snapshot', root='http://apps.vividsolutions.com/artifactory/libs-snapshot/', m2compatible='true' ),
    @GrabResolver( name='plugins-release', root='http://apps.vividsolutions.com/artifactory/plugins-release/', m2compatible='true' ),

    @Grab( group='ca.bc.gov.databc', module='smks-model',  version='1.0.x-SNAPSHOT' )
] )

import ca.bc.gov.databc.smks.model.MapConfiguration
import ca.bc.gov.databc.smks.model.Tool
import ca.bc.gov.databc.smks.model.layer.EsriDynamic
import ca.bc.gov.databc.smks.model.layer.Folder
import ca.bc.gov.databc.smks.model.layer.Geojson
import ca.bc.gov.databc.smks.model.layer.Group
import ca.bc.gov.databc.smks.model.layer.Kml
import ca.bc.gov.databc.smks.model.layer.Wms

import com.fasterxml.jackson.databind.ObjectMapper

MapConfiguration resource = new MapConfiguration()

resource.getTools().add( Tool.Type.pan.create() )
resource.getTools().add( Tool.Type.measure.create() )
resource.getTools().add( Tool.Type.scale.create() )
resource.getTools().add( Tool.Type.coordinate.create() )
resource.getTools().add( Tool.Type.minimap.create() )
resource.getTools().add( Tool.Type.markup.create() )
resource.getTools().add( Tool.Type.directions.create() )
resource.getTools().add( Tool.Type.attribution.create() )
resource.getTools().add( Tool.Type.zoom.create() )
resource.getTools().add( Tool.Type.sidebar.create() )
resource.getTools().add( Tool.Type.about.create() )
resource.getTools().add( Tool.Type.baseMaps.create() )
resource.getTools().add( Tool.Type.layers.create() )
resource.getTools().add( Tool.Type.identify.create() )
resource.getTools().add( Tool.Type.select.create() )

resource.getLayers().add( new EsriDynamic() )
resource.getLayers().add( new Folder() )
resource.getLayers().add( new Geojson() )
resource.getLayers().add( new Group() )
resource.getLayers().add( new Kml() )
resource.getLayers().add( new Wms() )



// println resource.dump()

ObjectMapper mapper = new ObjectMapper()
String json = mapper.writeValueAsString(resource)
println json
println ''

MapConfiguration out = mapper.readValue( json, MapConfiguration.class )

println out.dump()
println ''

println mapper.writeValueAsString(out)
