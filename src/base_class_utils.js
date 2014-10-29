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
        //
        // later when we extend child.prototype
        // we don't want constructor cruft hanging
        // off the prototype, so remove it
        //
        delete proto_props[ 'constructor' ];
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

