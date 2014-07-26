/**
 * @brief makeProgressPainter return an object who purpose is to paint a
 * progress bar on a canvas. It uses the whole canvas area.
 * @param canvas the canvas on which the progress bar will be painted.
 * @return a progressPainter object
 * @note this object assumes the progress it receives stays between 0 and 1.
 */
function makeProgressPainter(canvas) {
  var ctx = canvas.getContext('2d')
  var lastProgressPainted = 0;

  /**
   * @brief setProgress set a new progress to display
   * @param newProgress the newProgress to display on the progressBar. It is
   * assumed that the progress is between 0 and 1, 0 meaning that the bar will
   * be empty and 1 it will be full.
   */
  var progressPainter = {
    setProgress: function(newProgress) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 0, 0, 1)';

      if (newProgress < lastProgressPainted) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width * newProgress, canvas.height);

        lastProgressPainted = newProgress;
      }
      else if (newProgress - lastProgressPainted >= 1 / canvas.width) {
        ctx.fillRect(lastProgressPainted * canvas.width, 0,
          (newProgress - lastProgressPainted) * canvas.width, canvas.height);

        lastProgressPainted = newProgress;
      }

      ctx.restore()
    }
  }

  return progressPainter;
}

