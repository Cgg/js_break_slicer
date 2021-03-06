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

function makeFrameToPixConverter(bufferLength, canvasWidth) {
  return function(frame) {
    var factor = Math.ceil(bufferLength / canvasWidth);
    return Math.floor(frame / factor);
  }
}

function paintSlices(canvas, slices, bufLength, beatColor) {
  fToPix = makeFrameToPixConverter(bufLength, canvas.width);

  var ctx = canvas.getContext('2d');
  ctx.save();

  // paint the beats indexes
  ctx.strokeStyle = beatColor;

  ctx.beginPath();
  for (var i = 0; i < slices.length; i++) {
    ctx.moveTo(fToPix(slices[i].beatIdx) + 0.5, 0);
    ctx.lineTo(fToPix(slices[i].beatIdx) + 0.5, canvas.height);
  }
  ctx.stroke();

  // paint the slices overlays
  ctx.strokeStyle = 'rgab(0, 0, 0, 0)';

  var leftBound = 0;
  var rightBound;
  var i = 0;
  for (i = 0; i < slices.length; i++) {
    rightBound = fToPix(slices[i].endIdx);

    ctx.fillStyle = slices[i].color;
    ctx.fillRect(leftBound, 0, rightBound - leftBound, canvas.height);

    leftBound = rightBound;
  }
  ctx.restore();
}
