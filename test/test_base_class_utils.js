var test = require('tape')
    Rancho = require('../src/rancho.js' );


/*
**
**  test Racho.utils.object_extend
**
*/
test( 'object extend no own props', function ( t ) {

    var data = {
        chuck : 'norris' ,
        1 : 2 ,
        hash :  { 'yes' : 'sir' } ,
        bool : true 
    };

    var dest = Rancho.utils.object_extend( {}, data );

    t.equal( dest.chuck, data.chuck );
    t.equal( dest[ '1' ] , data[ '1' ] );
    t.deepEqual( dest.hash , data.hash );
    t.equal( dest.bool, data.bool );

    t.end();

});


test( 'object extend multiple source overrides left to right', function ( t ) {

    var data = {
        chuck : 'norris' ,
        1 : 2 ,
        hash :  { 'yes' : 'sir' } ,
        bool : true 
    };

    var data2 = {
        chuck : 'morris' ,
        1 : 3 ,
        hash :  { 'no' : 'sir' } ,
        bool : false
    };

    var dest = Rancho.utils.object_extend( {}, data, data2 );

    t.notEqual( dest.chuck, data.chuck );
    t.notEqual( dest[ '1' ] , data[ '1' ] );
    t.notEqual( dest.hash , data.hash );
    t.notEqual( dest.bool, data.bool );

    t.end();

});


test( 'make sure own properties do not get copied', function ( t ) {

    var data = {
        chuck : 'norris' ,
        1 : 2 ,
        hash :  { 'yes' : 'sir' } ,
        bool : true 
    };

    var data2 = new function() {};
    data2.constructor.prototype = {
        chuck : 'morris' ,
        1 : 3 ,
        hash :  { 'no' : 'sir' } ,
        bool : false ,
        heck : 'no' 
    }

    var dest = Rancho.utils.object_extend( {}, data, data2 );

    t.equal( dest.chuck, data.chuck );
    t.equal( dest[ '1' ] , data[ '1' ] );
    t.deepEqual( dest.hash , data.hash );
    t.equal( dest.bool, data.bool );
    t.equal( typeof dest.heck, 'undefined' );

    t.end();

});


/*
**
**  test Racho.ClassExtend
**
*/

//
//  there are two identical patterns for how we can use ClassExtend to subclass.
//  -----------------------------------------------------------------------------
//  we can either use ClassExtend.extend directly to create subclasses and
//  pass a 'constructor' option as a proto property that the subclass will use
//  -----
//  or 
//  -----
//  we can create normal constructors and give those constructors a static .extend 
//  method that points to ClassExtend.extend. With this pattern the constructor
//  will by default be used for subclasses
//
test( 'ClassExtend.extend constructor pattern 1 no subclass', function ( t ) {

    var Coat = Rancho.ClassExtend.extend( {
            constructor : function ( a, b, c, d ) {
                this.a = a;
                this.b = b;
                this.c = c;
                this.d = d;
            }
        } , {

    } )

    var a = 'i', 
        b = 'am', 
        c = ['a'] , 
        d = { 'coat' : true };
    var coat = new Coat( a, b, c, d );

    t.equal( coat.a, a );
    t.equal( coat.b, b );
    t.deepEqual( coat.c, c );
    t.deepEqual( coat.d, d );
    t.equal( coat instanceof Coat, true );

    t.end();

});

test( 'ClassExtend.extend constructor pattern 1 with subclass', function ( t ) {

    var Coat = Rancho.ClassExtend.extend( {
            constructor : function ( a, b, c, d, e, f ) {
                this.a = a;
                this.b = b;
                this.c = c;
                this.d = d;
                this.e = e;
                this.f = f;
            }
        } , {

    } )

    var Pancho = Coat.extend({},{});

    var a = 'i', 
        b = 'am', 
        c = ['a'] , 
        d = { 'coat' : true },
        e = 'and' ,
        f = Pancho;
    var coat = new Pancho( a, b, c, d, e, f );

    t.equal( coat.a, a );
    t.equal( coat.b, b );
    t.deepEqual( coat.c, c );
    t.deepEqual( coat.d, d );
    t.equal( coat.e, e );
    t.deepEqual( coat.f, f );
    t.equal( coat instanceof Coat, true );
    t.equal( coat instanceof Pancho, true );

    t.end();

});

test( 'ClassExtend.extend constructor pattern 2 no subclass', function ( t ) {

    var Coat =  function ( a, b, c, d ) {
                    this.a = a;
                    this.b = b;
                    this.c = c;
                    this.d = d;
                };

    Coat.extend = Rancho.ClassExtend.extend;

    var a = 'i', 
        b = 'am', 
        c = ['a'] , 
        d = { 'coat' : true };
    var coat = new Coat( a, b, c, d );

    t.equal( coat.a, a );
    t.equal( coat.b, b );
    t.deepEqual( coat.c, c );
    t.deepEqual( coat.d, d );
    t.equal( coat instanceof Coat, true );

    t.end();

});

