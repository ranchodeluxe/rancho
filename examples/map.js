var Rancho = require('../src/rancho.js' );


/*
**
**  constructor
**
*/
var MapView = Rancho.AbstractController.extend({
     
        initialize : function() {
            this.setup();
        } ,
        on_initialize : function () {
            this.bind_event_subscribers();    
            this.render();    
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
    rsidebar : null ,
    crosshair_icon : null ,
    crosshair : null , // object ref
    
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

    // templates
    info_box_selector: '#info-box' ,
    info_box_template:  _.template( $( '#info-box-template' ).html() ) ,

};



MapView.prototype.bind_event_subscribers = function() {

    // info toggle
    this.$info_toggle.click(function(){
        this.$wgs_label.fadeToggle(200);
        this.$proj_label.fadeToggle(200);
        this.$info.delay(300).slideToggle(200);

        var buttonText = this$info_toggle.text();
        if ( /hide/i.test( buttonText ) ) {
            this.$info_toggle.text('Show Panels');
        } else {
            this.$info_toggle.text('Hide Panels');
        }
    });

    var activate_cb = function( e ) {
        active = $( e.target ).hasClass('active');
        if(active){
            //do nothing
        } else {
            this.$wgs_label.toggleClass('active');
            this.$wgs_label.toggle();
            this.$proj_label.toggleClass('active');
            this.$proj_label.toggle();
        }
    };
    // panel toggles
    this.$proj_label.click( activate_cb );
    this.$wgs_label.click( activate_cb );


    // handle mouse moves
    this.map.on('mousemove', function(e) {
        currentmouse.lat = e.latlng.lat;
        currentmouse.lng = e.latlng.lng;
        this.$tilelevel.text( this.format_tile(e.latlng, this.map.getZoom()) );
        this.$mouse_position.text( this.format_point(e.latlng,'4326') );
        this.$mouse_position_merc.text( this.format_point(e.latlng,currentproj) );
        this.$mapbounds.text( this.format_bounds( this.map.getBounds(),'4326') );
        this.$mapbounds_merc.text( this.format_bounds( this.map.getBounds(),currentproj) );
        this.$center.text( this.format_point( this.map.getCenter(),'4326') );
        this.$center_merc.text( this.format_point( this.map.getCenter(),currentproj) );
    });

    this.map.on('zoomend', function(e) {
        this.$tilelevel.text( this.format_tile(currentmouse, this.map.getZoom()) );
        this.$zoomlevel.text( this.map.getZoom().toString() );
        this.$mapbounds.text( this.format_bounds( this.map.getBounds(),'4326') );
        this.$mapbounds_merc.text( this.format_bounds( this.map.getBounds(),currentproj) );
    });

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
    this.map.on('move', function(e) {
        this.crosshair.setLatLng( this.map.getCenter() );
    });


};

MapView.prototype.setup = function () {

    this.map = L.map('map').setView([47.589841, -122.319202], 12);
    L.tileLayer('http://{s}.tiles.mapbox.com/v3/spatialdev.map-c9z2cyef/{z}/{x}/{y}.png').addTo(map);

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
};

MapView.prototype.format_tile = function( point, zoom ) {
    var xTile = Math.floor((point.lng+180)/360*Math.pow(2,zoom));
    var yTile = Math.floor((1-Math.log(Math.tan(point.lat*Math.PI/180) + 1/Math.cos(point.lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom));
    return xTile.toString() + ',' + yTile.toString();
};

MapView.prototype.render = function() {
    this.$info_box.append( this.info_box_template( {} ) );
};


MapView.prototype.format_point = function( point, proj ) {

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
};


module.exports = MapView;



