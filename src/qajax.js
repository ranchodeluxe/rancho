var Q = require( 'q' );
 
module.exports = {
 
    qajax: function (options) {
        options || ( options = {} )
 
        var deferred = Q.defer();
 
        var params = options.params || {};
        var jqxhr_options = {
            headers: options.headers || {} ,
            url: options.url ,
            async: options.async || true ,
            dataType: "json" ,
            data: JSON.stringify( params ),
            type: options.verb || 'GET'
        };
        var jqxhr = $.ajax(jqxhr_options);
        jqxhr.success(function (data, status, xhr) { 
            deferred.resolve( data );
        });
        jqxhr.error(function (jqXHR, status, error) {
            deferred.reject(new Error(error)); // stop all invocations in the chain
        });
 
        var timeout_millisecs = options.timeout_millisecs || 45000; // 45 second timeout
        setTimeout( function () {
            deferred.reject(
                new Error("[ TIMEOUT ]: request timeout exceeded")
            );
            jqxhr.abort();
        }, timeout_millisecs );
 
        return deferred.promise;
    },
 
};
