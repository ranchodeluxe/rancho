var map, rsidebar, lsidebar, drawControl, drawnItems = null;
var proj4defs = null;
var projdefs = {"4326":L.CRS.EPSG4326, "3857":L.CRS.EPSG3857};
var currentproj = "3857";
var currentmouse = L.latLng(0,0);

/*
**
**  override L.Rectangle 
**  to fire an event after setting
**
**  the base parent object L.Path
**  includes the L.Mixin.Events
**
**  ensures bbox box is always
**  the topmost SVG feature
**
*/
L.Rectangle.prototype.setBounds = function (latLngBounds) {

    this.setLatLngs(this._boundsToLatLngs(latLngBounds));
    this.fire( 'bounds-set' );
}


var FormatSniffer = (function () {  // execute immediately

    'use strict';

    /*
    **
    **  constructor
    **
    */
    var FormatSniffer = function( options ) {

        options || ( options = {} );

        if( !this || !( this instanceof FormatSniffer ) ){
            return new FormatSniffer(options);
        }


        this.regExes = {
            ogrinfoExtent : /Extent\:\s\((.*)\)/ ,
            bbox :  /^\(([\s|\-|0-9]*\.[0-9]*,[\s|\-|0-9]*\.[0-9]*,[\s|\-|0-9]*\.[0-9]*,[\s|\-|0-9]*\.[0-9|\s]*)\)$/
        };
        this.data = options.data || ""; 
        this.parse_type = null; 
    };

    /*
    **
    **  functions
    **
    */
    FormatSniffer.prototype.sniff = function () {
        return this._sniffFormat(); 
    };

    FormatSniffer.prototype._is_ogrinfo = function() {
        var match = this.regExes.ogrinfoExtent.exec( this.data.trim() );
        var extent = [];
        if( match ) {
            var pairs = match[1].split( ") - (" );
            for( var indx = 0; indx < pairs.length; indx ++ ){
                var coords = pairs[ indx ].trim().split(",");
                extent = ( extent.concat(  [ parseFloat(coords[0].trim()), parseFloat(coords[1].trim()) ] ) );
            }
        } 
        this.parse_type = "ogrinfo";
        return extent;
    };

    FormatSniffer.prototype._is_normal_bbox = function() {
        var match = this.regExes.bbox.exec( this.data.trim() );
        var extent = [];
        if( match ) {
            var bbox = match[1].split( "," );
            for( var indx = 0; indx < bbox.length; indx ++ ){
                var coord = bbox[ indx ].trim();
                extent = ( extent.concat(  [ parseFloat(coord) ] ) );
            }
        }
        this.parse_type = "bbox";
        return extent;
    };

    FormatSniffer.prototype._is_geojson = function() {
        try {
            // try JSON
            var json = JSON.parse( this.data );

            // try GeoJSON
            var parsed_data = new L.geoJson( json )

        } catch ( err ) {

            return null;

        }

        this.parse_type = "geojson";
        return parsed_data;
    };

    FormatSniffer.prototype._is_wkt = function() {
        if( this.data === "" ){
            throw new Error( "empty -- nothing to parse" );
        } 

        try {
            var parsed_data = new Wkt.Wkt( this.data );
        } catch ( err ) {
            return null;
        }

        this.parse_type = "wkt";
        return parsed_data;
    };

    FormatSniffer.prototype._sniffFormat = function () {
        
        var parsed_data = null;
        var fail = false;
        try {
            var next = true;

            // try ogrinfo
            parsed_data = this._is_ogrinfo()
            if ( parsed_data.length > 0 ){
               next = false; 
            }

            // try normal bbox 
            if ( next ) {
                parsed_data = this._is_normal_bbox();
                if ( parsed_data.length > 0 ) next = false; 
            }

            // try GeoJSON
            if ( next ) {
                parsed_data = this._is_geojson();
                if ( parsed_data )  next = false;
            }

            // try WKT
            if ( next ) {
                parsed_data = this._is_wkt();
                if ( parsed_data ) next = false;
            }

            // no matches, throw error
            if ( next ) {
                fail = true;
/* 
**  sorry, this block needs to be left aligned
**  to make the alert more readable
**  which means, we probably shouldn't use alerts ;-)
*/ 
throw {
"name" :  "NoTypeMatchError" ,
"message" : "The data is not a recognized format:\n \
1. ogrinfo extent output\n \
2. bbox as (xMin,yMin,xMax,yMax )\n \
3. GeoJSON\n \
4. WKT\n\n "
}
            }
           

        } catch(err) {

            alert( "Your paste is not parsable:\n"  + err.message  );
            fail = true;

        }

        // delegate to format handler
        if ( !fail ){

            this._formatHandler[ this.parse_type ].call( this._formatHandler, parsed_data );

        } 
        
        return ( fail ? false : true );
    };


    /*
    **  an object with functions as property names.
    **  if we need to add another format
    **  we can do so here as a property name
    **  to enforce reusability
    **
    **  to add different formats as L.FeatureGroup layer 
    **  so they work with L.Draw edit and delete options
    **  we fake passing event information
    **  and triggering draw:created for L.Draw
    */
    FormatSniffer.prototype._formatHandler = {


            // coerce event objects to work with L.Draw types
            coerce : function ( lyr, type_obj ) {

                    var event_obj = {
                        layer : lyr,
                        layerType : null,
                    } 

                    // coerce to L.Draw types
                    if ( /point/i.test( type_obj ) ){
                        event_obj.layerType = "marker";
                    }
                    else if( /linestring/i.test( type_obj ) ){
                        event_obj.layerType = "polyline";
                    }
                    else if ( /polygon/i.test( type_obj ) ){
                        event_obj.layerType = "polygon";
                    }
    
                    return event_obj;

            } ,

        reduce_layers : function( lyr ) {
            var lyr_parts = []; 
                if (  typeof lyr[ 'getLayers' ] === 'undefined' ) {  
            return [ lyr ];
            } 
            else {
            var all_layers = lyr.getLayers();
            for( var i = 0; i < all_layers.length; i++ ){
                lyr_parts = lyr_parts.concat( this.reduce_layers( all_layers[i] ) );    
            }
            }
            return lyr_parts;
        } ,

            get_leaflet_bounds : function( data ) {
                    /*
                    **  data comes in an extent ( xMin,yMin,xMax,yMax )
                    **  we need to swap lat/lng positions
                    **  because leaflet likes it hard
                    */
                    var sw = [ data[1], data[0] ];
                    var ne = [ data[3], data[2] ];
                    return new L.LatLngBounds( sw, ne );
            } ,

            wkt : function( data ) {

                    var wkt_layer = data.construct[data.type].call( data );
                    var all_layers = this.reduce_layers( wkt_layer );
                    for( var indx = 0; indx < all_layers.length; indx++ ) { 
                        var lyr = all_layers[indx];
                        var evt = this.coerce( lyr, data.type );

                        // call L.Draw.Feature.prototype._fireCreatedEvent
                        map.fire( 'draw:created', evt );
                    }

            } ,

            geojson : function( geojson_layer ) {

                    var all_layers = this.reduce_layers( geojson_layer );
                    for( var indx = 0; indx < all_layers.length; indx++ ) { 
                        var lyr = all_layers[indx];

                        var geom_type = geojson_layer.getLayers()[0].feature.geometry.type;
                        var evt = this.coerce( lyr, geom_type );

                        // call L.Draw.Feature.prototype._fireCreatedEvent
                        map.fire( 'draw:created', evt );
                    }
            } ,

            ogrinfo : function( data ) {
                    var lBounds = this.get_leaflet_bounds( data );
                    // create a rectangle layer
                    var lyr = new L.Rectangle( lBounds );    
                    var evt = this.coerce( lyr, 'polygon' );

                    // call L.Draw.Feature.prototype._fireCreatedEvent
                    map.fire( 'draw:created', evt );
            } ,

            bbox : function( data ) {
                    var lBounds = this.get_leaflet_bounds( data );
                    // create a rectangle layer
                    var lyr = new L.Rectangle( lBounds );    
                    var evt = this.coerce( lyr, 'polygon' );

                    // call L.Draw.Feature.prototype._fireCreatedEvent
                    map.fire( 'draw:created', evt );
            }
        

    };

    return FormatSniffer; // return class def

})(); // end FormatSniffer


