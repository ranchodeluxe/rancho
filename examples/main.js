var MapView = require( './map.js' );
(function( def ) {

    window.App = window.App || {};
    window.App = def();

})( function() {

    return {
        MapView : MapView ,
    }

});
