
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();
var audioCtx_destination = audioCtx.destination;

function webAudio_createPlayer(frequency, time) {
	var myArrayBuffer = audioCtx.createBuffer(2, audioCtx.sampleRate * time, audioCtx.sampleRate);
	var decayEnd = (sampleRate * time) | 0;
	var period = sampleRate/frequency

	for (var channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
		acoustic_rand_float(myArrayBuffer.getChannelData(channel), period, decayEnd, 1)
	}
	// Get an AudioBufferSourceNode.
	// This is the AudioNode to use when we want to play an AudioBuffer
	var source = audioCtx.createBufferSource();

	// set the buffer in the AudioBufferSourceNode
	source.buffer = myArrayBuffer;
	source.connect(audioCtx_destination);
	return source;
}