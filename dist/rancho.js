(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./base_class_utils.js":2}],2:[function(require,module,exports){
/*
**
**  remove underscore dependencies and methods
**  object_extend originally from Underscore project
**  ClassExtend.extend originally from Backbone project
**  http://backbonejs.org/docs/backbone.html#section-208
**
*/

var object_extend = function( dest ) {

    //  verify that 'dest' is an object
    var type = typeof dest;
    if ( type !== 'function' && type !== 'object' ) return dest;

    //  get all source objects that we will be copying
    var sources = Array.prototype.slice.call( arguments, 1 ), prop, j, len, src;

    //  copy source props to destination object
    for (j = 0, len = sources.length; j < len; j++) {
        src = sources[ j ];
        for ( prop in src ) {
            if ( hasOwnProperty.call( src, prop ) ) {
                dest[ prop ] = src[ prop ];
            }
        }
    }
    return dest;

};


/*
**
**  Backbone declares it's main constructor functions ( Model, Collection etc ) 
**  then grants all the contructors the .extend function ( break the chain type inheritence ).
**  All class methods are added using the _.extend( Class.prototype, {} ).
**  This is equivelant to the same pattern of declaring Class.prototype.method functions
**  
*/

var ClassExtend = function(){};

ClassExtend.extend = function( proto_props, static_props ) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (proto_props && proto_props.hasOwnProperty('constructor')) {
      child = proto_props.constructor;
    } else {
      child = function(){ return parent_object = parent.apply(this, arguments); }
    }    

    // Add static properties to the constructor function, if supplied.
    object_extend(child, parent, static_props);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties to the subclass,
    // if supplied.
    if (proto_props) object_extend(child.prototype, proto_props);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
};

