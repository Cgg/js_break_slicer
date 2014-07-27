/**
 * @brief shuffle take an array and shuffle it in place using Fisher-Yates
 * algorithm.
 * @param array the array to shuffle.
 * @return the shuffled array, which is the same as the array passed as param.
 */
function shuffle(array) {
  var result = array.slice(0);
  var m = array.length, i;
  var swapBuf;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    swapBuf = array[m];
    array[m] = array[i];
    array[i] = swapBuf;
  }

  return array;
}

/**
 * @brief cloneAudioBuffer clone an audio buffer
 * @param audioContext the audio context which will create the copy of the
 * input buffer.
 * @param audioBuffer the buffer to clone.
 * @return the cloned buffer.
 */
function cloneAudioBuffer(audioContext, inBuffer) {
  var outBuffer = audioContext.createBuffer(
    inBuffer.numberOfChannels,
    inBuffer.length,
    inBuffer.sampleRate
  );

  for (var i = 0, c = inBuffer.numberOfChannels; i < c; ++i) {
      var od = outBuffer.getChannelData(i),
          id = inBuffer.getChannelData(i);
      od.set(id);
  }

  return outBuffer;
}
