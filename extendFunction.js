function extendFunction(fnPropertyRef, addedFunctionality) {
  var undefined;
  var oldFn, propertyArray;
  if (Object.prototype.toString.call(fnPropertyRef) == '[object String]') {
    oldFn = window || global;
    propertyArray = fnPropertyRef.split('.');
    while (propertyArray.length) { //while it's not zero (zero is falsey in javascript)
      try {
        oldFn = oldFn[propertyArray[0]];
        //on last iteration, we assume oldFn is a function, and catch the error if it isn't
      } catch (e) {
        if (oldFn === undefined) {
          throw new Error(
            'Can\'t extend function ' + fnPropertyRef + ' because ' +
            fnPropertyRef.replace(propertyArray.join('.'), '').replace(/(\.$)/g, '') + ' is not defined'
          );
        } else {
          throw e;
        }
      }
      
      //remove first item since that's valid and we've accessed the property, and assigned that property to oldFn
      propertyArray.shift();
    }
  } else {
    //else fnPropertyRef is actually the oldFn, or at least we'll assume so and catch the error if it isn't
    oldFn = fnPropertyRef;
  }

  function extendedFunction() {
    var args = Array.prototype.slice.call(arguments); //we use Array.prototype.slice instead of [].slice because it doesn't instantiate a new array

    //modify oldFn to track if it was called
    var called = false;
    var orig_oldFn = oldFn;
    oldFn = function () {
      called = true;
      try {
        return orig_oldFn.apply(this, Array.prototype.slice.call(arguments));
        //we use standard dynamic `arguments` instead of `args` because there are not necessarily always the same
        //if a user modifies the arguments they call originalFunction with (extendFunction(function(args, originalFunction){ .. ) then we have to respect that
      } catch (e) {
        //above we assume oldFn is a function if it's not a string (for efficiency) - here, we catch and correct if it wasn't a function.
        //yes, it's more efficient to originally assume it's a function
        if (Object.prototype.toString.call(orig_oldFn) != '[object Function]') {
          throw new Error(fnPropertyRef + ' is not a function. ' + fnPropertyRef + ' toString is:' +
                          orig_oldFn + ' and is of type:' + typeof orig_oldFn);
        } else {
          throw e;
        }
      }
    };

    var oldRet;
    var newRet = addedFunctionality.call(this, args, oldFn);
    if (!called) {
      called = false; // reset in case a function dynamically calls the oldFn
                      // TODO api to tell extendFunction that oldFn will be called asynchronously
      oldRet = oldFn.apply(this, args);
    }

    if (newRet === undefined) {
      return oldRet;
    } else {
      return newRet;
    }
  }
 
  if (s && s.length === 0) {
    eval('(window || global).' + fnPropertyRef + ' = ' + extendedFunction.toString());
  } else {
    return extendedFunction;
  }
}