module.exports.ClassExtend = ClassExtend; 
module.exports.object_extend = object_extend;


},{}],3:[function(require,module,exports){
var AbstractController = require('./abstract_controller.js');
var object_extend = require('./base_class_utils.js').object_extend;


if ( typeof window !== 'undefined' ) {

    window.Rancho = window.Rancho || {};  
    window.Rancho.AbstractController =  AbstractController;
    window.Rancho.utils = { object_extend : object_extend  };

}

},{"./abstract_controller.js":1,"./base_class_utils.js":2}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWJzdHJhY3RfY29udHJvbGxlci5qcyIsInNyYy9iYXNlX2NsYXNzX3V0aWxzLmpzIiwic3JjL3JhbmNoby5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBDbGFzcyA9IHJlcXVpcmUoJy4vYmFzZV9jbGFzc191dGlscy5qcycpLkNsYXNzRXh0ZW5kO1xudmFyIG9iamVjdF9leHRlbmQgPSByZXF1aXJlKCcuL2Jhc2VfY2xhc3NfdXRpbHMuanMnKS5vYmplY3RfZXh0ZW5kO1xuIFxuIFxudmFyIEFic3RyYWN0QmFzZUNvbnRyb2xsZXIgID0gIGZ1bmN0aW9uKCBvcHRpb25fb3ZlcnJpZGVzICkge1xuXG5cbiAgICAgICAgb3B0aW9uX292ZXJyaWRlcyB8fCAob3B0aW9uX292ZXJyaWRlcyA9IHt9KTtcbiBcbiAgICAgICAgdGhpcy5vcHRpb25zID0gKCB0eXBlb2Ygb3B0aW9uX292ZXJyaWRlcyA9PT0gXCJvYmplY3RcIiApIFxuICAgICAgICAgICAgICAgICAgICAgICAgPyBvYmplY3RfZXh0ZW5kKCB7fSwgdGhpcy5kZWZhdWx0X29wdGlvbnMsIG9wdGlvbl9vdmVycmlkZXMgKSA6IFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0X2V4dGVuZCgge30sIHRoaXMuZGVmYXVsdF9vcHRpb25zICk7XG4gXG4gICAgICAgIHRoaXMub3B0aW9uX292ZXJyaWRlcyA9IG9wdGlvbl9vdmVycmlkZXM7IC8vIHNhdmUgZm9yIGRlYnVnZ2luZyByZWZlcmVuY2VcbiBcbiBcbiAgICAgICAgdmFyIGNvZXJjZV90b19qcXVlcnlfa2V5ID0gZnVuY3Rpb24oIGtleSApIHtcbiAgICAgICAgICAgIHZhciBuZXdfa2V5ID0gJyQnICsga2V5LnNwbGl0KCdfc2VsZWN0b3InKVswXTtcbiAgICAgICAgICAgIHJldHVybiBuZXdfa2V5O1xuICAgICAgICB9XG4gXG4gICAgICAgIC8qICBcbiAgICAgICAgKipcbiAgICAgICAgKiogIGNvbnZlcnQgb3B0aW9ucyBwYXNzZWQgaW50byBjb25zdHJ1Y3RvciBpbnRvIGZpcnN0LWxldmVsIGluc3RhbmNlIHZhcmlhYmxlc1xuICAgICAgICAqKiAgaWYgJ3NlbGVjdG9yJyBpcyBrZXl3b3JkIGluIGtleSwgdGhlblxuICAgICAgICAqKiAgaW5zdGFuY2UgdmFyaWFibGVzIHdpbGwgYmVjb21lIGtleSBuYW1lcyBvZiAndGhpcy4ka2V5J1xuICAgICAgICAqKiAgJ3NlbGVjdG9yJyB3aWxsIGJlIGNvZXJjZWQgdG8gc3Vic3RyaW5nICggc2VlIGNvcmVjZV90b19qcXVlcnlfa2V5IClcbiAgICAgICAgKipcbiAgICAgICAgKi9cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMub3B0aW9ucykge1xuICAgICAgICAgICAgaWYgKCAvX3NlbGVjdG9yL2kudGVzdChrZXkpICkge1xuICAgICAgICAgICAgICAgIHZhciBuZXdfa2V5ID0gY29lcmNlX3RvX2pxdWVyeV9rZXkoa2V5KTtcbiAgICAgICAgICAgICAgICB0aGlzW25ld19rZXldID0gJCh0aGlzLm9wdGlvbnNba2V5XSk7XG4gICAgICAgICAgICAgICAgdGhpc1trZXldID0gdGhpcy5vcHRpb25zW2tleV07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXNba2V5XSA9IHRoaXMub3B0aW9uc1trZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gXG4gICAgICAgIC8vIGNhbGwgc3ViY2xhc3MgaG9va3NcbiAgICAgICAgaWYgKHRoaXMuaW5pdGlhbGl6ZSkge1xuICAgICAgICAgICAgdGhpcy5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgICAgICAgfSAgIFxuIFxuICAgICAgICBpZiAoIHRoaXMub25faW5pdGlhbGl6ZSApIHtcbiAgICAgICAgICAgIHRoaXMub25faW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gICAgICAgIH1cbiBcbn07XG5cbkFic3RyYWN0QmFzZUNvbnRyb2xsZXIucHJvdG90eXBlLl9fbmFtZV9fID0gJ0Fic3RyYWN0QmFzZUNsYXNzJztcblxuLy8gYWRkIGFiaWxpdHkgdG8gZXh0ZW5kIHRoaXMgY2xhc3NcbkFic3RyYWN0QmFzZUNvbnRyb2xsZXIuZXh0ZW5kID0gQ2xhc3MuZXh0ZW5kO1xuIFxubW9kdWxlLmV4cG9ydHMgPSAgQWJzdHJhY3RCYXNlQ29udHJvbGxlcjtcbiIsIi8qXG4qKlxuKiogIHJlbW92ZSB1bmRlcnNjb3JlIGRlcGVuZGVuY2llcyBhbmQgbWV0aG9kc1xuKiogIG9iamVjdF9leHRlbmQgb3JpZ2luYWxseSBmcm9tIFVuZGVyc2NvcmUgcHJvamVjdFxuKiogIENsYXNzRXh0ZW5kLmV4dGVuZCBvcmlnaW5hbGx5IGZyb20gQmFja2JvbmUgcHJvamVjdFxuKiogIGh0dHA6Ly9iYWNrYm9uZWpzLm9yZy9kb2NzL2JhY2tib25lLmh0bWwjc2VjdGlvbi0yMDhcbioqXG4qL1xuXG52YXIgb2JqZWN0X2V4dGVuZCA9IGZ1bmN0aW9uKCBkZXN0ICkge1xuXG4gICAgLy8gIHZlcmlmeSB0aGF0ICdkZXN0JyBpcyBhbiBvYmplY3RcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBkZXN0O1xuICAgIGlmICggdHlwZSAhPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlICE9PSAnb2JqZWN0JyApIHJldHVybiBkZXN0O1xuXG4gICAgLy8gIGdldCBhbGwgc291cmNlIG9iamVjdHMgdGhhdCB3ZSB3aWxsIGJlIGNvcHlpbmdcbiAgICB2YXIgc291cmNlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKCBhcmd1bWVudHMsIDEgKSwgcHJvcCwgaiwgbGVuLCBzcmM7XG5cbiAgICAvLyAgY29weSBzb3VyY2UgcHJvcHMgdG8gZGVzdGluYXRpb24gb2JqZWN0XG4gICAgZm9yIChqID0gMCwgbGVuID0gc291cmNlcy5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICBzcmMgPSBzb3VyY2VzWyBqIF07XG4gICAgICAgIGZvciAoIHByb3AgaW4gc3JjICkge1xuICAgICAgICAgICAgaWYgKCBoYXNPd25Qcm9wZXJ0eS5jYWxsKCBzcmMsIHByb3AgKSApIHtcbiAgICAgICAgICAgICAgICBkZXN0WyBwcm9wIF0gPSBzcmNbIHByb3AgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVzdDtcblxufTtcblxuXG4vKlxuKipcbioqICBCYWNrYm9uZSBkZWNsYXJlcyBpdCdzIG1haW4gY29uc3RydWN0b3IgZnVuY3Rpb25zICggTW9kZWwsIENvbGxlY3Rpb24gZXRjICkgXG4qKiAgdGhlbiBncmFudHMgYWxsIHRoZSBjb250cnVjdG9ycyB0aGUgLmV4dGVuZCBmdW5jdGlvbiAoIGJyZWFrIHRoZSBjaGFpbiB0eXBlIGluaGVyaXRlbmNlICkuXG4qKiAgQWxsIGNsYXNzIG1ldGhvZHMgYXJlIGFkZGVkIHVzaW5nIHRoZSBfLmV4dGVuZCggQ2xhc3MucHJvdG90eXBlLCB7fSApLlxuKiogIFRoaXMgaXMgZXF1aXZlbGFudCB0byB0aGUgc2FtZSBwYXR0ZXJuIG9mIGRlY2xhcmluZyBDbGFzcy5wcm90b3R5cGUubWV0aG9kIGZ1bmN0aW9uc1xuKiogIFxuKi9cblxudmFyIENsYXNzRXh0ZW5kID0gZnVuY3Rpb24oKXt9O1xuXG5DbGFzc0V4dGVuZC5leHRlbmQgPSBmdW5jdGlvbiggcHJvdG9fcHJvcHMsIHN0YXRpY19wcm9wcyApIHtcbiAgICB2YXIgcGFyZW50ID0gdGhpcztcbiAgICB2YXIgY2hpbGQ7XG5cbiAgICAvLyBUaGUgY29uc3RydWN0b3IgZnVuY3Rpb24gZm9yIHRoZSBuZXcgc3ViY2xhc3MgaXMgZWl0aGVyIGRlZmluZWQgYnkgeW91XG4gICAgLy8gKHRoZSBcImNvbnN0cnVjdG9yXCIgcHJvcGVydHkgaW4geW91ciBgZXh0ZW5kYCBkZWZpbml0aW9uKSwgb3IgZGVmYXVsdGVkXG4gICAgLy8gYnkgdXMgdG8gc2ltcGx5IGNhbGwgdGhlIHBhcmVudCdzIGNvbnN0cnVjdG9yLlxuICAgIGlmIChwcm90b19wcm9wcyAmJiBwcm90b19wcm9wcy5oYXNPd25Qcm9wZXJ0eSgnY29uc3RydWN0b3InKSkge1xuICAgICAgY2hpbGQgPSBwcm90b19wcm9wcy5jb25zdHJ1Y3RvcjtcbiAgICB9IGVsc2Uge1xuICAgICAgY2hpbGQgPSBmdW5jdGlvbigpeyByZXR1cm4gcGFyZW50X29iamVjdCA9IHBhcmVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9XG4gICAgfSAgICBcblxuICAgIC8vIEFkZCBzdGF0aWMgcHJvcGVydGllcyB0byB0aGUgY29uc3RydWN0b3IgZnVuY3Rpb24sIGlmIHN1cHBsaWVkLlxuICAgIG9iamVjdF9leHRlbmQoY2hpbGQsIHBhcmVudCwgc3RhdGljX3Byb3BzKTtcblxuICAgIC8vIFNldCB0aGUgcHJvdG90eXBlIGNoYWluIHRvIGluaGVyaXQgZnJvbSBgcGFyZW50YCwgd2l0aG91dCBjYWxsaW5nXG4gICAgLy8gYHBhcmVudGAncyBjb25zdHJ1Y3RvciBmdW5jdGlvbi5cbiAgICB2YXIgU3Vycm9nYXRlID0gZnVuY3Rpb24oKXsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9O1xuICAgIFN1cnJvZ2F0ZS5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlO1xuICAgIGNoaWxkLnByb3RvdHlwZSA9IG5ldyBTdXJyb2dhdGU7XG5cbiAgICAvLyBBZGQgcHJvdG90eXBlIHByb3BlcnRpZXMgdG8gdGhlIHN1YmNsYXNzLFxuICAgIC8vIGlmIHN1cHBsaWVkLlxuICAgIGlmIChwcm90b19wcm9wcykgb2JqZWN0X2V4dGVuZChjaGlsZC5wcm90b3R5cGUsIHByb3RvX3Byb3BzKTtcblxuICAgIC8vIFNldCBhIGNvbnZlbmllbmNlIHByb3BlcnR5IGluIGNhc2UgdGhlIHBhcmVudCdzIHByb3RvdHlwZSBpcyBuZWVkZWRcbiAgICAvLyBsYXRlci5cbiAgICBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlO1xuXG4gICAgcmV0dXJuIGNoaWxkO1xufTtcblxubW9kdWxlLmV4cG9ydHMuQ2xhc3NFeHRlbmQgPSBDbGFzc0V4dGVuZDsgXG5tb2R1bGUuZXhwb3J0cy5vYmplY3RfZXh0ZW5kID0gb2JqZWN0X2V4dGVuZDtcblxuIiwidmFyIEFic3RyYWN0Q29udHJvbGxlciA9IHJlcXVpcmUoJy4vYWJzdHJhY3RfY29udHJvbGxlci5qcycpO1xudmFyIG9iamVjdF9leHRlbmQgPSByZXF1aXJlKCcuL2Jhc2VfY2xhc3NfdXRpbHMuanMnKS5vYmplY3RfZXh0ZW5kO1xuXG5cbmlmICggdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgKSB7XG5cbiAgICB3aW5kb3cuUmFuY2hvID0gd2luZG93LlJhbmNobyB8fCB7fTsgIFxuICAgIHdpbmRvdy5SYW5jaG8uQWJzdHJhY3RDb250cm9sbGVyID0gIEFic3RyYWN0Q29udHJvbGxlcjtcbiAgICB3aW5kb3cuUmFuY2hvLnV0aWxzID0geyBvYmplY3RfZXh0ZW5kIDogb2JqZWN0X2V4dGVuZCAgfTtcblxufVxuIl19
