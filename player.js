/**
 * @brief makePlayer create an audio player for a given AudioContext. The
 * player can then start and stop looping playback for given buffers.
 * @param audioContext the webAudio AudioContext
 * @return the player object.
 */
function makePlayer(audioContext) {
  var audioCtx = audioContext;
  var audioSource = null;
  var playing = false;

  var currentProgress = 0;
  var progressChunk = 0;
  var progressUpdateRate = 1000/25.0;
  var progressChangedSignal = makeSignal();
  var updateProgressInterval = -1

  var updateProgress = function() {
    currentProgress += progressChunk;
    if(currentProgress > 1) {
      currentProgress = 0
    }
    progressChangedSignal.trigger(currentProgress)
  }

  var player = {
    /**
     * @brief progressChangedSignal signal sent when the progress of the
     * playback has changed.
     * @param: current progress between 0 and 1.
     */
    progressChangedSignal: function() {
      return progressChangedSignal;
    },

    /**
     * @brief isPlaying
     * @return true if the player is playing, false otherwise.
     */
    isPlaying: function() {
      return playing;
    },

    /**
     * @brief startPlayback start looping over a given buffer in the speakers.
     * @param buf a webAudio AudioBuffer
     * @return true if the playback was started, false otherwise.
     */
    startPlayback: function(buf) {
      this.stopPlayback();

      if (!buf) {
        return false;
      }

      currentProgress = 0;
      progressChunk = 1 / (buf.duration / (progressUpdateRate / 1000));
      updateProgressInterval = setInterval(updateProgress, progressUpdateRate)

      audioSource = audioCtx.createBufferSource();
      audioSource.buffer = buf;
      audioSource.loop = true;
      audioSource.connect(audioCtx.destination);

      audioSource.start();

      playing = true;
      return true;
    },

    /**
     * @brief stopPlayback stop the current playback if any.
     */
    stopPlayback: function() {
      clearInterval(updateProgressInterval);
      progressChangedSignal.trigger(0);
      if (audioSource) {
        audioSource.stop(0);
        audioSource = null;
      }
      playing = false;
    }
  };

  return player;
}

