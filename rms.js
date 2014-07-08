/**
 * @brief compute the Root Mean Square on a section of a AudioBuffer.
 * @param buf the AudioBuffer on which the RMS is computed.
 * @param offset the starting point of the segment whose RMS is computed.
 * @param len the lenght of the segment whose RMS is computed.
 * @return the RMS of the segment of the buffer.
 */
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

