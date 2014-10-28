var date_formatters = require( './dates.js' );

var add_commas = function( nstr ) {
    nstr += ''; 
    x = nstr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : ''; 
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }   
    return x1 + x2; 
};

var prettify_money = function( n, precision ) {
   return add_commas( parseFloat( n ).toFixed( precision ) );
}

var is_int = function( n ) {
   return typeof n === 'number' && parseFloat(n) == parseInt(n, 10) && !isNaN(n);
}

 
module.exports = {

    dates : date_formatters ,

    prettify_money : prettify_money ,

    add_commas : add_commas ,
    
} 
