var Class = require('./base_class_utils.js').ClassExtend;
var object_extend = require('./base_class_utils.js').object_extend;
 
 
var AbstractBaseController  =  function( option_overrides ) {


        option_overrides || (option_overrides = {});
 
        this.options = ( typeof option_overrides === "object" ) 
                        ? object_extend( {}, this.default_options, option_overrides ) : 
                        object_extend( {}, this.default_options );
 
        this.option_overrides = option_overrides; // save for debugging reference
 
 
        var coerce_to_jquery_key = function( key ) {
            var new_key = '$' + key.split('_selector')[0];
            return new_key;
        }
 
        /*  
        **
        **  convert options passed into constructor into first-level instance variables
        **  if 'selector' is keyword in key, then
        **  instance variables will become key names of 'this.$key'
        **  'selector' will be coerced to substring ( see corece_to_jquery_key )
        **
        */
        for (var key in this.options) {
            if ( /_selector/i.test(key) ) {
                var new_key = coerce_to_jquery_key(key);
                this[new_key] = $(this.options[key]);
                this[key] = this.options[key];
            } else {
                this[key] = this.options[key];
            }
        }
 
        // call subclass hooks
        if (this.initialize) {
            this.initialize.apply( this, arguments );
        }   
 
        if ( this.on_initialize ) {
            this.on_initialize.apply( this, arguments );
        }
 
};

AbstractBaseController.prototype.__name__ = 'AbstractBaseClass';

// add ability to extend this class
AbstractBaseController.extend = Class.extend;
 
module.exports =  AbstractBaseController;
