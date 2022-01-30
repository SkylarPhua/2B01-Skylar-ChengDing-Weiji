/* https://github.com/tracker1/format.js */
(function(generator){

  if (typeof module !== 'undefined' && module.exports) {

    // node.js
    module.exports = generator();

  } else if (typeof exports !== 'undefined') {

    //commonjs
    exports.stringformat = generator();  

  } else if (typeof define === 'function' && define.amd) {

    //AMD
    define(generator);

  } else {

    // global method (window fallback)
    this.format = generator();

  }

}(function() {

  // keep old bindings against String
  var lastBind = {};

  //methods to bind stringFormat against String global type
  stringformat.bind = bindStringFormat;
  stringformat.unbind = unbindStringFormat;

  //placeholder for advanced/custom formatters
  stringformat.formatters = [];

  //return the stringFormat method
  return stringformat;


  //returns true for null, undefined and empty string
  function isEmpty(obj) {
    if (typeof obj == 'undefined' || obj === null || obj === '') return true;
    if (typeof obj == 'number' && isNaN(obj)) return true;
    if (obj instanceof Date && isNaN(Number(obj))) return true;
    return false;
  }

  //gets the format method to use for the object instance
  //    don't expose this method, it isn't safe for use outside this script
  function getFormatter(obj) {
    //it's a string, undefined or null, use default toString method
    if (typeof obj == "string" || isEmpty(obj)) {
      return String.prototype.toString;
    }
  
    //it has a format method
    if (typeof obj.format === "function") {
      return obj.format;
    }

    //check formatters
    for (var i=0; i<stringformat.formatters.length; i++) {
      var t = stringformat.formatters[i].type;
      if (source instanceof t || typeof src === t) {
        return stringformat.formatters[i].format
      }
    }
    
    //determin the constructor base & prototype to use
    var ctor = function(o) {
      if (o instanceof Date) return Date;
      if (typeof o === 'number') return Number;
      if (typeof o === 'boolean') return Boolean;
      return o.constructor;
    }(obj);
    var proto = ctor.prototype; //base prototype

    //try to find a formatter via the constructor/prototype chain
    while (ctor) {
      if (typeof ctor.format == 'function') return ctor.format
      ctor = ctor.prototype;
    }

    //object has a toString method use it
    if (typeof obj.toString == 'function') return obj.toString;

    //prototype has a toString method use it
    if (proto && typeof proto.toString == 'function') return proto.toString;

    //use the string's toString method - final resort
    return String.prototype.toString;
  }
  

  //convert an object to a string with an optional format to use
  function stringFromAny(obj, format) {
    //the object is nothing, use an empty string
    if (isEmpty(obj))
      return "";
      
    //get the formatter to use for the object
    var formatter = getFormatter(obj);

    //a formatter was found, use it
    if (formatter) {
      if (isEmpty(format)) {
        try {
          return formatter.call(obj);
        } catch(err) {
          //errors with Microsoft Ajax Toolkit
          try {
            return formatter.call(obj,"");  
          } catch(err1) {
            if (typeof console != "undefined") (console.error || console.log)(err1);
            return ""; //unable to format
          }
        }
      } else {
        return formatter.call(obj,format);
      }
    }
    else
      return ""; //no formatter, use empty string, this should *NEVER* happen.
  }
  
  
  //basic format, used when a single, or no arguments are passed in
  function basicFormat(source) {
    //null argument, return empty string
    if (isEmpty(source))
      return "";
    
    //it's a string, return it as-is
    if (typeof source == "string")
      return String(source);

    //it has a formatter, use that
    if (source && source.format)
      return source.format();
    
    //it's an array, use it as one - recursive call
    if (source && source.length) 
      return String.format.apply(source[0], Array.prototype.slice.call(arguments, 0, 1));

    //force it to a string
    return String(source);
  }
  
  //normalize arguments into parameter array
  function setParams() {
    var undef; //undefined value

    //remove first item from stack
    var params = Array.prototype.slice.call(arguments, 1);
    
    //only one param
    if (params.length == 1) {
      //set the params to the instance of the one param
      params = params[0];

      //use an empty string for null and undefined valuse
      if (params === null || params === undef) return [''];
      
      //reference to the type of params
      var t = typeof params;
      
      //if it (has format or not an object) and not an array)
      if ((params.format || t != 'object') && t != 'array' )
        params = [ params ]; //put the param inside an array
    }
    
    //return normalized input parameters
    return params;
  }
  
  function stringformat(source, params) {
    //only one argument, force it to a proper string.
    if ( arguments.length < 2 ) {
      basicFormat(source);
    }
      
    //normalize the input parameters
    params = setParams.apply(null, arguments);
    var outerLength = arguments.length;
      
    //run a replace method against the source string, matching against
    //  named/numbered parameters
    //
    //  will match on escaped braces {{ or }}
    //    or an embedded code {code} with optional format {code:format}
    var ret = source.replace(
      /\{\{|\}\}|\{([^}: ]+?)(?::([^}]*?))?\}/g, 
      function(match, num, format) {
        if (match == "{{") return "{"; //unescape the nested {
        if (match == "}}") return "}"; //unescape the nested }
        if (typeof params[num] == "undefined") {
          //if there was only one parameter, and the match is "0", and there's no "0" in params, use the params as the binding formatter
          //should fix "... {0:...}".toFormat(singleItem)
          if (num === "0" && outerLength == 2) return stringFromAny(params, format);

          return match; //no param value available
        }

        return stringFromAny(params[num], format); //convert the input replacement to a proper string
      }
    );
    return ret;
  }

  function stringFormatInstance(params) {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(this);
    return stringformat.apply(null, args);
  }

  // bind against String
  function bindStringFormat(methodName) {
  	//if methodName isn't a string, use "format"
  	methodName = typeof(methodName) === 'string' ? methodName : 'format';

    //save any existing bind methods - if there is already one, keep it
  	lastBind[methodName] = lastBind[methodName] || [
      String[methodName]
      ,String.prototype[methodName]
    ]

  	String[methodName] = stringformat;
  	String.prototype[methodName] = stringFormatInstance;
  }

  // unbind method against String
  function unbindStringFormat(methodName) {
  	//if methodName isn't a string, use "format"
  	methodName = typeof(methodName) === 'string' ? methodName : 'format';

    //get old bindings
    var last = lastBind[methodName];

    //nothing to unbind to
    if (!lastBind[methodName]) return; //nothing set
    if (String[methodName] !== stringFormat) return; //not currently bound

    //remove current bindings
    delete String[methodName];
    delete String.prototype[methodName];

    //re-establish original bindings
    if (typeof(last[0]) !== 'undefined') String[methodName] = last[0];
    if (typeof(last[1]) !== 'undefined') String.prototype[methodName] = last[1];

    //remove binding history
    delete lastBind[methodName];
  }
  
}));
