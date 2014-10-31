var test = require( 'tape' ) ,
    jsdom = require( "jsdom" ) ,
    fs = require( "fs" ) ,
    jquery = fs.readFileSync( "../lib/jquery.2.1.1.min.js", "utf-8" ) ,
    BrowserRancho = fs.readFileSync( "../dist/rancho.js", "utf-8" ) ,
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


// test ClassExtend .extend break-the-chain-type inheritence and logic around Surrogate.prototype  and __super__
test( 'ClassExtend.extend surrogate and super pattern 1', function ( t ) {

    var protos = {
        isproto : true , 
    };

    var Coat = Rancho.ClassExtend.extend( protos, {} );
    var Pancho = Coat.extend( {},{} );
    var pancho = new Pancho();
    

    //
    // we need to check three things:
    // 1. that we have access to var from instance ( proves inheritence )
    // 2. that var is really accessible through the __super__
    // 3. that var is not on the instance
    // 4. that the child.constructor and the child.constructor.prototype.constructor are the equivalent ( proves we can't access the parent and break the chain inheritance )
    // 5. that the child.constructor.prototype and the child.constructor.prototype.constructor.prototype are the equivalent ( proves we can't acces the parent and break the chain inheritance )
    //
    t.equal( pancho.isproto, protos.isproto );
    t.equal( pancho.constructor.__super__.isproto, protos.isproto );
    t.equal( pancho.hasOwnProperty( 'isproto' ), false );
    t.deepEqual( pancho.constructor, pancho.constructor.prototype.constructor );
    t.deepEqual( pancho.constructor.prototype, pancho.constructor.prototype.constructor.prototype );
    t.equal( pancho instanceof Coat, true );
    t.equal( pancho instanceof Pancho, true );
    t.end();

});

test( 'ClassExtend.extend surrogate and super pattern 2', function ( t ) {

    var protos = {
        isproto : true , 
    };

    var Coat = function(){}; 
    Coat.prototype = protos;
    Coat.extend = Rancho.ClassExtend.extend;
    var Pancho = Coat.extend( {},{} );
    var pancho = new Pancho();
    

    //
    // we need to check three things:
    // 1. that we have access to var from instance ( proves inheritence )
    // 2. that var is really accessible through the __super__
    // 3. that var is not on the instance
    // 4. that the child.constructor and the child.constructor.prototype.constructor are the equivalent ( proves we can't access the parent and break the chain inheritance )
    // 5. that the child.constructor.prototype and the child.constructor.prototype.constructor.prototype are the equivalent ( proves we can't acces the parent and break the chain inheritance )
    //
    t.equal( pancho.isproto, protos.isproto );
    t.equal( pancho.constructor.__super__.isproto, protos.isproto );
    t.equal( pancho.hasOwnProperty( 'isproto' ), false );
    t.deepEqual( pancho.constructor, pancho.constructor.prototype.constructor );
    t.deepEqual( pancho.constructor.prototype, pancho.constructor.prototype.constructor.prototype );
    t.equal( pancho instanceof Coat, true );
    t.equal( pancho instanceof Pancho, true );
    t.end();

});

// test ClassExtend .extend with prototype props make sure child overrides parent
test( 'ClassExtend.extend surrogate and super pattern 2', function ( t ) {

    var protos = {
        isproto : true , 
    };

    var Coat = function(){}; 
    Coat.prototype = protos;
    Coat.extend = Rancho.ClassExtend.extend;
    var Pancho = Coat.extend( { isproto : false },{} );
    var pancho = new Pancho();
    
    //
    // we need to check three things:
    // 1. that child overrides parent of same name
    // 2. that __super__ still has access to proto
    // 3. that constructor.prototype still points to child
    // 4. that these are not own properties
    //
    t.equal( pancho.isproto, false );
    t.equal( pancho.constructor.__super__.isproto, true );
    t.equal( pancho.constructor.prototype.isproto, false );
    t.equal( pancho.hasOwnProperty( 'isproto' ), false );
    t.equal( pancho instanceof Coat, true );
    t.equal( pancho instanceof Pancho, true );
    t.end();

});



// test AbstractController constructor with regular variables, make sure they get copied to first-level instance variables and override proto props
test( 'AbstractController make sure first-level instance variables override protos', function ( t ) {

    var generic_fn = function(){ this.toots = 'hoots' };
    var protos = {
        isproto : true , 
    };

    var Coat = Rancho.AbstractController.extend( protos, {} );
    var pancho = new Coat({
        isproto : false ,
        junk : 'trunk' ,
        happy : true ,
        nested : { 'yep' : true } , 
        fn : generic_fn ,
    });
    
    t.equal( pancho.isproto, false );
    t.equal( pancho.constructor.prototype.isproto, true ); // make sure proto is still true
    t.equal( pancho.hasOwnProperty( 'isproto' ), true );
    t.equal( pancho.junk, 'trunk' );
    t.equal( pancho.happy, true );
    t.deepEqual( pancho.nested, { 'yep' : true } );
    t.deepEqual( pancho.fn, generic_fn );
    t.equal( pancho instanceof Coat, true );
    t.end();

});


// test AbstractController constructor with  _selectors and make sure they converted
jsdom.env( {
    html : "<html><body><div id='foo'>HOTDAMN!</div></body></html>" ,
    src : [jquery, BrowserRancho] ,
    done : function (errors, window) {

        var $ = window.$;
        var Rancho = window.Rancho;



        test( 'AbstractController make sure _select magic works', function ( t ) {

            var Coat = Rancho.AbstractController.extend( {}, {} );
            var coat = new Coat({
                foo_selector : 'div#foo' ,
            });  

            t.notEqual( typeof coat.$foo, 'undefined' );
            t.equal( coat.$foo.text(), 'HOTDAMN!' );
            t.equal( coat instanceof Coat, true );
            t.end();

        });

    }
} );


// test AbstractController constructor for option_overrides to make sure they are overidden

// test AbstractController constructor  to make sure  initialize() is called if it is an option

// test AbstractController constructor  to make sure  on_initialize() is called if it is an option