function addLayer(layer, name, title, zIndex, on) {
    if (on) {
        layer.setZIndex(zIndex).addTo(map);
    } else {
        layer.setZIndex(zIndex);
    }
    // Create a simple layer switcher that toggles layers on and off.
    var ui = document.getElementById('map-ui');
    var item = document.createElement('li');
    var link = document.createElement('a');
    link.href = '#';
    if (on) {
        link.className = 'enabled';
    } else {
        link.className = '';
    }
    link.innerHTML = name;
    link.title = title;
    link.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
            this.className = '';
        } else {
            map.addLayer(layer);
            this.className = 'enabled';
        }
    };
    item.appendChild(link);
    ui.appendChild(item);
};

function formatBounds(bounds, proj) {
    var gdal = $("input[name='gdal-checkbox']").prop('checked');
    var lngLat = $("input[name='coord-order']").prop('checked');

    var formattedBounds = '';
    var southwest = bounds.getSouthWest();
    var northeast = bounds.getNorthEast();
    var xmin = 0;
    var ymin = 0;
    var xmax = 0;
    var ymax = 0;   
    if (proj == '4326') {
        xmin = southwest.lng.toFixed(6);
        ymin = southwest.lat.toFixed(6);
        xmax = northeast.lng.toFixed(6);
        ymax = northeast.lat.toFixed(6);
    } else {
        var proj_to_use = null;
        if (typeof(projdefs[proj]) !== 'undefined') {
            // we have it already, then grab it and use it...
            proj_to_use = projdefs[proj];
        } else {
            // We have not used this one yet... make it and store it...
            projdefs[proj] = new L.Proj.CRS(proj, proj4defs[proj][1]);
            proj_to_use = projdefs[proj];
        }
        southwest = proj_to_use.project(southwest)
        northeast = proj_to_use.project(northeast)
        xmin = southwest.x.toFixed(4);
        ymin = southwest.y.toFixed(4);
        xmax = northeast.x.toFixed(4);
        ymax = northeast.y.toFixed(4);
    }

    if (gdal) {
        if (lngLat) {
            formattedBounds = xmin+','+ymin+','+xmax+','+ymax;
        } else {
            formattedBounds = ymin+','+xmin+','+ymax+','+xmax;
        }
    } else {
        if (lngLat) {
            formattedBounds = xmin+' '+ymin+' '+xmax+' '+ymax;
        } else {
            formattedBounds = ymin+' '+xmin+' '+ymax+' '+xmax;
        }
    }
    return formattedBounds
}

