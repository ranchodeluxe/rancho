var AbstractController = require('./abstract_controller.js');
var object_extend = require('./base_class_utils.js').object_extend;
var console = require("console-browserify");

// CommonJS
if ( typeof window !== "undefined" ) {

    Rancho = window.Rancho || {};  
    Rancho.AbstractController =  AbstractController;
    Rancho.utils = { object_extend : object_extend  };

// <script>
} else if ( typeof exports === "object" && typeof module === "object" ) {

    module.exports.Rancho = {};
    module.exports.Rancho.AbstractController = AbstractController;
    module.exports.Rancho.utils = { object_extend : object_extend  };

}
