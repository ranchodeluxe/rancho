(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var MapView = require( './map.js' );
(function( def ) {

    window.App = window.App || {};
    window.App = def();

})( function() {

    return {
        MapView : MapView ,
    }

});

},{"./map.js":2}],2:[function(require,module,exports){
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
            /*
            this.$wgs_label.toggleClass('active');
            this.$wgs_label.toggle();
            this.$proj_label.toggleClass('active');
            this.$proj_label.toggle();
            */
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




},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlcy9tYWluLmpzIiwiZXhhbXBsZXMvbWFwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIE1hcFZpZXcgPSByZXF1aXJlKCAnLi9tYXAuanMnICk7XG4oZnVuY3Rpb24oIGRlZiApIHtcblxuICAgIHdpbmRvdy5BcHAgPSB3aW5kb3cuQXBwIHx8IHt9O1xuICAgIHdpbmRvdy5BcHAgPSBkZWYoKTtcblxufSkoIGZ1bmN0aW9uKCkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgTWFwVmlldyA6IE1hcFZpZXcgLFxuICAgIH1cblxufSk7XG4iLCIvKlxuKipcbioqICBjb25zdHJ1Y3RvclxuKipcbiovXG52YXIgTWFwVmlldyA9IFJhbmNoby5BYnN0cmFjdENvbnRyb2xsZXIuZXh0ZW5kKHtcbiAgICAgXG4gICAgICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnaW5pdGlhbGl6ZScgKTtcbiAgICAgICAgICAgIHRoaXMuc2V0dXAoKTtcbiAgICAgICAgfSAsXG4gICAgICAgIG9uX2luaXRpYWxpemUgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyggJ29uX2luaXRpYWxpemUnICk7XG4gICAgICAgICAgICB0aGlzLmJpbmRfZXZlbnRfc3Vic2NyaWJlcnMoKTsgICAgXG4gICAgICAgIH0gLFxufSk7XG5cblxuLypcbioqXG4qKiAgbWVtYmVyc1xuKipcbiovXG5NYXBWaWV3LnByb3RvdHlwZS5kZWZhdWx0X29wdGlvbnMgPSB7XG5cbiAgICBtYXBfZWxlbWVudCA6ICdtYXAnICxcbiAgICByc2lkZWJhcl9lbGVtZW50IDogJ3JzaWRlYmFyJyAsXG4gICAgbWFwIDogbnVsbCAsIC8vIG9iamVjdCByZWZcbiAgICByc2lkZWJhciA6IG51bGwgLCAvLyBvYmplY3RfcmVmXG4gICAgY3Jvc3NoYWlyX2ljb24gOiBudWxsICwgLy8gb2JqZWN0X3JlZlxuICAgIGNyb3NzaGFpciA6IG51bGwgLCAvLyBvYmplY3QgcmVmXG4gICAgY3VycmVudG1vdXNlIDogTC5sYXRMbmcoMCwwKSAsXG4gICAgY3VycmVudHByb2ogOiBcIjM4NTdcIiAsXG4gICAgcHJvamRlZnMgOiB7XCI0MzI2XCI6TC5DUlMuRVBTRzQzMjYsIFwiMzg1N1wiOkwuQ1JTLkVQU0czODU3fSAsXG4gICAgcHJvajRkZWZzIDogbnVsbCAsXG5cbiAgICBcbiAgICAvLyBlbGVtZW50IHNlbGVjdG9yc1xuICAgIGluZm9fdG9nZ2xlX3NlbGVjdG9yIDogJyNpbmZvLXRvZ2dsZS1idXR0b24nICxcbiAgICB3Z3NfbGFiZWxfc2VsZWN0b3IgOiAnI3dnc2xhYmVsJyAsXG4gICAgcHJval9sYWJlbF9zZWxlY3RvciA6ICcjcHJvamxhYmVsJyAsXG4gICAgd2dzX2Nvb3Jkc19zZWxlY3RvciA6ICcjd2dzY29vcmRzJyAsXG4gICAgcHJval9jb29yZHNfc2VsZWN0b3IgOiAnI3Byb2pjb29yZHMnICxcbiAgICB0aWxlbGV2ZWxfc2VsZWN0b3IgOiAnLnRpbGVsZXZlbCcgLFxuICAgIGluZm9fc2VsZWN0b3IgOiAnI2luZm8nICxcbiAgICB6b29tbGV2ZWxfc2VsZWN0b3IgOiAnLnpvb21sZXZlbCcgLFxuICAgIG1vdXNlX3Bvc2l0aW9uX3NlbGVjdG9yIDogJyNtb3VzZXBvcycgLFxuICAgIG1vdXNlX3Bvc2l0aW9uX21lcmNfc2VsZWN0b3IgOiAnI21vdXNlcG9zbWVyYycgLFxuICAgIG1hcGJvdW5kc19zZWxlY3RvciA6ICcjbWFwYm91bmRzJyAsXG4gICAgbWFwYm91bmRzX21lcmNfc2VsZWN0b3IgOiAnI21hcGJvdW5kc21lcmMnICxcbiAgICBjZW50ZXJfc2VsZWN0b3IgOiAnI2NlbnRlcicgLFxuICAgIGNlbnRlcl9tZXJjX3NlbGVjdG9yIDogJyNjZW50ZXJtZXJjJyAsIFxuXG59O1xuXG5cblxuTWFwVmlldy5wcm90b3R5cGUuYmluZF9ldmVudF9zdWJzY3JpYmVycyA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCAnYmluZF9ldmVuX3N1YnNjcmliZXJzJyApO1xuXG4gICAgLy8gaW5mbyB0b2dnbGVcbiAgICB0aGlzLiRpbmZvX3RvZ2dsZS5jbGljayggZnVuY3Rpb24oKXtcbiAgICAgICAgLy90aGlzLiR3Z3NfbGFiZWwuZmFkZVRvZ2dsZSgyMDApO1xuICAgICAgICAvL3RoaXMuJHByb2pfbGFiZWwuZmFkZVRvZ2dsZSgyMDApO1xuICAgICAgICB0aGlzLiRpbmZvLmRlbGF5KDMwMCkuc2xpZGVUb2dnbGUoMjAwKTtcblxuICAgICAgICB2YXIgYnV0dG9uVGV4dCA9IHRoaXMuJGluZm9fdG9nZ2xlLnRleHQoKTtcbiAgICAgICAgaWYgKCAvaGlkZS9pLnRlc3QoIGJ1dHRvblRleHQgKSApIHtcbiAgICAgICAgICAgIHRoaXMuJGluZm9fdG9nZ2xlLnRleHQoJ1Nob3cgUGFuZWxzJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiRpbmZvX3RvZ2dsZS50ZXh0KCdIaWRlIFBhbmVscycpO1xuICAgICAgICB9XG4gICAgfS5iaW5kKCB0aGlzICkgKTtcblxuICAgIHZhciBhY3RpdmF0ZV9jYiA9IGZ1bmN0aW9uKCBlICkge1xuICAgICAgICBhY3RpdmUgPSAkKCBlLnRhcmdldCApLmhhc0NsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgaWYoIGFjdGl2ZSApe1xuICAgICAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIHRoaXMuJHdnc19sYWJlbC50b2dnbGVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICB0aGlzLiR3Z3NfbGFiZWwudG9nZ2xlKCk7XG4gICAgICAgICAgICB0aGlzLiRwcm9qX2xhYmVsLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgIHRoaXMuJHByb2pfbGFiZWwudG9nZ2xlKCk7XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy4kd2dzX2xhYmVsLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgIHRoaXMuJHByb2pfbGFiZWwudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBwYW5lbCB0b2dnbGVzXG4gICAgdGhpcy4kcHJval9sYWJlbC5jbGljayggYWN0aXZhdGVfY2IuYmluZCggdGhpcyApICk7XG4gICAgdGhpcy4kd2dzX2xhYmVsLmNsaWNrKCBhY3RpdmF0ZV9jYi5iaW5kKCB0aGlzICkgKTtcblxuXG4gICAgLy8gaGFuZGxlIG1vdXNlIG1vdmVzXG4gICAgdGhpcy5tYXAub24oICdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHRoaXMuY3VycmVudG1vdXNlLmxhdCA9IGUubGF0bG5nLmxhdDtcbiAgICAgICAgdGhpcy5jdXJyZW50bW91c2UubG5nID0gZS5sYXRsbmcubG5nO1xuICAgICAgICB0aGlzLiR0aWxlbGV2ZWwudGV4dCggdGhpcy5mb3JtYXRfdGlsZShlLmxhdGxuZywgdGhpcy5tYXAuZ2V0Wm9vbSgpKSApO1xuICAgICAgICB0aGlzLiRtb3VzZV9wb3NpdGlvbi50ZXh0KCB0aGlzLmZvcm1hdF9wb2ludChlLmxhdGxuZywnNDMyNicpICk7XG4gICAgICAgIHRoaXMuJG1vdXNlX3Bvc2l0aW9uX21lcmMudGV4dCggdGhpcy5mb3JtYXRfcG9pbnQoZS5sYXRsbmcsIHRoaXMuY3VycmVudHByb2opICk7XG4gICAgICAgIHRoaXMuJG1hcGJvdW5kcy50ZXh0KCB0aGlzLmZvcm1hdF9ib3VuZHMoIHRoaXMubWFwLmdldEJvdW5kcygpLCc0MzI2JykgKTtcbiAgICAgICAgdGhpcy4kbWFwYm91bmRzX21lcmMudGV4dCggdGhpcy5mb3JtYXRfYm91bmRzKCB0aGlzLm1hcC5nZXRCb3VuZHMoKSwgdGhpcy5jdXJyZW50cHJvaikgKTtcbiAgICAgICAgdGhpcy4kY2VudGVyLnRleHQoIHRoaXMuZm9ybWF0X3BvaW50KCB0aGlzLm1hcC5nZXRDZW50ZXIoKSwnNDMyNicpICk7XG4gICAgICAgIHRoaXMuJGNlbnRlcl9tZXJjLnRleHQoIHRoaXMuZm9ybWF0X3BvaW50KCB0aGlzLm1hcC5nZXRDZW50ZXIoKSwgdGhpcy5jdXJyZW50cHJvaikgKTtcbiAgICB9LmJpbmQoIHRoaXMgKSApO1xuXG4gICAgdGhpcy5tYXAub24oICd6b29tZW5kJywgZnVuY3Rpb24oZSkge1xuICAgICAgICB0aGlzLiR0aWxlbGV2ZWwudGV4dCggdGhpcy5mb3JtYXRfdGlsZSggdGhpcy5jdXJyZW50bW91c2UsIHRoaXMubWFwLmdldFpvb20oKSApICk7XG4gICAgICAgIHRoaXMuJHpvb21sZXZlbC50ZXh0KCB0aGlzLm1hcC5nZXRab29tKCkudG9TdHJpbmcoKSApO1xuICAgICAgICB0aGlzLiRtYXBib3VuZHMudGV4dCggdGhpcy5mb3JtYXRfYm91bmRzKCB0aGlzLm1hcC5nZXRCb3VuZHMoKSwnNDMyNicpICk7XG4gICAgICAgIHRoaXMuJG1hcGJvdW5kc19tZXJjLnRleHQoIHRoaXMuZm9ybWF0X2JvdW5kcyggdGhpcy5tYXAuZ2V0Qm91bmRzKCksIHRoaXMuY3VycmVudHByb2opICk7XG4gICAgfS5iaW5kKCB0aGlzICkgKTtcblxufTtcblxuTWFwVmlldy5wcm90b3R5cGUuYWRkX3NpZGViYXIgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB0aGlzLnJzaWRlYmFyID0gTC5jb250cm9sLnNpZGViYXIoIHRoaXMucnNpZGViYXJfZWxlbWVudCwge1xuICAgICAgICBwb3NpdGlvbjogJ3JpZ2h0JyxcbiAgICAgICAgY2xvc2VCdXR0b246IHRydWVcbiAgICB9KTtcbiAgICB0aGlzLm1hcC5hZGRDb250cm9sKCB0aGlzLnJzaWRlYmFyICk7XG5cbn07XG5cbk1hcFZpZXcucHJvdG90eXBlLmFkZF9jcm9zc2hhaXIgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB0aGlzLmNyb3NzaGFpcl9pY29uID0gTC5pY29uKHtcbiAgICAgICAgaWNvblVybDogJy9leGFtcGxlcy9jcm9zc2hhaXIucG5nJyxcbiAgICAgICAgaWNvblNpemU6ICAgICBbMjAsIDIwXSwgLy8gc2l6ZSBvZiB0aGUgaWNvblxuICAgICAgICBpY29uQW5jaG9yOiAgIFsxMCwgMTBdLCAvLyBwb2ludCBvZiB0aGUgaWNvbiB3aGljaCB3aWxsIGNvcnJlc3BvbmQgdG8gbWFya2VyJ3MgbG9jYXRpb25cbiAgICB9KTtcbiAgICB0aGlzLmNyb3NzaGFpciA9IG5ldyBMLm1hcmtlciggdGhpcy5tYXAuZ2V0Q2VudGVyKCksIHtpY29uOiB0aGlzLmNyb3NzaGFpcl9pY29uLCBjbGlja2FibGU6ZmFsc2V9ICk7XG4gICAgdGhpcy5jcm9zc2hhaXIuYWRkVG8oIHRoaXMubWFwICk7XG4gICAgdGhpcy5tYXAub24oICdtb3ZlJywgZnVuY3Rpb24oZSkge1xuICAgICAgICB0aGlzLmNyb3NzaGFpci5zZXRMYXRMbmcoIHRoaXMubWFwLmdldENlbnRlcigpICk7XG4gICAgfS5iaW5kKCB0aGlzICkgKTtcblxufTtcblxuTWFwVmlldy5wcm90b3R5cGUuc2V0dXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coICdzZXR1cCcgKTtcblxuICAgIHRoaXMubWFwID0gTC5tYXAoIHRoaXMubWFwX2VsZW1lbnQgKS5zZXRWaWV3KFs0Ny41ODk4NDEsIC0xMjIuMzE5MjAyXSwgMTIpO1xuICAgIEwudGlsZUxheWVyKCdodHRwOi8ve3N9LnRpbGVzLm1hcGJveC5jb20vdjMvc3BhdGlhbGRldi5tYXAtYzl6MmN5ZWYve3p9L3t4fS97eX0ucG5nJykuYWRkVG8oIHRoaXMubWFwICk7XG5cbiAgICAvLyBhZGQgdGhlIHNpZGViYXJcbiAgICB0aGlzLmFkZF9zaWRlYmFyKCk7XG5cbiAgICAvLyBhZGQgdGhlIGNyb3NzaGFpclxuICAgIHRoaXMuYWRkX2Nyb3NzaGFpcigpO1xuXG4gICAgXG59O1xuXG5cblxuTWFwVmlldy5wcm90b3R5cGUuYWRkX2xheWVyID0gZnVuY3Rpb24oIGxheWVyLCBuYW1lLCB0aXRsZSwgekluZGV4LCBvbiApIHtcbiAgICBpZiAob24pIHtcbiAgICAgICAgbGF5ZXIuc2V0WkluZGV4KHpJbmRleCkuYWRkVG8obWFwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsYXllci5zZXRaSW5kZXgoekluZGV4KTtcbiAgICB9XG4gICAgLy8gQ3JlYXRlIGEgc2ltcGxlIGxheWVyIHN3aXRjaGVyIHRoYXQgdG9nZ2xlcyBsYXllcnMgb24gYW5kIG9mZi5cbiAgICB2YXIgdWkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFwLXVpJyk7XG4gICAgdmFyIGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgIHZhciBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIGxpbmsuaHJlZiA9ICcjJztcbiAgICBpZiAob24pIHtcbiAgICAgICAgbGluay5jbGFzc05hbWUgPSAnZW5hYmxlZCc7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGluay5jbGFzc05hbWUgPSAnJztcbiAgICB9XG4gICAgbGluay5pbm5lckhUTUwgPSBuYW1lO1xuICAgIGxpbmsudGl0bGUgPSB0aXRsZTtcbiAgICBsaW5rLm9uY2xpY2sgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBpZiAobWFwLmhhc0xheWVyKGxheWVyKSkge1xuICAgICAgICAgICAgbWFwLnJlbW92ZUxheWVyKGxheWVyKTtcbiAgICAgICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtYXAuYWRkTGF5ZXIobGF5ZXIpO1xuICAgICAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnZW5hYmxlZCc7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGl0ZW0uYXBwZW5kQ2hpbGQobGluayk7XG4gICAgdWkuYXBwZW5kQ2hpbGQoaXRlbSk7XG59O1xuXG5cbk1hcFZpZXcucHJvdG90eXBlLmZvcm1hdF9ib3VuZHMgPSBmdW5jdGlvbiggYm91bmRzLCBwcm9qICkge1xuXG4gICAgLy92YXIgZ2RhbCA9ICQoXCJpbnB1dFtuYW1lPSdnZGFsLWNoZWNrYm94J11cIikucHJvcCgnY2hlY2tlZCcpO1xuICAgIC8vdmFyIGxuZ0xhdCA9ICQoXCJpbnB1dFtuYW1lPSdjb29yZC1vcmRlciddXCIpLnByb3AoJ2NoZWNrZWQnKTtcbiAgICB2YXIgZ2RhbCA9IHRydWU7XG4gICAgdmFyIGxuZ0xhdCA9IHRydWU7XG5cbiAgICB2YXIgZm9ybWF0dGVkQm91bmRzID0gJyc7XG4gICAgdmFyIHNvdXRod2VzdCA9IGJvdW5kcy5nZXRTb3V0aFdlc3QoKTtcbiAgICB2YXIgbm9ydGhlYXN0ID0gYm91bmRzLmdldE5vcnRoRWFzdCgpO1xuICAgIHZhciB4bWluID0gMDtcbiAgICB2YXIgeW1pbiA9IDA7XG4gICAgdmFyIHhtYXggPSAwO1xuICAgIHZhciB5bWF4ID0gMDtcbiAgICBpZiAocHJvaiA9PSAnNDMyNicpIHtcbiAgICAgICAgeG1pbiA9IHNvdXRod2VzdC5sbmcudG9GaXhlZCg2KTtcbiAgICAgICAgeW1pbiA9IHNvdXRod2VzdC5sYXQudG9GaXhlZCg2KTtcbiAgICAgICAgeG1heCA9IG5vcnRoZWFzdC5sbmcudG9GaXhlZCg2KTtcbiAgICAgICAgeW1heCA9IG5vcnRoZWFzdC5sYXQudG9GaXhlZCg2KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcHJval90b191c2UgPSBudWxsO1xuICAgICAgICBpZiAodHlwZW9mKCB0aGlzLnByb2pkZWZzW3Byb2pdICkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAvLyB3ZSBoYXZlIGl0IGFscmVhZHksIHRoZW4gZ3JhYiBpdCBhbmQgdXNlIGl0Li4uXG4gICAgICAgICAgICBwcm9qX3RvX3VzZSA9IHRoaXMucHJvamRlZnNbcHJval07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBXZSBoYXZlIG5vdCB1c2VkIHRoaXMgb25lIHlldC4uLiBtYWtlIGl0IGFuZCBzdG9yZSBpdC4uLlxuICAgICAgICAgICAgdGhpcy5wcm9qZGVmc1twcm9qXSA9IG5ldyBMLlByb2ouQ1JTKHByb2osIHRoaXMucHJvajRkZWZzW3Byb2pdWzFdKTtcbiAgICAgICAgICAgIHByb2pfdG9fdXNlID0gdGhpcy5wcm9qZGVmc1twcm9qXTtcbiAgICAgICAgfVxuICAgICAgICBzb3V0aHdlc3QgPSBwcm9qX3RvX3VzZS5wcm9qZWN0KHNvdXRod2VzdClcbiAgICAgICAgbm9ydGhlYXN0ID0gcHJval90b191c2UucHJvamVjdChub3J0aGVhc3QpXG4gICAgICAgIHhtaW4gPSBzb3V0aHdlc3QueC50b0ZpeGVkKDQpO1xuICAgICAgICB5bWluID0gc291dGh3ZXN0LnkudG9GaXhlZCg0KTtcbiAgICAgICAgeG1heCA9IG5vcnRoZWFzdC54LnRvRml4ZWQoNCk7XG4gICAgICAgIHltYXggPSBub3J0aGVhc3QueS50b0ZpeGVkKDQpO1xuICAgIH1cblxuICAgIGlmIChnZGFsKSB7XG4gICAgICAgIGlmIChsbmdMYXQpIHtcbiAgICAgICAgICAgIGZvcm1hdHRlZEJvdW5kcyA9IHhtaW4rJywnK3ltaW4rJywnK3htYXgrJywnK3ltYXg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3JtYXR0ZWRCb3VuZHMgPSB5bWluKycsJyt4bWluKycsJyt5bWF4KycsJyt4bWF4O1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGxuZ0xhdCkge1xuICAgICAgICAgICAgZm9ybWF0dGVkQm91bmRzID0geG1pbisnICcreW1pbisnICcreG1heCsnICcreW1heDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvcm1hdHRlZEJvdW5kcyA9IHltaW4rJyAnK3htaW4rJyAnK3ltYXgrJyAnK3htYXg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZvcm1hdHRlZEJvdW5kc1xufTtcblxuTWFwVmlldy5wcm90b3R5cGUuZm9ybWF0X3RpbGUgPSBmdW5jdGlvbiggcG9pbnQsIHpvb20gKSB7XG4gICAgdmFyIHhUaWxlID0gTWF0aC5mbG9vcigocG9pbnQubG5nKzE4MCkvMzYwKk1hdGgucG93KDIsem9vbSkpO1xuICAgIHZhciB5VGlsZSA9IE1hdGguZmxvb3IoKDEtTWF0aC5sb2coTWF0aC50YW4ocG9pbnQubGF0Kk1hdGguUEkvMTgwKSArIDEvTWF0aC5jb3MocG9pbnQubGF0Kk1hdGguUEkvMTgwKSkvTWF0aC5QSSkvMiAqTWF0aC5wb3coMix6b29tKSk7XG4gICAgcmV0dXJuIHhUaWxlLnRvU3RyaW5nKCkgKyAnLCcgKyB5VGlsZS50b1N0cmluZygpO1xufTtcblxuTWFwVmlldy5wcm90b3R5cGUuZm9ybWF0X3BvaW50ID0gZnVuY3Rpb24oIHBvaW50LCBwcm9qICkge1xuXG4gICAgLy92YXIgZ2RhbCA9ICQoXCJpbnB1dFtuYW1lPSdnZGFsLWNoZWNrYm94J11cIikucHJvcCgnY2hlY2tlZCcpO1xuICAgIC8vdmFyIGxuZ0xhdCA9ICQoXCJpbnB1dFtuYW1lPSdjb29yZC1vcmRlciddXCIpLnByb3AoJ2NoZWNrZWQnKTtcbiAgICB2YXIgZ2RhbCA9IHRydWU7XG4gICAgdmFyIGxuZ0xhdCA9IHRydWU7XG4gICAgXG5cbiAgICB2YXIgZm9ybWF0dGVkUG9pbnQgPSAnJztcbiAgICBpZiAocHJvaiA9PSAnNDMyNicpIHtcbiAgICAgICAgeCA9IHBvaW50LmxuZy50b0ZpeGVkKDYpO1xuICAgICAgICB5ID0gcG9pbnQubGF0LnRvRml4ZWQoNik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHByb2pfdG9fdXNlID0gbnVsbDtcbiAgICAgICAgaWYgKHR5cGVvZiggdGhpcy5wcm9qZGVmc1twcm9qXSApICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgLy8gd2UgaGF2ZSBpdCBhbHJlYWR5LCB0aGVuIGdyYWIgaXQgYW5kIHVzZSBpdC4uLlxuICAgICAgICAgICAgcHJval90b191c2UgPSB0aGlzLnByb2pkZWZzW3Byb2pdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gV2UgaGF2ZSBub3QgdXNlZCB0aGlzIG9uZSB5ZXQuLi4gbWFrZSBpdCBhbmQgc3RvcmUgaXQuLi5cbiAgICAgICAgICAgIHRoaXMucHJvamRlZnNbcHJval0gPSBuZXcgTC5Qcm9qLkNSUyhwcm9qLCB0aGlzLnByb2o0ZGVmc1twcm9qXVsxXSk7XG4gICAgICAgICAgICBwcm9qX3RvX3VzZSA9IHRoaXMucHJvamRlZnNbcHJval07XG4gICAgICAgIH1cbiAgICAgICAgcG9pbnQgPSBwcm9qX3RvX3VzZS5wcm9qZWN0KHBvaW50KVxuICAgICAgICB4ID0gcG9pbnQueC50b0ZpeGVkKDQpO1xuICAgICAgICB5ID0gcG9pbnQueS50b0ZpeGVkKDQpO1xuICAgIH1cbiAgICBpZiAoZ2RhbCkge1xuICAgICAgICBpZiAobG5nTGF0KSB7XG4gICAgICAgICAgICBmb3JtYXR0ZWRCb3VuZHMgPSB4KycsJyt5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9ybWF0dGVkQm91bmRzID0geSsnLCcreDtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChsbmdMYXQpIHtcbiAgICAgICAgICAgIGZvcm1hdHRlZEJvdW5kcyA9IHgrJyAnK3k7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3JtYXR0ZWRCb3VuZHMgPSB5KycgJyt4O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmb3JtYXR0ZWRCb3VuZHNcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBNYXBWaWV3O1xuXG5cblxuIl19
