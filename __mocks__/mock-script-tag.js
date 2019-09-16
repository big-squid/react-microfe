/**
 * A module for mocking a script tag and its response for JSDOM
 * Pass a beforeOnload callback to fake whatever you need to with the window and the DOM
 * This is used in the tests specifically to capture the side effect of loading a microfe script
 */
module.exports = (document, beforeOnload) => {
  document.createElement = (function(
    createElement, // the native one
    createResponse // the function "in charge"
  ) {
    return function(nodeName) {
      var result, src;
      // if we are creating a script
      if (/^script$/i.test(nodeName)) {
        // result will be a place holder
        result = createElement.call(document, 'script');
        // we need to monitor the src property
        Object.defineProperty(result, 'src', {
          get: function() {
            return src;
          },
          // when set ...
          set: function($src) {
            setTimeout(() => {
              beforeOnload && beforeOnload($src);
              result.onload();
            }, 100);
          }
        });
      } else {
        // just return the element
        result = createElement.call(document, nodeName);
      }
      return result;
    };
  })(
    document.createElement,

    // must return a string
    function(src) {
      // this points to the current script
      // src is the address
      // if we know the callback ...

      if (/callback=([^&]+)/.test(src)) {
        return RegExp.$1 + '(' + JSON.stringify({ dummy: 'data' }) + ')';
      }
    }
  );
};
