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
    rms += v * v;
  }
  rms = Math.sqrt(rms/len);
  return rms;
}

function d(v, d) {
  return (v === undefined ? d : v);
}

/**
 * @brief mean compute the mean of a portion of an array of values.
 * @param values the array holding the values.
 * @param start the starting point of the portion whose mean is calculated.
 * @param length the length of the portion whose mean is calculated.
 * @note if start and length are omitted then the mean is calculated on the
 * whole array.
 * @return the mean.
 */
function mean(values, start, length) {
  start = d(start, 0);
  length = d(length, values.length);
  if (values.length < start + length) {
    length = values.length - start;
  }

  var result = 0;
  for (var i = 0; i < length; i++) {
    result += values[start + i];
  }
  result /= length;

  return result;
}

