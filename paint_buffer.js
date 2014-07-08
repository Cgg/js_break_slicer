/**
 * Painters gonna paint.
 */
function paintBuffer(canvas, buffer) {
  if (!canvas || !buffer) {
    return;
  }

  var width = canvas.width;
  var height = canvas.height;

  var ctx = canvas.getContext('2d');
  ctx.save();
  var b = buffer.getChannelData(0);

  ctx.clearRect(0, 0, width, height);

  // factor is the amount of audio frames per pixel on the canvas (width-wise)
  var factor = Math.ceil(2 * b.length / width);
  var rmsValues = Array(Math.ceil(width / 2));
  var max = 0;

  // rms by chunk to determine a normalization factor
  for (var i = 0; i < rmsValues.length; i++) {
    rmsValues[i] = rms(b, i * factor, factor);
    max = Math.max(max, rmsValues[i]);
  }

  // plot the rms values in a fancy way
  var boost = (0.5 / max) * height;
  var j = 0;
  for (var i = 0; i < rmsValues.length; i++) {
    var rmsVal = rmsValues[i] * boost;
    rmsVal = Math.max(1.0, rmsVal);

    ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
    ctx.fillRect(j++, height / 1.3, 1.5, -rmsVal * 1.5);
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(j++, height / 1.3, 1.5, +rmsVal * 0.5);
  }

  ctx.restore();
}

function paintBufferWithSlicesOverlay(canvas, buffer, slicingFrameIndexes) {
  paintBuffer(canvas, buffer);

  function frameToPix(frame) {
    var factor = Math.ceil(buffer.length / canvas.width);
    return Math.floor(frame / factor);
  }

  var ctx = canvas.getContext('2d');
  ctx.save();
  ctx.strokeStyle = "rgba(255, 0, 0, 0.7)";

  ctx.beginPath();
  for (var i = 0; i < slicingFrameIndexes.length; i++) {
    ctx.moveTo(frameToPix(slicingFrameIndexes[i]) + 0.5, 0);
    ctx.lineTo(frameToPix(slicingFrameIndexes[i]) + 0.5, canvas.height);
  }
  ctx.stroke();

  ctx.restore();
}

