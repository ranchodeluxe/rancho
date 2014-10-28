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
**  test Racho.AbstractController
**
*/

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


// test ClassExtend .extend  with simple constructor

// test ClassExtend .extend  with static and prototype props to make sure they get put in the same place at 2 levels 

// test ClassExtend .extend  with  __super__ to make sure it still has reference to Parent.statics and own properties

// test AbstractController constructor with selectors and regular variables, make sure they get copied to first-level instance variables

// test AbstractController constructor for option_overrides to make sure they are overidden

// test AbstractController constructor  to make sure  initialize() is called if it is an option

// test AbstractController constructor  to make sure  on_initialize() is called if it is an option





