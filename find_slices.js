/**
 * @brief findSlices finds the slices in an input audio buffer.
 * @param inputBuffer the audio buffer to process
 * @param chunkWidth the number of audio frames in each chunk, for the beat
 * detection algorithm.
 * @param historyBufferWidth the width of the history buffer for the beat
 * detection. Exprimed in number of chunks (see above).
 * @return an array containing the slices found from the input buffer.
 *
 * A slice is a single beat and its surroundings. The sliceFinder returns an
 * array of slices, where each slice includes a start and end index, as well as
 * a beat index. All indexes in the returned slices are exprimed in audio frame
 * indexes from the input buffer.
 */

function findSlices(inputBuffer, chunkWidth, historyBufferWidth) {
  var slices = new Array();

  var slicedBuffer = null;
  var slicedBeatFrameIndexes = new Array();
  var slicedSlicingFrameIndex = new Array();

  // given an array of energy values (RMS), this function will find the peaks in
  // it and return an array containing the indexes of these peaks.
  function findBeatIndexes(energyArray) {
    var e = energyArray;
    var hbWidth = historyBufferWidth;

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

  // given an array of beats indexes pointing to places in the energy array
  // passed as the second parameter, find the slices surrounding each beat and
  // return an array of slices.
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

  // convert each slice indexes back to audio frame indexes
  slices.forEach(function(s) {
    s.beginIdx = s.beginIdx * chunkWidth;
    s.endIdx = (s.endIdx + 1)* chunkWidth - 1;
    s.beatIdx = s.beatIdx * chunkWidth;
  });

  slices[slices.length - 1].endIdx = inputBuffer.length - 1

  return slices;
}
