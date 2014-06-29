var audioCtx = new AudioContext();

window.onload = function()
{
var editor = {};
var progress = {};

document.getElementById('sample_combo').addEventListener('change',
  function(e) {
    loadSample(e.target.value);
});

document.getElementById("play").addEventListener("click", function(e) {
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
  if (editor.playing) {
    stop_playback();
  }
  else {
    start_playback();
  }
}

function start_playback() {
  if (!editor.buffer) {
    return;
  }
  stop_playback();

  var source = audioCtx.createBufferSource();
  source.buffer = editor.buffer;
  source.loop = true;
  source.connect(audioCtx.destination);
  editor.source = source;

  var progCvs = document.getElementById('progress');
  var progCtx = progCvs.getContext('2d');
  progCtx.fillStyle = 'rgba(255, 0, 0, 1)';

  progress.progress = 0;
  progress.pixChunk = 5;
  progress.chunkNumber = Math.floor(progCvs.width / progress.pixChunk);

  source.start();

  editor.progressInterval = setInterval(function(e){
    if (progress.progress >= progress.chunkNumber) {
      progress.progress = 0;
      progCtx.clearRect(0, 0, progCvs.width, progCvs.height);
    }
    else {
      progCtx.fillRect(progress.progress++ * progress.pixChunk, 0,
        progress.pixChunk, progCvs.height);
    }
  }, editor.buffer.duration * 1000 / progress.chunkNumber);

  document.getElementById("play").innerHTML = "Stop";
  editor.playing = true;
}

function stop_playback() {
  if (editor.source) {
    editor.source.stop(0);
    editor.source = null;
  }

  clearInterval(editor.progressInterval);
  var progCvs = document.getElementById('progress');
  progCvs.getContext('2d').clearRect(0, 0, progCvs.width, progCvs.height);

  document.getElementById("play").innerHTML = "Play";
  editor.playing = false;
}

function draw_editor() {
  if (!editor.buffer) {
    return;
  }
  visuCvs = document.getElementById('visu');
  progCvs = document.getElementById('progress');

  var factor = editor.buffer.length / window.innerWidth;
  visuCvs.width = progCvs.width = editor.buffer.length / factor;
  visuCvs.height = progCvs.height = 256;
  progCvs.height = 2;
  var visuCtx = visuCvs.getContext("2d");
  var progCtx = progCvs.getContext("2d");
  var b = editor.buffer.getChannelData(0);

  visuCtx.clearRect(0, 0, visuCvs.witdh, visuCvs.height);
  progCtx.clearRect(0, 0, progCtx.width, progCtx.height);

  var j = 0;
  var max = 0;
  // rms by chunk to determine a normalization factor
  for (var i = 0; i < b.length; i=Math.floor(i+factor)) {
    var rmsvalue = rms(b, i, factor);
    max = Math.max(max, rmsvalue);
  }
  var boost = (0.5 / max) * 256;
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
      if (editor.playing) {
        start_playback();
      }
    });
  }
  xhr.onerror = function(e) {
    console.log(e);
  }
  xhr.send(null);
}

loadSample(document.getElementById('sample_combo').value);

}

