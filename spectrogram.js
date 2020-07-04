const create_analyser_builtin = function(fftSize, minDecibels, maxDecibels, smoothingTimeConstant) {
    var AnalyserNode = audioCtx.createAnalyser()
    if (typeof fftSize == "number") AnalyserNode.fftSize = fftSize
//double value representing the minimum power value in the scaling range for the FFT analysis data, for conversion to unsigned byte values — the minimum value for the range of results when using getByteFrequencyData().
    if (typeof minDecibels == "number") AnalyserNode.minDecibels = minDecibels
//double value, maximum power value in the scaling range for the FFT analysis data, for conversion to unsigned byte values — the maximum value for the range of results when using getByteFrequencyData().
    if (typeof maxDecibels == "number") AnalyserNode.maxDecibels = maxDecibels
//double value, averaging constant with the last analysis frame — smoothens transition between values.
    if (typeof smoothingTimeConstant == "number") AnalyserNode.smoothingTimeConstant = smoothingTimeConstant

    AnalyserNode.FloatOutputs = [
      function(buffer) {AnalyserNode.getFloatFrequencyData(buffer)},
      function(buffer) {AnalyserNode.getFloatTimeDomainData(buffer)}
    ]
    AnalyserNode.ByteOutputs = [
      function(buffer) {AnalyserNode.getByteFrequencyData(buffer)},
      function(buffer) {AnalyserNode.getByteTimeDomainData(buffer)}
    ]
    //TODO: Inherits properties from its parent, AudioNode.
    return AnalyserNode
 }

 function getSpectrogramBuffer(analyser) {
	var buffer = new Uint8Array(analyser.frequencyBinCount)
	analyser.ByteOutputs[0](buffer)
	return buffer
 }

function getClosestBin(frequency) {
	var binSize = audioCtx.sampleRate/analyser.fftSize
	return Math.round(frequency/binSize)
}