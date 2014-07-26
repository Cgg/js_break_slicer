window.onload = function()
{
var audioCtx = new AudioContext();
var player = makePlayer(audioCtx);
var slicer = makeSlicer();

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
  else if (player.startPlayback(slicer.inputBuffer())) {
    playButton.innerHTML = "Stop";
  }
});

function redrawOverlay() {
  sliceOverlayCvs.getContext('2d').clearRect(
    0, 0, sliceOverlayCvs.width, sliceOverlayCvs.height);

  var bufLength = slicer.inputBuffer().length;
  var slices = slicer.slices();

  var beatIdx = new Array(slices.length);
  for (var i = 0; i < slices.length; i++) {
    beatIdx[i] = slices[i].beatIdx;
  }

  paintFramesIndexes(sliceOverlayCvs, beatIdx, bufLength,
    'rgba(255, 0, 0, 0.7)');
  paintAlternateStripes(sliceOverlayCvs, slicer.slices(),
    bufLength);
}

function loadSample(uneURL) {
  var xhr = new XMLHttpRequest;
  xhr.open("GET", uneURL, true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function(e) {
    audioCtx.decodeAudioData(xhr.response, function(data){
      slicer.setChunkWidth(400);
      slicer.setInputBuffer(data);

      paintBuffer(inputBufferCvs, slicer.inputBuffer());
      redrawOverlay();
      if (player.isPlaying()) {
        player.startPlayback(slicer.inputBuffer());
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

