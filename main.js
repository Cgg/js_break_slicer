window.onload = function()
{
var audioCtx = new AudioContext();
var player = makePlayer(audioCtx);
var editor = {};

var sampleCombo = document.getElementById('sample_combo');
var playButton = document.getElementById('play');

sampleCombo.addEventListener('change',
  function(e) {
    loadSample(e.target.value);
});

playButton.addEventListener("click", function(e) {
  toggle_current_playing();
});

function rms(buf, offset, len) {
  var rms = 0;
  if (buf.length < offset + len) {
    len = buf.length - offset;
  }
  if (len == 0) {
    return 0;
  }
  for (var i = 0; i < len; i++) {
    var v = buf[offset + i];
    rms += Math.sqrt(v * v);
  }
  rms /= len;
  return rms;
}

function toggle_current_playing() {
  playButton.innerHTML = "Play";

  if (player.isPlaying()) {
    player.stopPlayback();
  }
  else if (player.startPlayback(editor.buffer)) {
    playButton.innerHTML = "Stop";
  }
}

function draw_editor() {
  if (!editor.buffer) {
    return;
  }
  visuCvs = document.getElementById('visu');
  progCvs = document.getElementById('progress');

  // the drawing takes two pixel in width to draw one RMS chunk, hence the
  // 2 multiplier.
  var factor = 2 * editor.buffer.length / window.innerWidth;
  visuCvs.width = progCvs.width = window.innerWidth;
  visuCvs.height = progCvs.height = 256;
  progCvs.height = 2;
  var visuCtx = visuCvs.getContext("2d");
  var progCtx = progCvs.getContext("2d");
  var b = editor.buffer.getChannelData(0);

  visuCtx.clearRect(0, 0, visuCvs.witdh, visuCvs.height);
  progCtx.clearRect(0, 0, progCtx.width, progCtx.height);

  var max = 0;
  // rms by chunk to determine a normalization factor
  for (var i = 0; i < b.length; i=Math.floor(i+factor)) {
    var rmsvalue = rms(b, i, factor);
    max = Math.max(max, rmsvalue);
  }
  var boost = (0.5 / max) * 256;
  var j = 0;
  for (var i = 0; i < b.length; i=Math.floor(i+factor)) {
    var rmsvalue = rms(b, i, factor) * boost;
    rmsvalue = Math.max(1.0, rmsvalue);
    visuCtx.fillStyle = "rgba(0, 0, 0, 1.0)";
    visuCtx.fillRect(j++, visuCvs.height / 1.3, 1.5, -rmsvalue * 1.5);
    visuCtx.fillStyle = "rgba(0, 0, 0, 0.4)";
    visuCtx.fillRect(j++, visuCvs.height / 1.3, 1.5, +rmsvalue * 0.5);
  }
}

function loadSample(uneURL) {
  var xhr = new XMLHttpRequest;
  xhr.open("GET", uneURL, true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function(e) {
    audioCtx.decodeAudioData(xhr.response, function(data){
      editor.buffer = data;
      draw_editor(data);
      if (player.isPlaying()) {
        player.startPlayback(editor.buffer);
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

