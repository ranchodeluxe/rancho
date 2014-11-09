var MapView = require( './map.js' );

(function( def ) {

    if ( typeof window !== 'undefined' ) {
        window.App = window.App || {};
        window.App = def();
    }

})( function() {

    return {
        MapView : MapView ,
    }

});
