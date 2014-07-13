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

  var chunkWidth = 500; // in audio frames
  var hbWidth = 20; // in chunks

  function slice() {
    if (!inputBuffer) {
      return;
    }

    slicingFrameIndexes = Array();

    var b = inputBuffer.getChannelData(0);
    var e = Array(Math.ceil(b.length / chunkWidth));
    // compute the rms for each chunk in the sample.
    for (var i = 0; i < e.length; i++) {
      e[i] = rms(b, i * chunkWidth, chunkWidth);
    }

    // compare each chunk's rms with the mean rms of the previous history and
    // find the peaks (stored in tmpIdx).
    var tmpIdx = Array();
    for (var i = hbWidth + 1; i < e.length; i++) {
      var eMean = 0;
      for(var j = i - hbWidth; j < i; j++) {
        eMean += e[j];
      }
      eMean /= hbWidth;

      if(e[i] > 1.3 * eMean) {
        tmpIdx.push(i);
      }
    }

    // curate the tmpIdx array : find groups of peaks and keep only one for
    // each group.
    for (var i = 0; i < tmpIdx.length - 1; i++) {
      if(tmpIdx[i + 1] > tmpIdx[i] + 1) {
        continue;
      }

      var j = i + 2;
      while (j < tmpIdx.length && tmpIdx[j] == tmpIdx[j - 1] + 1) {
        j++;
      }
      //tmpIdx.splice(i, j - i);
    }

    // translate tmpIdx values into audio frame indexes.
    for (var i = 0; i < tmpIdx.length; i++) {
      slicingFrameIndexes[i] = tmpIdx[i] * chunkWidth;
    }

    slicedBuffer = b;
  };

  var slicer = {
    /**
     * @brief setInputBuffer sets the input buffer of the slicer and slices it.
     * @param b the buffer to set as input and slice.
     */

    setInputBuffer: function(b) {
      inputBuffer = b;
      slice();
    },

    chunkWidth: function() {
      return chunkWidth;
    },

    setChunkWidth: function(width) {
      if (chunkWidth != width) {
        chunkWidth = width;
        slice();
      }
    },

    historyBufferWidth: function() {
      return hbWidth;
    },

    setHistoryBufferWidth: function(width) {
      if (width != hbWidth) {
        hbWidth = width;
        slice();
      }
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

