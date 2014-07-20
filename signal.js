/**
 * @brief makeSignal create a signal object.
 * Once a signal is created, you can connect/disconnect functions to/from it.
 * When you call trigger on the signal, the connected functions are called with
 * the arguments you passed to emit.
 * @note When calling the connected functions, 'this' will be set to the global
 * object window. Use 'bind' if you want to connect method of objects and keep
 * the original this.
 */
function makeSignal() {
  var connectedFunctions = new Array();

  var signal = {
    connect: function(fun) {
      // todo: assert that a function is passed
      return connectedFunctions.push(fun) - 1;
    },

    disconnect: function(connectionId) {
      if (!connectionId) {
        // clear the connectedFunction array => disconnect everything.
        connectedFunctions = new Array();
      }
      else {
        connectedFunctions[connectionId] = undefined
      }
    },

    trigger: function() {
      for (var i = 0; i < connectedFunctions.length; i++) {
        if (connectedFunctions[i] === undefined) {
          continue;
        }
        connectedFunctions[i].apply(window, arguments)
      }
    }
  };

  return signal;
}
