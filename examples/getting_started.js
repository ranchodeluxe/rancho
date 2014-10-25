

var Person = Rancho.AbstractController.extend({
    nonstatic : true ,
},{
    static : true ,
});

var p = new Person({
    __name__ : 'Person' ,
    foo_selector :  "#foo" ,
    name : "Greg" ,
    age : 10 ,
});

var p1 = new Person({
    __name__ : 'Person1' ,
    foo_selector :  "#blah" ,
    name : "Bob" ,
    age : 15 ,
});

/*
**
**  get an idea of what's where inheritence wise
**
*/
// first-level instance variables
console.log( p );
console.log( p1 );
// constructors are the same
console.log( p.constructor );
console.log( p1.constructor );
// notice statics 
console.log( p.constructor.static );
console.log( p1.constructor.static );
// prototype instance variables are same ( can be overrided )
console.log( p.constructor.prototype );
console.log( p1.constructor.prototype );
// passes instanceof
console.log( p instanceof Person );
console.log( p1 instanceof Person );
