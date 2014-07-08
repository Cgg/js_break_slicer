/**
 * Painters gonna paint.
 */
function bufferPainter(canvas, buffer) {
  if (!canvas || !buffer) {
    return;
  }

  var width = canvas.width;
  var height = canvas.height;

  var ctx = canvas.getContext('2d');
  var b = buffer.getChannelData(0);

  ctx.clearRect(0, 0, width, height);

  // factor is the amount of audio frames per pixel on the canvas (width-wise)
  var factor = Math.ceil(b.length / width);
  var max = 0;

  var rmsValues = Array(width);

  // rms by chunk to determine a normalization factor
  for (var i = 0; i < rmsValues.length; i++) {
    rmsValues[i] = rms(b, i * factor, factor);
    max = Math.max(max, rmsValues[i]);
  }

  var boost = (0.5 / max) * height;

  // plot the rms values in a fancy way
  for (var i = 0; i < rmsValues.length; i++) {
    var rmsVal = rmsValues[i] * boost;
    rmsVal = Math.max(1.0, rmsVal);

    ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
    ctx.fillRect(i, height / 1.3, 1.5, -rmsvalue * 1.5);
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(i + 1, height / 1.3, 1.5, +rmsvalue * 0.5);
  }
}