function formatTile(point,zoom) {
    var xTile = Math.floor((point.lng+180)/360*Math.pow(2,zoom));
    var yTile = Math.floor((1-Math.log(Math.tan(point.lat*Math.PI/180) + 1/Math.cos(point.lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom));
    return xTile.toString() + ',' + yTile.toString();
}

function formatPoint(point, proj) {
    var gdal = $("input[name='gdal-checkbox']").prop('checked');
    var lngLat = $("input[name='coord-order']").prop('checked');

    var formattedPoint = '';
    if (proj == '4326') {
        x = point.lng.toFixed(6);
        y = point.lat.toFixed(6);
    } else {
        var proj_to_use = null;
        if (typeof(projdefs[proj]) !== 'undefined') {
            // we have it already, then grab it and use it...
            proj_to_use = projdefs[proj];
        } else {
            // We have not used this one yet... make it and store it...
            projdefs[proj] = new L.Proj.CRS(proj, proj4defs[proj][1]);
            proj_to_use = projdefs[proj];
        }
        point = proj_to_use.project(point)
        x = point.x.toFixed(4);
        y = point.y.toFixed(4);
    }
    if (gdal) {
        if (lngLat) {
            formattedBounds = x+','+y;
        } else {
            formattedBounds = y+','+x;
        }
    } else {
        if (lngLat) {
            formattedBounds = x+' '+y;
        } else {
            formattedBounds = y+' '+x;
        }
    }
    return formattedBounds
}

$(document).ready(function() {

    //47.589841 -122.319202
    var map = L.map('map').setView([47.589841, -122.319202], 12);
    L.tileLayer('http://{s}.tiles.mapbox.com/v3/spatialdev.map-c9z2cyef/{z}/{x}/{y}.png').addTo(map);


    rsidebar = L.control.sidebar('rsidebar', {
        position: 'right',
        closeButton: true
    });
    rsidebar.on( "sidebar-show", function(e){
        $("#map .leaflet-tile-loaded").addClass( "blurred" );
    });
    rsidebar.on( "sidebar-hide", function(e){
        $('#map .leaflet-tile-loaded').removeClass('blurred');
        $('#map .leaflet-tile-loaded').addClass('unblurred');
        setTimeout( function(){
            $('#map .leaflet-tile-loaded').removeClass('unblurred');
        },7000);
    });
    map.addControl(rsidebar);

    
    // Add in a crosshair for the map
    var crosshairIcon = L.icon({
        iconUrl: '/examples/crosshair.png',
        iconSize:     [20, 20], // size of the icon
        iconAnchor:   [10, 10], // point of the icon which will correspond to marker's location
    });
    crosshair = new L.marker(map.getCenter(), {icon: crosshairIcon, clickable:false});
    crosshair.addTo(map);
    map.on('move', function(e) {
        crosshair.setLatLng(map.getCenter());
    });

    map.on('mousemove', function(e) {
        currentmouse.lat = e.latlng.lat;
        currentmouse.lng = e.latlng.lng;
        $('.tilelevel').text(formatTile(e.latlng,map.getZoom()));
        $('#mousepos').text(formatPoint(e.latlng,'4326'));
        $('#mouseposmerc').text(formatPoint(e.latlng,currentproj));
        $('#mapbounds').text(formatBounds(map.getBounds(),'4326'));
        $('#mapboundsmerc').text(formatBounds(map.getBounds(),currentproj));
        $('#center').text(formatPoint(map.getCenter(),'4326'));
        $('#centermerc').text(formatPoint(map.getCenter(),currentproj));
    });
    map.on('zoomend', function(e) {
        $('.tilelevel').text(formatTile(currentmouse,map.getZoom()));
        $('.zoomlevel').text(map.getZoom().toString());
        $('#mapbounds').text(formatBounds(map.getBounds(),'4326'));
        $('#mapboundsmerc').text(formatBounds(map.getBounds(),currentproj));
    });



    // toggle #info-box
    $('#info-toggle-button').click(function(){
        $('#wgslabel, #projlabel').fadeToggle(200);
        $('#info').delay(300).slideToggle(200);
        
        
        var buttonText = $('#info-toggle-button').text();
        if (buttonText == 'Hide Coordinates') {
            $('#info-toggle-button').text('Show Coordinates');
        } else {
            $('#info-toggle-button').text('Hide Coordinates');
        }
    });

    // toggle coordinate tabs
    $('#wgslabel, #projlabel').click(function(){
        active = $(this).hasClass('active');
        if(active){
            //do nothing
        } else {
            $('#wgslabel, #projlabel').toggleClass('active');
            $('#wgscoords, #projcoords').toggle();
        }
        
        
    });


});


