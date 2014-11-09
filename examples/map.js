/*
**
**  constructor
**
*/
var MapView = Rancho.AbstractController.extend({
     
        initialize : function() {
            console.log( 'initialize' );
            this.setup();
        } ,
        on_initialize : function () {
            console.log( 'on_initialize' );
            this.bind_event_subscribers();    
        } ,
});


/*
**
**  members
**
*/
MapView.prototype.default_options = {

    map_element : 'map' ,
    rsidebar_element : 'rsidebar' ,
    map : null , // object ref
    rsidebar : null , // object_ref
    crosshair_icon : null , // object_ref
    crosshair : null , // object ref
    currentmouse : L.latLng(0,0) ,
    currentproj : "3857" ,
    projdefs : {"4326":L.CRS.EPSG4326, "3857":L.CRS.EPSG3857} ,
    proj4defs : null ,

    
    // element selectors
    info_toggle_selector : '#info-toggle-button' ,
    wgs_label_selector : '#wgslabel' ,
    proj_label_selector : '#projlabel' ,
    wgs_coords_selector : '#wgscoords' ,
    proj_coords_selector : '#projcoords' ,
    tilelevel_selector : '.tilelevel' ,
    info_selector : '#info' ,
    zoomlevel_selector : '.zoomlevel' ,
    mouse_position_selector : '#mousepos' ,
    mouse_position_merc_selector : '#mouseposmerc' ,
    mapbounds_selector : '#mapbounds' ,
    mapbounds_merc_selector : '#mapboundsmerc' ,
    center_selector : '#center' ,
    center_merc_selector : '#centermerc' , 

};



MapView.prototype.bind_event_subscribers = function() {
    console.log( 'bind_even_subscribers' );

    // info toggle
    this.$info_toggle.click( function(){
        //this.$wgs_label.fadeToggle(200);
        //this.$proj_label.fadeToggle(200);
        this.$info.delay(300).slideToggle(200);

        var buttonText = this.$info_toggle.text();
        if ( /hide/i.test( buttonText ) ) {
            this.$info_toggle.text('Show Panels');
        } else {
            this.$info_toggle.text('Hide Panels');
        }
    }.bind( this ) );

    var activate_cb = function( e ) {
        active = $( e.target ).hasClass('active');
        if( active ){
            // do nothing
        } else {
            this.$wgs_label.toggleClass('active');
            this.$proj_label.toggleClass('active');
        }
    };
    // panel toggles
    this.$proj_label.click( activate_cb.bind( this ) );
    this.$wgs_label.click( activate_cb.bind( this ) );


    // handle mouse moves
    this.map.on( 'mousemove', function(e) {
        this.currentmouse.lat = e.latlng.lat;
        this.currentmouse.lng = e.latlng.lng;
        this.$tilelevel.text( this.format_tile(e.latlng, this.map.getZoom()) );
        this.$mouse_position.text( this.format_point(e.latlng,'4326') );
        this.$mouse_position_merc.text( this.format_point(e.latlng, this.currentproj) );
        this.$mapbounds.text( this.format_bounds( this.map.getBounds(),'4326') );
        this.$mapbounds_merc.text( this.format_bounds( this.map.getBounds(), this.currentproj) );
        this.$center.text( this.format_point( this.map.getCenter(),'4326') );
        this.$center_merc.text( this.format_point( this.map.getCenter(), this.currentproj) );
    }.bind( this ) );

    this.map.on( 'zoomend', function(e) {
        this.$tilelevel.text( this.format_tile( this.currentmouse, this.map.getZoom() ) );
        this.$zoomlevel.text( this.map.getZoom().toString() );
        this.$mapbounds.text( this.format_bounds( this.map.getBounds(),'4326') );
        this.$mapbounds_merc.text( this.format_bounds( this.map.getBounds(), this.currentproj) );
    }.bind( this ) );

};

MapView.prototype.add_sidebar = function () {

    this.rsidebar = L.control.sidebar( this.rsidebar_element, {
        position: 'right',
        closeButton: true
    });
    this.map.addControl( this.rsidebar );

};

MapView.prototype.add_crosshair = function () {

    this.crosshair_icon = L.icon({
        iconUrl: '/examples/crosshair.png',
        iconSize:     [20, 20], // size of the icon
        iconAnchor:   [10, 10], // point of the icon which will correspond to marker's location
    });
    this.crosshair = new L.marker( this.map.getCenter(), {icon: this.crosshair_icon, clickable:false} );
    this.crosshair.addTo( this.map );
    this.map.on( 'move', function(e) {
        this.crosshair.setLatLng( this.map.getCenter() );
    }.bind( this ) );

};

MapView.prototype.setup = function () {
    console.log( 'setup' );

    this.map = L.map( this.map_element ).setView([47.589841, -122.319202], 12);
    L.tileLayer('http://{s}.tiles.mapbox.com/v3/spatialdev.map-c9z2cyef/{z}/{x}/{y}.png').addTo( this.map );

    // add the sidebar
    this.add_sidebar();

    // add the crosshair
    this.add_crosshair();

    
};



MapView.prototype.add_layer = function( layer, name, title, zIndex, on ) {
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


MapView.prototype.format_bounds = function( bounds, proj ) {

    //var gdal = $("input[name='gdal-checkbox']").prop('checked');
    //var lngLat = $("input[name='coord-order']").prop('checked');
    var gdal = true;
    var lngLat = true;

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
        if (typeof( this.projdefs[proj] ) !== 'undefined') {
            // we have it already, then grab it and use it...
            proj_to_use = this.projdefs[proj];
        } else {
            // We have not used this one yet... make it and store it...
            this.projdefs[proj] = new L.Proj.CRS(proj, this.proj4defs[proj][1]);
            proj_to_use = this.projdefs[proj];
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
};

MapView.prototype.format_tile = function( point, zoom ) {
    var xTile = Math.floor((point.lng+180)/360*Math.pow(2,zoom));
    var yTile = Math.floor((1-Math.log(Math.tan(point.lat*Math.PI/180) + 1/Math.cos(point.lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom));
    return xTile.toString() + ',' + yTile.toString();
};

MapView.prototype.format_point = function( point, proj ) {

    //var gdal = $("input[name='gdal-checkbox']").prop('checked');
    //var lngLat = $("input[name='coord-order']").prop('checked');
    var gdal = true;
    var lngLat = true;
    

    var formattedPoint = '';
    if (proj == '4326') {
        x = point.lng.toFixed(6);
        y = point.lat.toFixed(6);
    } else {
        var proj_to_use = null;
        if (typeof( this.projdefs[proj] ) !== 'undefined') {
            // we have it already, then grab it and use it...
            proj_to_use = this.projdefs[proj];
        } else {
            // We have not used this one yet... make it and store it...
            this.projdefs[proj] = new L.Proj.CRS(proj, this.proj4defs[proj][1]);
            proj_to_use = this.projdefs[proj];
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
};


module.exports = MapView;



