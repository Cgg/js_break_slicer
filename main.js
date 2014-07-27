window.onload = function()
{
var audioCtx = new AudioContext();
var player = makePlayer(audioCtx);

var inputBuffer;
var slices;
var outputBuffer;
var randomizedSlices;

var sampleCombo = document.getElementById('sample_combo');
var playButton = document.getElementById('play');

var inputBufferCvs = document.getElementById('visu');
inputBufferCvs.width = window.innerWidth - 10;
var sliceOverlayCvs = document.getElementById('slice_overlay');
sliceOverlayCvs.width = inputBufferCvs.width;
var progOverlayCvs = document.getElementById('prog_overlay');
progOverlayCvs.width = inputBufferCvs.width;

var outputBufferCvs = document.getElementById('output_buffer_canvas');
outputBufferCvs.width = inputBufferCvs.width;
var outputOverlayCvs = document.getElementById('output_overlay_canvas');
outputOverlayCvs.width = inputBufferCvs.width;

outputBufferCvs.getContext('2d').fillStyle = 'rgba(0, 0, 0, 0.5)';
outputBufferCvs.getContext('2d').fillRect(0, 0, outputBufferCvs.width,
    outputBufferCvs.height);

var progressPainter = makeProgressPainter(progOverlayCvs)
player.progressChangedSignal().connect(progressPainter.setProgress)

sampleCombo.addEventListener('change',
  function(e) {
    loadSample(e.target.value);
});

playButton.addEventListener("click", function(e) {
  // toggle playback
  playButton.innerHTML = "Play";

  if (player.isPlaying()) {
    player.stopPlayback();
  }
  else if (player.startPlayback(inputBuffer)) {
    playButton.innerHTML = "Stop";
  }
});

function updateSlices() {
  slices = findSlices(inputBuffer, 400, 10);

  var hChunk = 360/8;
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
  for (var i = 0; i < indexes.length; i++) {
    randomizedSlices[i] = slices[indexes[i]];
  }

  //build outputBuffer
  //paintBuffer(outputBufferCvs, outputBuffer);

  //var cvs = outputBufferSlicesOverlayCvs;
  //cvs.getContext('2d').clearRect(0, 0, cvs.width, cvs.height);
  //paintSlices(cvs, randomizedSlices, bufLength, 'rgba(255, 0, 0, 0.5)');
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
      if (player.isPlaying()) {
        player.startPlayback(inputBuffer);
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