test( 'ClassExtend.extend constructor pattern 2 with subclass', function ( t ) {

    var Coat =  function ( a, b, c, d, e, f ) {
                    this.a = a;
                    this.b = b;
                    this.c = c;
                    this.d = d;
                    this.e = e;
                    this.f = f;
                };
    Coat.extend = Rancho.ClassExtend.extend;



    var Pancho = Coat.extend({},{});

    var a = 'i', 
        b = 'am', 
        c = ['a'] , 
        d = { 'coat' : true },
        e = 'and' ,
        f = Pancho;
    var coat = new Pancho( a, b, c, d, e, f );

    t.equal( coat.a, a );
    t.equal( coat.b, b );
    t.deepEqual( coat.c, c );
    t.deepEqual( coat.d, d );
    t.equal( coat.e, e );
    t.deepEqual( coat.f, f );
    t.equal( coat instanceof Coat, true );
    t.equal( coat instanceof Pancho, true );

    t.end();

});


// test ClassExtend .extend with statics 
test( 'ClassExtend.extend statics pattern 1 no subclass', function ( t ) {

    var generic_fn = function(){ this.toots = 'hoots' };
    var statics = {
        junk : 'trunk' ,
        happy : true ,
        nested : { 'yep' : true } ,
        fn : generic_fn ,
    };

    var Coat = Rancho.ClassExtend.extend( { } , statics );

    var coat = new Coat();

    // make sure statics are really statics
    t.equal( typeof coat.junk, 'undefined' );
    t.equal( typeof coat.happy, 'undefined' );
    t.equal( typeof coat.nested, 'undefined' );
    t.equal( typeof coat.fn, 'undefined' );
    t.equal( coat instanceof Coat, true );
    t.equal( Coat.junk, statics.junk );
    t.equal( Coat.happy, statics.happy );
    t.deepEqual( Coat.nested, statics.nested );
    t.deepEqual( Coat.fn, statics.fn );

    t.end();

});

test( 'ClassExtend.extend static pattern 1 with subclass', function ( t ) {

    var generic_fn = function(){ this.toots = 'hoots' };
    var statics = {
        junk : 'trunk' ,
        happy : true ,
        nested : { 'yep' : true } ,
        fn : generic_fn ,
    };

    var Coat = Rancho.ClassExtend.extend( {} , statics );
    var Pancho = Coat.extend( {},{} );
    var pancho = new Pancho();
    

    // make sure statics are really statics
    t.equal( typeof pancho.junk, 'undefined' );
    t.equal( typeof pancho.happy, 'undefined' );
    t.equal( typeof pancho.nested, 'undefined' );
    t.equal( typeof pancho.fn, 'undefined' );
    t.equal( pancho instanceof Coat, true );
    t.equal( pancho instanceof Pancho, true );
    t.equal( Pancho.junk, statics.junk );
    t.equal( Pancho.happy, statics.happy );
    t.deepEqual( Pancho.nested, statics.nested );
    t.deepEqual( Pancho.fn, statics.fn );

    t.end();

});

test( 'ClassExtend.extend statics pattern 2 with subclass', function ( t ) {
    var generic_fn = function(){ this.toots = 'hoots' };
    var statics = {
        junk : 'trunk' ,
        happy : true ,
        nested : { 'yep' : true } ,
        fn : generic_fn ,
    };

    var Coat = function () {};
    Coat.extend = Rancho.ClassExtend.extend;
    var Pancho = Coat.extend( {}, statics );
    var pancho = new Pancho();
    

    // make sure statics are really statics
    t.equal( typeof pancho.junk, 'undefined' );
    t.equal( typeof pancho.happy, 'undefined' );
    t.equal( typeof pancho.nested, 'undefined' );
    t.equal( typeof pancho.fn, 'undefined' );
    t.equal( pancho instanceof Coat, true );
    t.equal( pancho instanceof Pancho, true );
    t.equal( Pancho.junk, statics.junk );
    t.equal( Pancho.happy, statics.happy );
    t.deepEqual( Pancho.nested, statics.nested );
    t.deepEqual( Pancho.fn, statics.fn );

    t.end();

});


// test ClassExtend .extend break-the-chain-type inheritence and logic around Surrogate.prototype 
/*
test( 'ClassExtend.extend surrogate pattern 2', function ( t ) {
    var generic_fn = function(){ this.toots = 'hoots' };
    var statics = {
        junk : 'trunk' ,
        happy : true ,
        nested : { 'yep' : true } ,
        fn : generic_fn ,
    };

    var Coat = function () {};
    Coat.extend = Rancho.ClassExtend.extend;
    var Pancho = Coat.extend( {}, statics );
    var pancho = new Pancho();
    

    // make sure statics are really statics
    t.equal( typeof pancho.junk, 'undefined' );
    t.equal( typeof pancho.happy, 'undefined' );
    t.equal( typeof pancho.nested, 'undefined' );
    t.equal( typeof pancho.fn, 'undefined' );
    t.equal( pancho instanceof Coat, true );
    t.equal( pancho instanceof Pancho, true );
    t.equal( Pancho.junk, statics.junk );
    t.equal( Pancho.happy, statics.happy );
    t.deepEqual( Pancho.nested, statics.nested );
    t.deepEqual( Pancho.fn, statics.fn );

    t.end();

});
*/

// test ClassExtend .extend with prototype props 

// test ClassExtend .extend  with  __super__ to make sure it still has reference to Parent.statics and own properties




// test AbstractController constructor with selectors and regular variables, make sure they get copied to first-level instance variables

// test AbstractController constructor for option_overrides to make sure they are overidden

// test AbstractController constructor  to make sure  initialize() is called if it is an option

// test AbstractController constructor  to make sure  on_initialize() is called if it is an option





