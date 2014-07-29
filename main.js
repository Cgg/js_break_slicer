window.onload = function()
{
var audioCtx = new AudioContext();
var inputPlayer = makePlayer(audioCtx);
var outputPlayer = makePlayer(audioCtx);

var inputBuffer;
var slices;
var outputBuffer;
var randomizedSlices;

var sampleCombo = document.getElementById('sample_combo');
var playInputBtn = document.getElementById('play');
var playOutputBtn = document.getElementById('play_output');
var shakeBtn = document.getElementById('shake');
var canvases = document.getElementById('canvases');

var inputBufferCvs = document.getElementById('visu');
inputBufferCvs.width = canvases.offsetWidth;
var sliceOverlayCvs = document.getElementById('slice_overlay');
sliceOverlayCvs.width = inputBufferCvs.width;
var progOverlayCvs = document.getElementById('prog_overlay');
progOverlayCvs.width = inputBufferCvs.width;

var outputBufferCvs = document.getElementById('output_buffer_canvas');
outputBufferCvs.width = inputBufferCvs.width;
var outputOverlayCvs = document.getElementById('output_overlay_canvas');
outputOverlayCvs.width = inputBufferCvs.width;
var outputProgCvs = document.getElementById('output_prog_overlay');
outputProgCvs.width = inputBufferCvs.width;

var inputProgressPainter = makeProgressPainter(progOverlayCvs);
var outputProgressPainter = makeProgressPainter(outputProgCvs);
inputPlayer.progressChangedSignal().connect(inputProgressPainter.setProgress);
outputPlayer.progressChangedSignal().connect(outputProgressPainter.setProgress);

sampleCombo.addEventListener('change',
  function(e) {
    loadSample(e.target.value);
});

playInputBtn.addEventListener("click", function(e) {
  // toggle playback
  playInputBtn.innerHTML = "Play";
  playOutputBtn.innerHTML = 'Play';

  outputPlayer.stopPlayback();

  if (inputPlayer.isPlaying()) {
    inputPlayer.stopPlayback();
  }
  else if (inputPlayer.startPlayback(inputBuffer)) {
    playInputBtn.innerHTML = "Stop";
  }
});

playOutputBtn.addEventListener('click', function(e) {
  playInputBtn.innerHTML = 'Play';
  playOutputBtn.innerHTML = 'Play';

  inputPlayer.stopPlayback();

  if (outputPlayer.isPlaying()) {
    outputPlayer.stopPlayback();
  }
  else if (outputPlayer.startPlayback(outputBuffer)) {
    playOutputBtn.innerHTML = 'Stop';
  }
});

shakeBtn.addEventListener('click', function(e) {
  randomize();
  if (outputPlayer.isPlaying()) {
    outputPlayer.startPlayback(outputBuffer);
  }
});

function updateSlices() {
  slices = findSlices(inputBuffer, 400, 10);

  var hChunk = 360/slices.length;
  var curH = 0;
  for (var i = 0; i < slices.length; ++i) {
    slices[i].color = 'hsla(' + curH + ', 100%, 50%, 0.2)';
    curH += hChunk;
  }

  sliceOverlayCvs.getContext('2d').clearRect(
    0, 0, sliceOverlayCvs.width, sliceOverlayCvs.height);
  paintSlices(sliceOverlayCvs, slices, inputBuffer.length, 'rgba(255, 0, 0, 0.5)');

  randomize();
}

function randomize() {
  var indexes = new Array(slices.length);
  for (var i = 0; i < slices.length; i++) {
    indexes[i] = i;
  }
  shuffle(indexes);

  randomizedSlices = new Array(slices.length);
  var inp = inputBuffer.getChannelData(0);
  var out = outputBuffer.getChannelData(0);
  var outputOffset = 0;

  for (var i = 0; i < indexes.length; i++) {
    randomizedSlices[i] = {
      beginIdx: slices[indexes[i]].beginIdx,
      endIdx: slices[indexes[i]].endIdx,
      beatIdx: slices[indexes[i]].beatIdx,
      color: slices[indexes[i]].color
    };

    var beginIdx = randomizedSlices[i].beginIdx;
    var curSliceLength = randomizedSlices[i].endIdx - beginIdx + 1;
    for (var j = outputOffset; j < outputOffset + curSliceLength; j++) {
      out[j] = inp[beginIdx + j - outputOffset];
    }
    var beatDist = randomizedSlices[i].beatIdx - randomizedSlices[i].beginIdx;
    randomizedSlices[i].beginIdx = outputOffset;
    randomizedSlices[i].beatIdx = randomizedSlices[i].beginIdx + beatDist;
    randomizedSlices[i].endIdx = randomizedSlices[i].beginIdx + curSliceLength - 1;

    outputOffset += curSliceLength;
  }

  paintBuffer(outputBufferCvs, outputBuffer);

  var cvs = outputOverlayCvs;
  cvs.getContext('2d').clearRect(0, 0, cvs.width, cvs.height);
  paintSlices(cvs, randomizedSlices, outputBuffer.length, 'rgba(255, 0, 0, 0.5)');
}

function loadSample(uneURL) {
  var xhr = new XMLHttpRequest;
  xhr.open("GET", uneURL, true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function(e) {
    audioCtx.decodeAudioData(xhr.response, function(data){
      inputBuffer = data;
      outputBuffer = cloneAudioBuffer(audioCtx, inputBuffer);
      paintBuffer(inputBufferCvs, data);
      updateSlices();
      if (inputPlayer.isPlaying()) {
        inputPlayer.startPlayback(inputBuffer);
      }
      else if (outputPlayer.isPlaying()) {
        outputPlayer.startPlayback(outputBuffer);
      }
    });
  }
  xhr.onerror = function(e) {
    console.log(e);
  }
  xhr.send(null);
}

loadSample(sampleCombo.value);

}

