var AbstractController = require('./abstract_controller.js');
var object_extend = require('./base_class_utils.js').object_extend;


if ( typeof window !== 'undefined' ) {

    window.Rancho = window.Rancho || {};  
    window.Rancho.AbstractController =  AbstractController;
    window.Rancho.utils = { object_extend : object_extend  };

}
