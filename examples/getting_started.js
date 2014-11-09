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
    console.log( 'bind_even_subscribers' );

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
    console.log( 'setup' );

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




},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlcy9tYWluLmpzIiwiZXhhbXBsZXMvbWFwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgTWFwVmlldyA9IHJlcXVpcmUoICcuL21hcC5qcycgKTtcblxuKGZ1bmN0aW9uKCBkZWYgKSB7XG5cbiAgICB3aW5kb3cuQXBwID0gd2luZG93LkFwcCB8fCB7fTtcbiAgICB3aW5kb3cuQXBwID0gZGVmKCk7XG5cbn0pKCBmdW5jdGlvbigpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIE1hcFZpZXcgOiBNYXBWaWV3ICxcbiAgICB9XG5cbn0pO1xuIiwiLypcbioqXG4qKiAgY29uc3RydWN0b3JcbioqXG4qL1xudmFyIE1hcFZpZXcgPSBSYW5jaG8uQWJzdHJhY3RDb250cm9sbGVyLmV4dGVuZCh7XG4gICAgIFxuICAgICAgICBpbml0aWFsaXplIDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyggJ2luaXRpYWxpemUnICk7XG4gICAgICAgICAgICB0aGlzLnNldHVwKCk7XG4gICAgICAgIH0gLFxuICAgICAgICBvbl9pbml0aWFsaXplIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coICdvbl9pbml0aWFsaXplJyApO1xuICAgICAgICAgICAgdGhpcy5iaW5kX2V2ZW50X3N1YnNjcmliZXJzKCk7ICAgIFxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTsgICAgXG4gICAgICAgIH0gLFxufSk7XG5cblxuLypcbioqXG4qKiAgbWVtYmVyc1xuKipcbiovXG5NYXBWaWV3LnByb3RvdHlwZS5kZWZhdWx0X29wdGlvbnMgPSB7XG5cbiAgICBtYXBfZWxlbWVudCA6ICdtYXAnICxcbiAgICByc2lkZWJhcl9lbGVtZW50IDogJ3JzaWRlYmFyJyAsXG4gICAgbWFwIDogbnVsbCAsIC8vIG9iamVjdCByZWZcbiAgICByc2lkZWJhciA6IG51bGwgLFxuICAgIGNyb3NzaGFpcl9pY29uIDogbnVsbCAsXG4gICAgY3Jvc3NoYWlyIDogbnVsbCAsIC8vIG9iamVjdCByZWZcbiAgICBcbiAgICAvLyBlbGVtZW50IHNlbGVjdG9yc1xuICAgIGluZm9fdG9nZ2xlX3NlbGVjdG9yIDogJyNpbmZvLXRvZ2dsZS1idXR0b24nICxcbiAgICB3Z3NfbGFiZWxfc2VsZWN0b3IgOiAnI3dnc2xhYmVsJyAsXG4gICAgcHJval9sYWJlbF9zZWxlY3RvciA6ICcjcHJvamxhYmVsJyAsXG4gICAgd2dzX2Nvb3Jkc19zZWxlY3RvciA6ICcjd2dzY29vcmRzJyAsXG4gICAgcHJval9jb29yZHNfc2VsZWN0b3IgOiAnI3Byb2pjb29yZHMnICxcbiAgICB0aWxlbGV2ZWxfc2VsZWN0b3IgOiAnLnRpbGVsZXZlbCcgLFxuICAgIGluZm9fc2VsZWN0b3IgOiAnI2luZm8nICxcbiAgICB6b29tbGV2ZWxfc2VsZWN0b3IgOiAnLnpvb21sZXZlbCcgLFxuICAgIG1vdXNlX3Bvc2l0aW9uX3NlbGVjdG9yIDogJyNtb3VzZXBvcycgLFxuICAgIG1vdXNlX3Bvc2l0aW9uX21lcmNfc2VsZWN0b3IgOiAnI21vdXNlcG9zbWVyYycgLFxuICAgIG1hcGJvdW5kc19zZWxlY3RvciA6ICcjbWFwYm91bmRzJyAsXG4gICAgbWFwYm91bmRzX21lcmNfc2VsZWN0b3IgOiAnI21hcGJvdW5kc21lcmMnICxcbiAgICBjZW50ZXJfc2VsZWN0b3IgOiAnI2NlbnRlcicgLFxuICAgIGNlbnRlcl9tZXJjX3NlbGVjdG9yIDogJyNjZW50ZXJtZXJjJyAsIFxuXG4gICAgLy8gdGVtcGxhdGVzXG4gICAgaW5mb19ib3hfc2VsZWN0b3I6ICcjaW5mby1ib3gnICxcbiAgICBpbmZvX2JveF90ZW1wbGF0ZTogIF8udGVtcGxhdGUoICQoICcjaW5mby1ib3gtdGVtcGxhdGUnICkuaHRtbCgpICkgLFxuXG59O1xuXG5cblxuTWFwVmlldy5wcm90b3R5cGUuYmluZF9ldmVudF9zdWJzY3JpYmVycyA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCAnYmluZF9ldmVuX3N1YnNjcmliZXJzJyApO1xuXG4gICAgLy8gaW5mbyB0b2dnbGVcbiAgICB0aGlzLiRpbmZvX3RvZ2dsZS5jbGljayhmdW5jdGlvbigpe1xuICAgICAgICB0aGlzLiR3Z3NfbGFiZWwuZmFkZVRvZ2dsZSgyMDApO1xuICAgICAgICB0aGlzLiRwcm9qX2xhYmVsLmZhZGVUb2dnbGUoMjAwKTtcbiAgICAgICAgdGhpcy4kaW5mby5kZWxheSgzMDApLnNsaWRlVG9nZ2xlKDIwMCk7XG5cbiAgICAgICAgdmFyIGJ1dHRvblRleHQgPSB0aGlzJGluZm9fdG9nZ2xlLnRleHQoKTtcbiAgICAgICAgaWYgKCAvaGlkZS9pLnRlc3QoIGJ1dHRvblRleHQgKSApIHtcbiAgICAgICAgICAgIHRoaXMuJGluZm9fdG9nZ2xlLnRleHQoJ1Nob3cgUGFuZWxzJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiRpbmZvX3RvZ2dsZS50ZXh0KCdIaWRlIFBhbmVscycpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgYWN0aXZhdGVfY2IgPSBmdW5jdGlvbiggZSApIHtcbiAgICAgICAgYWN0aXZlID0gJCggZS50YXJnZXQgKS5oYXNDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIGlmKGFjdGl2ZSl7XG4gICAgICAgICAgICAvL2RvIG5vdGhpbmdcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuJHdnc19sYWJlbC50b2dnbGVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICB0aGlzLiR3Z3NfbGFiZWwudG9nZ2xlKCk7XG4gICAgICAgICAgICB0aGlzLiRwcm9qX2xhYmVsLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgIHRoaXMuJHByb2pfbGFiZWwudG9nZ2xlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIHBhbmVsIHRvZ2dsZXNcbiAgICB0aGlzLiRwcm9qX2xhYmVsLmNsaWNrKCBhY3RpdmF0ZV9jYiApO1xuICAgIHRoaXMuJHdnc19sYWJlbC5jbGljayggYWN0aXZhdGVfY2IgKTtcblxuXG4gICAgLy8gaGFuZGxlIG1vdXNlIG1vdmVzXG4gICAgdGhpcy5tYXAub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgY3VycmVudG1vdXNlLmxhdCA9IGUubGF0bG5nLmxhdDtcbiAgICAgICAgY3VycmVudG1vdXNlLmxuZyA9IGUubGF0bG5nLmxuZztcbiAgICAgICAgdGhpcy4kdGlsZWxldmVsLnRleHQoIHRoaXMuZm9ybWF0X3RpbGUoZS5sYXRsbmcsIHRoaXMubWFwLmdldFpvb20oKSkgKTtcbiAgICAgICAgdGhpcy4kbW91c2VfcG9zaXRpb24udGV4dCggdGhpcy5mb3JtYXRfcG9pbnQoZS5sYXRsbmcsJzQzMjYnKSApO1xuICAgICAgICB0aGlzLiRtb3VzZV9wb3NpdGlvbl9tZXJjLnRleHQoIHRoaXMuZm9ybWF0X3BvaW50KGUubGF0bG5nLGN1cnJlbnRwcm9qKSApO1xuICAgICAgICB0aGlzLiRtYXBib3VuZHMudGV4dCggdGhpcy5mb3JtYXRfYm91bmRzKCB0aGlzLm1hcC5nZXRCb3VuZHMoKSwnNDMyNicpICk7XG4gICAgICAgIHRoaXMuJG1hcGJvdW5kc19tZXJjLnRleHQoIHRoaXMuZm9ybWF0X2JvdW5kcyggdGhpcy5tYXAuZ2V0Qm91bmRzKCksY3VycmVudHByb2opICk7XG4gICAgICAgIHRoaXMuJGNlbnRlci50ZXh0KCB0aGlzLmZvcm1hdF9wb2ludCggdGhpcy5tYXAuZ2V0Q2VudGVyKCksJzQzMjYnKSApO1xuICAgICAgICB0aGlzLiRjZW50ZXJfbWVyYy50ZXh0KCB0aGlzLmZvcm1hdF9wb2ludCggdGhpcy5tYXAuZ2V0Q2VudGVyKCksY3VycmVudHByb2opICk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm1hcC5vbignem9vbWVuZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhpcy4kdGlsZWxldmVsLnRleHQoIHRoaXMuZm9ybWF0X3RpbGUoY3VycmVudG1vdXNlLCB0aGlzLm1hcC5nZXRab29tKCkpICk7XG4gICAgICAgIHRoaXMuJHpvb21sZXZlbC50ZXh0KCB0aGlzLm1hcC5nZXRab29tKCkudG9TdHJpbmcoKSApO1xuICAgICAgICB0aGlzLiRtYXBib3VuZHMudGV4dCggdGhpcy5mb3JtYXRfYm91bmRzKCB0aGlzLm1hcC5nZXRCb3VuZHMoKSwnNDMyNicpICk7XG4gICAgICAgIHRoaXMuJG1hcGJvdW5kc19tZXJjLnRleHQoIHRoaXMuZm9ybWF0X2JvdW5kcyggdGhpcy5tYXAuZ2V0Qm91bmRzKCksY3VycmVudHByb2opICk7XG4gICAgfSk7XG5cbn07XG5cbk1hcFZpZXcucHJvdG90eXBlLmFkZF9zaWRlYmFyID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdGhpcy5yc2lkZWJhciA9IEwuY29udHJvbC5zaWRlYmFyKCB0aGlzLnJzaWRlYmFyX2VsZW1lbnQsIHtcbiAgICAgICAgcG9zaXRpb246ICdyaWdodCcsXG4gICAgICAgIGNsb3NlQnV0dG9uOiB0cnVlXG4gICAgfSk7XG4gICAgdGhpcy5tYXAuYWRkQ29udHJvbCggdGhpcy5yc2lkZWJhciApO1xuXG59O1xuXG5NYXBWaWV3LnByb3RvdHlwZS5hZGRfY3Jvc3NoYWlyID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdGhpcy5jcm9zc2hhaXJfaWNvbiA9IEwuaWNvbih7XG4gICAgICAgIGljb25Vcmw6ICcvZXhhbXBsZXMvY3Jvc3NoYWlyLnBuZycsXG4gICAgICAgIGljb25TaXplOiAgICAgWzIwLCAyMF0sIC8vIHNpemUgb2YgdGhlIGljb25cbiAgICAgICAgaWNvbkFuY2hvcjogICBbMTAsIDEwXSwgLy8gcG9pbnQgb2YgdGhlIGljb24gd2hpY2ggd2lsbCBjb3JyZXNwb25kIHRvIG1hcmtlcidzIGxvY2F0aW9uXG4gICAgfSk7XG4gICAgdGhpcy5jcm9zc2hhaXIgPSBuZXcgTC5tYXJrZXIoIHRoaXMubWFwLmdldENlbnRlcigpLCB7aWNvbjogdGhpcy5jcm9zc2hhaXJfaWNvbiwgY2xpY2thYmxlOmZhbHNlfSApO1xuICAgIHRoaXMuY3Jvc3NoYWlyLmFkZFRvKCB0aGlzLm1hcCApO1xuICAgIHRoaXMubWFwLm9uKCdtb3ZlJywgZnVuY3Rpb24oZSkge1xuICAgICAgICB0aGlzLmNyb3NzaGFpci5zZXRMYXRMbmcoIHRoaXMubWFwLmdldENlbnRlcigpICk7XG4gICAgfSk7XG5cblxufTtcblxuTWFwVmlldy5wcm90b3R5cGUuc2V0dXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coICdzZXR1cCcgKTtcblxuICAgIHRoaXMubWFwID0gTC5tYXAoJ21hcCcpLnNldFZpZXcoWzQ3LjU4OTg0MSwgLTEyMi4zMTkyMDJdLCAxMik7XG4gICAgTC50aWxlTGF5ZXIoJ2h0dHA6Ly97c30udGlsZXMubWFwYm94LmNvbS92My9zcGF0aWFsZGV2Lm1hcC1jOXoyY3llZi97en0ve3h9L3t5fS5wbmcnKS5hZGRUbyhtYXApO1xuXG4gICAgLy8gYWRkIHRoZSBzaWRlYmFyXG4gICAgdGhpcy5hZGRfc2lkZWJhcigpO1xuXG4gICAgLy8gYWRkIHRoZSBjcm9zc2hhaXJcbiAgICB0aGlzLmFkZF9jcm9zc2hhaXIoKTtcblxuICAgIFxufTtcblxuXG5cbk1hcFZpZXcucHJvdG90eXBlLmFkZF9sYXllciA9IGZ1bmN0aW9uKCBsYXllciwgbmFtZSwgdGl0bGUsIHpJbmRleCwgb24gKSB7XG4gICAgaWYgKG9uKSB7XG4gICAgICAgIGxheWVyLnNldFpJbmRleCh6SW5kZXgpLmFkZFRvKG1hcCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGF5ZXIuc2V0WkluZGV4KHpJbmRleCk7XG4gICAgfVxuICAgIC8vIENyZWF0ZSBhIHNpbXBsZSBsYXllciBzd2l0Y2hlciB0aGF0IHRvZ2dsZXMgbGF5ZXJzIG9uIGFuZCBvZmYuXG4gICAgdmFyIHVpID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcC11aScpO1xuICAgIHZhciBpdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICB2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICBsaW5rLmhyZWYgPSAnIyc7XG4gICAgaWYgKG9uKSB7XG4gICAgICAgIGxpbmsuY2xhc3NOYW1lID0gJ2VuYWJsZWQnO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxpbmsuY2xhc3NOYW1lID0gJyc7XG4gICAgfVxuICAgIGxpbmsuaW5uZXJIVE1MID0gbmFtZTtcbiAgICBsaW5rLnRpdGxlID0gdGl0bGU7XG4gICAgbGluay5vbmNsaWNrID0gZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgaWYgKG1hcC5oYXNMYXllcihsYXllcikpIHtcbiAgICAgICAgICAgIG1hcC5yZW1vdmVMYXllcihsYXllcik7XG4gICAgICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICcnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWFwLmFkZExheWVyKGxheWVyKTtcbiAgICAgICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ2VuYWJsZWQnO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBpdGVtLmFwcGVuZENoaWxkKGxpbmspO1xuICAgIHVpLmFwcGVuZENoaWxkKGl0ZW0pO1xufTtcblxuXG5NYXBWaWV3LnByb3RvdHlwZS5mb3JtYXRfYm91bmRzID0gZnVuY3Rpb24oIGJvdW5kcywgcHJvaiApIHtcblxuICAgIHZhciBnZGFsID0gJChcImlucHV0W25hbWU9J2dkYWwtY2hlY2tib3gnXVwiKS5wcm9wKCdjaGVja2VkJyk7XG4gICAgdmFyIGxuZ0xhdCA9ICQoXCJpbnB1dFtuYW1lPSdjb29yZC1vcmRlciddXCIpLnByb3AoJ2NoZWNrZWQnKTtcblxuICAgIHZhciBmb3JtYXR0ZWRCb3VuZHMgPSAnJztcbiAgICB2YXIgc291dGh3ZXN0ID0gYm91bmRzLmdldFNvdXRoV2VzdCgpO1xuICAgIHZhciBub3J0aGVhc3QgPSBib3VuZHMuZ2V0Tm9ydGhFYXN0KCk7XG4gICAgdmFyIHhtaW4gPSAwO1xuICAgIHZhciB5bWluID0gMDtcbiAgICB2YXIgeG1heCA9IDA7XG4gICAgdmFyIHltYXggPSAwO1xuICAgIGlmIChwcm9qID09ICc0MzI2Jykge1xuICAgICAgICB4bWluID0gc291dGh3ZXN0LmxuZy50b0ZpeGVkKDYpO1xuICAgICAgICB5bWluID0gc291dGh3ZXN0LmxhdC50b0ZpeGVkKDYpO1xuICAgICAgICB4bWF4ID0gbm9ydGhlYXN0LmxuZy50b0ZpeGVkKDYpO1xuICAgICAgICB5bWF4ID0gbm9ydGhlYXN0LmxhdC50b0ZpeGVkKDYpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBwcm9qX3RvX3VzZSA9IG51bGw7XG4gICAgICAgIGlmICh0eXBlb2YocHJvamRlZnNbcHJval0pICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgLy8gd2UgaGF2ZSBpdCBhbHJlYWR5LCB0aGVuIGdyYWIgaXQgYW5kIHVzZSBpdC4uLlxuICAgICAgICAgICAgcHJval90b191c2UgPSBwcm9qZGVmc1twcm9qXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFdlIGhhdmUgbm90IHVzZWQgdGhpcyBvbmUgeWV0Li4uIG1ha2UgaXQgYW5kIHN0b3JlIGl0Li4uXG4gICAgICAgICAgICBwcm9qZGVmc1twcm9qXSA9IG5ldyBMLlByb2ouQ1JTKHByb2osIHByb2o0ZGVmc1twcm9qXVsxXSk7XG4gICAgICAgICAgICBwcm9qX3RvX3VzZSA9IHByb2pkZWZzW3Byb2pdO1xuICAgICAgICB9XG4gICAgICAgIHNvdXRod2VzdCA9IHByb2pfdG9fdXNlLnByb2plY3Qoc291dGh3ZXN0KVxuICAgICAgICBub3J0aGVhc3QgPSBwcm9qX3RvX3VzZS5wcm9qZWN0KG5vcnRoZWFzdClcbiAgICAgICAgeG1pbiA9IHNvdXRod2VzdC54LnRvRml4ZWQoNCk7XG4gICAgICAgIHltaW4gPSBzb3V0aHdlc3QueS50b0ZpeGVkKDQpO1xuICAgICAgICB4bWF4ID0gbm9ydGhlYXN0LngudG9GaXhlZCg0KTtcbiAgICAgICAgeW1heCA9IG5vcnRoZWFzdC55LnRvRml4ZWQoNCk7XG4gICAgfVxuXG4gICAgaWYgKGdkYWwpIHtcbiAgICAgICAgaWYgKGxuZ0xhdCkge1xuICAgICAgICAgICAgZm9ybWF0dGVkQm91bmRzID0geG1pbisnLCcreW1pbisnLCcreG1heCsnLCcreW1heDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvcm1hdHRlZEJvdW5kcyA9IHltaW4rJywnK3htaW4rJywnK3ltYXgrJywnK3htYXg7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobG5nTGF0KSB7XG4gICAgICAgICAgICBmb3JtYXR0ZWRCb3VuZHMgPSB4bWluKycgJyt5bWluKycgJyt4bWF4KycgJyt5bWF4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9ybWF0dGVkQm91bmRzID0geW1pbisnICcreG1pbisnICcreW1heCsnICcreG1heDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZm9ybWF0dGVkQm91bmRzXG59O1xuXG5NYXBWaWV3LnByb3RvdHlwZS5mb3JtYXRfdGlsZSA9IGZ1bmN0aW9uKCBwb2ludCwgem9vbSApIHtcbiAgICB2YXIgeFRpbGUgPSBNYXRoLmZsb29yKChwb2ludC5sbmcrMTgwKS8zNjAqTWF0aC5wb3coMix6b29tKSk7XG4gICAgdmFyIHlUaWxlID0gTWF0aC5mbG9vcigoMS1NYXRoLmxvZyhNYXRoLnRhbihwb2ludC5sYXQqTWF0aC5QSS8xODApICsgMS9NYXRoLmNvcyhwb2ludC5sYXQqTWF0aC5QSS8xODApKS9NYXRoLlBJKS8yICpNYXRoLnBvdygyLHpvb20pKTtcbiAgICByZXR1cm4geFRpbGUudG9TdHJpbmcoKSArICcsJyArIHlUaWxlLnRvU3RyaW5nKCk7XG59O1xuXG5NYXBWaWV3LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRpbmZvX2JveC5hcHBlbmQoIHRoaXMuaW5mb19ib3hfdGVtcGxhdGUoIHt9ICkgKTtcbn07XG5cblxuTWFwVmlldy5wcm90b3R5cGUuZm9ybWF0X3BvaW50ID0gZnVuY3Rpb24oIHBvaW50LCBwcm9qICkge1xuXG4gICAgdmFyIGdkYWwgPSAkKFwiaW5wdXRbbmFtZT0nZ2RhbC1jaGVja2JveCddXCIpLnByb3AoJ2NoZWNrZWQnKTtcbiAgICB2YXIgbG5nTGF0ID0gJChcImlucHV0W25hbWU9J2Nvb3JkLW9yZGVyJ11cIikucHJvcCgnY2hlY2tlZCcpO1xuXG4gICAgdmFyIGZvcm1hdHRlZFBvaW50ID0gJyc7XG4gICAgaWYgKHByb2ogPT0gJzQzMjYnKSB7XG4gICAgICAgIHggPSBwb2ludC5sbmcudG9GaXhlZCg2KTtcbiAgICAgICAgeSA9IHBvaW50LmxhdC50b0ZpeGVkKDYpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBwcm9qX3RvX3VzZSA9IG51bGw7XG4gICAgICAgIGlmICh0eXBlb2YocHJvamRlZnNbcHJval0pICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgLy8gd2UgaGF2ZSBpdCBhbHJlYWR5LCB0aGVuIGdyYWIgaXQgYW5kIHVzZSBpdC4uLlxuICAgICAgICAgICAgcHJval90b191c2UgPSBwcm9qZGVmc1twcm9qXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFdlIGhhdmUgbm90IHVzZWQgdGhpcyBvbmUgeWV0Li4uIG1ha2UgaXQgYW5kIHN0b3JlIGl0Li4uXG4gICAgICAgICAgICBwcm9qZGVmc1twcm9qXSA9IG5ldyBMLlByb2ouQ1JTKHByb2osIHByb2o0ZGVmc1twcm9qXVsxXSk7XG4gICAgICAgICAgICBwcm9qX3RvX3VzZSA9IHByb2pkZWZzW3Byb2pdO1xuICAgICAgICB9XG4gICAgICAgIHBvaW50ID0gcHJval90b191c2UucHJvamVjdChwb2ludClcbiAgICAgICAgeCA9IHBvaW50LngudG9GaXhlZCg0KTtcbiAgICAgICAgeSA9IHBvaW50LnkudG9GaXhlZCg0KTtcbiAgICB9XG4gICAgaWYgKGdkYWwpIHtcbiAgICAgICAgaWYgKGxuZ0xhdCkge1xuICAgICAgICAgICAgZm9ybWF0dGVkQm91bmRzID0geCsnLCcreTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvcm1hdHRlZEJvdW5kcyA9IHkrJywnK3g7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobG5nTGF0KSB7XG4gICAgICAgICAgICBmb3JtYXR0ZWRCb3VuZHMgPSB4KycgJyt5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9ybWF0dGVkQm91bmRzID0geSsnICcreDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZm9ybWF0dGVkQm91bmRzXG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFwVmlldztcblxuXG5cbiJdfQ==
