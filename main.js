window.onload = function()
{
var audioCtx = new AudioContext();
var player = makePlayer(audioCtx);

var inputBuffer;
var slices;
var outputBuffer;

var sampleCombo = document.getElementById('sample_combo');
var playButton = document.getElementById('play');

var inputBufferCvs = document.getElementById('visu');
inputBufferCvs.width = window.innerWidth - 10;
inputBufferCvs.height = 256;
var sliceOverlayCvs = document.getElementById('slice_overlay');
sliceOverlayCvs.width = inputBufferCvs.width;
sliceOverlayCvs.height = inputBufferCvs.height;
var progOverlayCvs = document.getElementById('prog_overlay');
progOverlayCvs.width = inputBufferCvs.width;
progOverlayCvs.height = 3;

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

  var stripesColors = new Array(slices.length);
  var hChunk = 360/8;
  var curH = 0;
  for (var i = 0; i < stripesColors.length; ++i) {
    stripesColors[i] = 'hsla(' + curH + ', 100%, 50%, 0.2)';
    curH += hChunk;
  }
  }

  // redraw slices overlay
  var beatIdx = new Array(slices.length);
  for (var i = 0; i < slices.length; i++) {
    beatIdx[i] = slices[i].beatIdx;
  }

  sliceOverlayCvs.getContext('2d').clearRect(
    0, 0, sliceOverlayCvs.width, sliceOverlayCvs.height);
  var bufLength = inputBuffer.length;

  paintFramesIndexes(sliceOverlayCvs, beatIdx, bufLength,
    'rgba(255, 0, 0, 0.5)');
  paintStripes(sliceOverlayCvs, slices, stripesColors,
    bufLength);
}

function loadSample(uneURL) {
  var xhr = new XMLHttpRequest;
  xhr.open("GET", uneURL, true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function(e) {
    audioCtx.decodeAudioData(xhr.response, function(data){
      inputBuffer = data;
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

