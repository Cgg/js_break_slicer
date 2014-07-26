/**
 * @brief makeSlicer
 * Make a buffer slicer. This takes an input buffer (setInputBuffer), finds the
 * slicing points on drum kicks and randomly rearranges the slices. This
 * produces the sliced buffer that you can retrieve with slicedBuffer.
 */
function makeSlicer() {
  var inputBuffer = null;
  var slices = new Array();

  var slicedBuffer = null;
  var slicedBeatFrameIndexes = new Array();
  var slicedSlicingFrameIndex = new Array();

  var chunkWidth = 500; // in audio frames
  var hbWidth = 10; // in chunks

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
    var eMean = mean(e, 0, hbWidth);
    var V = variance(e, 0, hbWidth, eMean);
    var C = (-0.0025714 * V) + 1.51422857;

    for (var i = 0; i < hbWidth; i++) {
      if (e[i] > C * eMean) {
        beatIdx.push(i);
      }
    }

    for (var i = hbWidth; i < e.length; i++) {
      var eMean = mean(e, i - hbWidth, hbWidth);
      var V = variance(e, i - hbWidth, hbWidth, eMean);
      var C = (-0.0025714 * V) + 1.51422857;

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
    var slices = new Array();

    // for each beat look  right for the min energy until the next beat.
    // dont do that for the last beat, since we go to the end of the buffer
    // anyway.
    var min = energyArray[beatIdx[0]];
    var minIdx = beatIdx[0];
    for (var m = beatIdx[0] + 1; m < beatIdx[1]; m++) {
      if (energyArray[m] < min) {
        min = energyArray[m];
        minIdx = m;
      }
    }
    slices.push({beginIdx: 0, endIdx: minIdx, beatIdx: beatIdx[0]})

    for (var i = 1; i < beatIdx.length - 1; i++) {
      var min = energyArray[beatIdx[i]];
      var minIdx = beatIdx[i];

      for (var m = beatIdx[i] + 1; m < beatIdx[i + 1]; m++) {
        if (energyArray[m] < min) {
          min = energyArray[m];
          minIdx = m;
        }
      }

      slices.push({beginIdx: slices[i - 1].endIdx + 1,
        endIdx: minIdx, beatIdx: beatIdx[i]})
    }

    slices.push({beginIdx: slices[slices.length - 1].endIdx + 1,
      endIdx: energyArray.length - 1, beatIdx: beatIdx[beatIdx.length - 1]})

    return slices;
  }

  function chunkToFrameIdx(chunkIndexes, chunkWidth) {
    var result = new Array(chunkIndexes.length);
    for (var i = 0; i < chunkIndexes.length; i++) {
      result[i] = chunkIndexes[i] * chunkWidth;
    }
    return result;
  }
  function convertSlices(slices, chunkWidth) {
    var result = new Array(slices.length);
    for (var i = 0; i < slices.length; ++i) {
      result[i] = {
        beginIdx: slices[i].beginIdx * chunkWidth,
        endIdx: slices[i].endIdx * chunkWidth,
        beatIdx: slices[i].beatIdx * chunkWidth};
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
    slices = findSlicingIndexes(beatIdx, e);

    // slice :

    slices = convertSlices(slices, chunkWidth);
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

    slices: function() {
      return slices;
    }
  };

  return slicer;
}

