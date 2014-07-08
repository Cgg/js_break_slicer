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

  var player = {
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
      if (audioSource) {
        audioSource.stop(0);
        audioSource = null;
      }
      playing = false;
    }
  };

  return player;
}

