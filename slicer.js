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
  var slicingFrameIndexes = new Array();

  var slicer = {
    /**
     * @brief setInputBuffer sets the input buffer of the slicer and slices it.
     * @param b the buffer to set as input and slice.
     */
    setInputBuffer: function(b) {
      inputBuffer = b;

      // slice slice slice...

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

