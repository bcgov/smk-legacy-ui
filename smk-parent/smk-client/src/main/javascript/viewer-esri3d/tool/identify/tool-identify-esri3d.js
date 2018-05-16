include.module( 'tool-identify-esri3d', [ 'esri3d', 'types-esri3d', 'util-esri3d', 'tool-identify', 'feature-list-esri3d' ], function ( inc ) {

    var E = SMK.TYPE.Esri3d

    SMK.TYPE.IdentifyTool.prototype.styleFeature = function ( override ) {
        // var self = this
        // return function () {
            return Object.assign( {
                strokeColor:    'black',
                strokeWidth:    8,
                strokeOpacity:  0.8,
                fillColor:      'white',
                fillOpacity:    0.5,
            }, this.style, override )
        // }
    }

    SMK.TYPE.IdentifyTool.prototype.afterInitialize.push( inc[ 'feature-list-esri3d' ] )

    SMK.TYPE.IdentifyTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        this.identifyLayer = new E.layers.GraphicsLayer( { visible: false } )
        smk.$viewer.map.add( this.identifyLayer )

        this.changedActive( function () {
            self.identifyLayer.visible = self.active
        } )

        this.hasPickPriority = function ( toolIdSet, ev ) {

            console.log( ev )

            return !toolIdSet.location
        }

        smk.$viewer.startedIdentify( function ( ev ) {
            self.identifyLayer.removeAll()
            self.clickLocation = new E.Graphic( {
                geometry: { type: 'point', latitude: ev.location.latitude, longitude: ev.location.longitude },
            } )
        } )

        smk.$viewer.finishedIdentify( function ( ev ) {
            var stat = smk.$viewer.identified.getStats()

            self.clickLocation.symbol = {
                type: 'point-3d',
                symbolLayers: [
                    {
                        type: 'text',
                        material: {
                            color: 'black'
                        },
                        size: 9,
                        text: stat.featureCount,
                    },
                    {
                        type:       'icon',
                        size:       '30px',
                        anchor:     'center',
                        material: {
                            color: [ 0, 0, 0, .2 ]
                        },
                        resource: {
                            primitive: 'circle'
                        },
                    },
                    {
                        type:       'icon',
                        size:       '25px',
                        anchor:     'center',
                        material: {
                            color: 'white'
                        },
                        resource: {
                            primitive: 'circle'
                        },
                    }
                ]
            }

            self.identifyLayer.add( self.clickLocation )
        } )

        smk.$viewer.changedPopup( function ( ev ) {
            self.identifyLayer.visible = !ev.visible
        } )

    } )

} )
