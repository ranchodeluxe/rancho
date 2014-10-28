( function( def ) {
 
    module.exports = def(); // return
 
})(function() { // definition
 
    var month_names = ['January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September', 'October', 'November', 'December'];
 
    var month_names_abbrev = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
 
    var format_time = function( new_date ){ // formats as 10:08 AM/
 
            var a_p = "";
            var curr_hour = new_date.getHours();
            if (curr_hour < 12) {
               a_p = "am";
            }
            else {
               a_p = "pm";
            }
 
            // handle zero hour
            if (curr_hour == 0) {
               curr_hour = 12;
            }
 
            if (curr_hour > 12) {
               curr_hour = curr_hour - 12;
            }
 
            var curr_min = new_date.getMinutes();
 
            curr_min = curr_min + "";
 
            if (curr_min.length == 1) {
               curr_min = "0" + curr_min;
            }
 
            return curr_hour + ":" + curr_min  + a_p;
 
    };
 
 
    var format_date_forward_slash = function( new_date ){ // formats as month/day/year
 
            return new_date.getMonth()+1 + "/" + new_date.getDate() + "/" + new_date.getFullYear();
 
    };
 
    var format_date_longform = function( new_date ){ // formats as month/day/year
 
            return month_names[ new_date.getMonth() ] + " " + new_date.getDate() + ", " + new_date.getFullYear();
 
    };
 
    var format_date_abbrevform = function( new_date ){ // formats as month/day/year
 
            return month_names_abbrev[ new_date.getMonth() ] + " " + new_date.getDate() + ", " + new_date.getFullYear();
 
    };
 
    var time_date_format = function( date_string ){
 
            var timestamp = Date.parse(date_string);
 
            if ( isNaN(timestamp) === true ) {
                logger( "[ WARNING ]: the date_string was not able to be parsed '" + date_string + "'" );
                return;
            }
 
            var new_date = new Date( date_string );
            var timeformat = format_time( new_date );
            var dateformat = format_date_forward_slash( new_date );
            return dateformat;
    };
 
    var time_date_format_pretty = function( date_string ){
 
            var timestamp = Date.parse(date_string);
 
            if ( isNaN(timestamp) === true ) {
                logger( "[ WARNING ]: the date_string was not able to be parsed '" + date_string + "'" );
                return;
            }
 
            var new_date = new Date( date_string );
            var timeformat = format_time( new_date );
            var dateformat = format_date_forward_slash( new_date );
            return dateformat + " @" + timeformat;
    };
 
    var date_abbrev_format = function( date_string ){
 
            var timestamp = Date.parse(date_string);
 
            if ( isNaN(timestamp) === true ) {
                logger( "[ WARNING ]: the date_string was not able to be parsed '" + date_string + "'" );
                return;
            }
 
            var new_date = new Date( date_string );
            var dateformat = format_date_abbrevform( new_date );
            return dateformat;
    };
 
    var date_forward_slash_formatter = function ( date_string ){
 
            var timestamp = Date.parse(date_string);
 
            if ( isNaN(timestamp) === true ) {
                logger( "[ WARNING ]: the date_string was not able to be parsed '" + date_string + "'" );
                return;
            }
 
            var new_date = new Date( date_string );
            var dateformat = format_date_forward_slash( new_date );
            return dateformat;
    };
 
    var get_time_as_milliseconds = function() { 
        var new_date = new Date(); 
        return ( new_date.getHours() * 60 * 60 * 1000 ) + ( new_date.getMinutes() * 60 * 1000 ); 
    };
 
    return {
        time_date_formatter : time_date_format ,
        time_date_formatter_pretty : time_date_format_pretty ,
        date_longform_formatter : format_date_longform ,
        date_abbrev_formatter : date_abbrev_format,
        get_time_as_milliseconds: get_time_as_milliseconds,
        date_normal_formatter : date_forward_slash_formatter,
    }
});
