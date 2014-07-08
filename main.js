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

function loadSample(uneURL) {
  var xhr = new XMLHttpRequest;
  xhr.open("GET", uneURL, true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function(e) {
    audioCtx.decodeAudioData(xhr.response, function(data){
      slicer.setInputBuffer(data);
      paintBuffer(inputBufferCvs, slicer.inputBuffer());
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

