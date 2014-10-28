var AbstractController = require('./abstract_controller.js') ,
    object_extend = require('./base_class_utils.js').object_extend ,
    formatters = require( './formatters' ) ,
    console = require("console-browserify");


// <script>
if ( typeof window !== "undefined" ) {

    Rancho = window.Rancho || {};  
    Rancho.AbstractController =  AbstractController;
    Rancho.utils = { object_extend : object_extend  };
    Rancho.formatters = formatters;

// CommonJS
} else if ( typeof exports === "object" && typeof module === "object" ) {

    module.exports.AbstractController = AbstractController;
    module.exports.utils = { object_extend : object_extend  };
    module.exports.formatters = formatters;

}
