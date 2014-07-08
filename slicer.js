/**
 * @brief makeSlicer
 * Make a buffer slicer. This takes an input buffer (setInputBuffer), finds the
 * slicing points on drum kicks (that you can retrieve with
 * slicingFrameIndexes) and randomly rearranges the slices. This produces the
 * sliced buffer that you can retrieve with slicedBuffer.
 */
function makeSlicer() {
  var inputBuffer = null;
  var slicedBuffer = null;
  var slicingFrameIndexes = null;

  var slicer = {
    /**
     * @brief setInputBuffer sets the input buffer of the slicer and slices it.
     * @param b the buffer to set as input and slice.
     */
    setInputBuffer: function(b) {
      inputBuffer = b;

      // slice slice slice...
      slicingFrameIndexes = Array();
      var b = inputBuffer.getChannelData(0);
      var chunkWidth = 1024;
      var e = Array(Math.ceil(b.length / chunkWidth));
      var eMean = 0;
      for (var i = 0; i < e.length; i++) {
        e[i] = rms(b, i * chunkWidth, chunkWidth);
        eMean += e[i];
      }
      eMean /= e.length;

      var C = 1.3;
      var threshold = eMean * C;
      for (var i = 0; i < e.length; i++) {
        if (e[i] > threshold) {
          slicingFrameIndexes.push(i * chunkWidth);
        }
      }

      slicedBuffer = b;
    },

    /**
     * @brief inputBuffer getter for the vanilla input buffer.
     * @return the input buffer.
     */
    inputBuffer: function() {
      return inputBuffer;
    },

    /**
     * @brief slicedBuffer getter for the sliced and rearranged buffer.
     * @return the sliced buffer.
     */
    slicedBuffer: function() {
      return slicedBuffer;
    },

    /**
     * @brief slicingFrameIndexes
     * @return an array containing the frame indexes of the original buffer
     * where the slicing occured.
     */
    slicingFrameIndexes: function() {
      return slicingFrameIndexes;
    }
  };

  return slicer;
}

