/**
 * @brief makeSlicer
 * Make a buffer slicer. This takes an input buffer (setInputBuffer), finds the
 * slicing points on drum kicks (that you can retrieve with
 * beatFrameIndexes) and randomly rearranges the slices. This produces the
 * sliced buffer that you can retrieve with slicedBuffer.
 */
function makeSlicer() {
  var inputBuffer = null;
  var slicedBuffer = null;
  var beatFrameIndexes = new Array();
  var slicingFrameIndexes = new Array();

  var chunkWidth = 500; // in audio frames
  var hbWidth = 10; // in chunks
  var C = 1.4;

  // given an array of energy values (RMS), this function will find the peaks in
  // it and return an array containing the indexes of these peaks.
  function findBeatIndexes(energyArray) {
    var e = energyArray;

    // compare each chunk's rms with the mean rms of the previous history and
    // find the peaks (stored in beatIdx).
    var beatIdx = new Array();

    // Normally, each chunk is compared with the mean energy of an history
    // buffer located right before it. For the first chunks from 0 to hbWidth,
    // there isnt enough data to work with. So we use the data around the chunks
    // rather than before them.
    var eMean = 0;
    for (var i = 0; i < hbWidth; i++) {
      eMean += e[i];
    }
    eMean /= hbWidth;
    for (var i = 0; i < hbWidth; i++) {
      if (e[i] > C * eMean) {
        beatIdx.push(i);
      }
    }

    for (var i = hbWidth; i < e.length; i++) {
      var eMean = 0;
      for(var j = i - hbWidth; j < i; j++) {
        eMean += e[j];
      }
      eMean /= hbWidth;

      if(e[i] > C * eMean) {
        beatIdx.push(i);
      }
    }

    // beatIdx contains indexes of peaks. It contains lots of contiguous indexes:
    // beatIdx[i+1] = beatIdx[i] + 1 or + 2.
    // For each of these groups, we want to keep only one index, the one
    // corresponding to the highest energy (this is the real peak index);
    for (var i = 0; i < beatIdx.length - 1; i++) {
      if(beatIdx[i + 1] > beatIdx[i] + 3) {
        continue;
      }

      var j = i + 2;
      while (j < beatIdx.length && beatIdx[j] <= beatIdx[j - 1] + 3) {
        j++;
      }

      var maxIdx = i;
      for (var m = i + 1; m < j; m++) {
        if (e[beatIdx[m]] > e[beatIdx[maxIdx]]) {
          maxIdx = m;
        }
      }

      beatIdx.splice(i, j - i, beatIdx[maxIdx]);
    }

    return beatIdx;
  }

  function findSlicingIndexes(beatIdx, energyArray) {
    var slicingIdx = new Array();

    // for each beat look  right for the min energy until the next beat.
    // dont do that for the last beat, since we go to the end of the buffer
    // anyway.
    for (var i = 0; i < beatIdx.length - 1; i++) {
      var min = energyArray[beatIdx[i]];
      var minIdx = beatIdx[i];

      for (var m = beatIdx[i] + 1; m < beatIdx[i + 1]; m++) {
        if (energyArray[m] < min) {
          min = energyArray[m];
          minIdx = m;
        }
      }

      slicingIdx.push(minIdx);
    }

    return slicingIdx;
  }

  function chunkToFrameIdx(chunkIndexes, chunkWidth) {
    var result = new Array(chunkIndexes.length);
    for (var i = 0; i < chunkIndexes.length; i++) {
      result[i] = chunkIndexes[i] * chunkWidth;
    }
    return result;
  }


  function slice() {
    if (!inputBuffer) {
      return;
    }

    // compute the rms for each chunk in the sample.
    var b = inputBuffer.getChannelData(0);
    var e = new Array(Math.ceil(b.length / chunkWidth));
    for (var i = 0; i < e.length; i++) {
      e[i] = rms(b, i * chunkWidth, chunkWidth);
    }

    beatIdx = findBeatIndexes(e);
    slicingIdx = findSlicingIndexes(beatIdx, e);
    // 3. slice!

    beatFrameIndexes = chunkToFrameIdx(beatIdx, chunkWidth);
    slicingFrameIndexes = chunkToFrameIdx(slicingIdx, chunkWidth);
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
     * @brief beatFrameIndexes
     * @return an array containing the frame indexes of the original buffer
     * where beats occured.
     */
    beatFrameIndexes: function() {
      return beatFrameIndexes;
    },

    slicingFrameIndexes: function() {
      return slicingFrameIndexes;
    }
  };

  return slicer;
}

