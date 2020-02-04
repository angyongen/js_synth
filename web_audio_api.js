
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();
var audioCtx_destination = audioCtx.destination;

	function displayNote_webaudio(soundplayers, midinote) {
		var percentageSum = 0;
		for (var i = 0; i < soundplayers.length; i++)
		{
			soundplayer = soundplayers[i]
			if (soundplayer.playing) percentageSum += 1;
		}
		displayNoteState(midinote, percentageSum/noteRepeats)
	}
	function createOnEndedHandler_webaudio(soundplayers, midinote) {
		return function() {
			this.playing = false;
			displayNote_webaudio(soundplayers, midinote)
		}
	}
	
function webAudio_createPlayer(sound, frequency, time, volume) {
	var myArrayBuffer = audioCtx.createBuffer(2, audioCtx.sampleRate * time, audioCtx.sampleRate);
	var decayEnd = (sampleRate * time) | 0;
	var period = sampleRate/frequency

	for (var channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
		var data = myArrayBuffer.getChannelData(channel)
		switch(sound)
		{
			case 0: //piano
			piano_float(data, sampleRate, frequency, volume, time, decayEnd)
			break;
			case 1: //organ
			organ_float(data, sampleRate, frequency, volume, time, decayEnd)
			break;
			case 2: //acoustic
			var period = sampleRate/frequency
			acoustic_rand_float(data, period, decayEnd, volume*0.5)
			break;
			case 3: //edm
			edm_float(data, sampleRate, frequency, volume, time, decayEnd)
			break;
		}
	}
	// Get an AudioBufferSourceNode.
	// This is the AudioNode to use when we want to play an AudioBuffer
	var source = audioCtx.createBufferSource();

	// set the buffer in the AudioBufferSourceNode
	source.buffer = myArrayBuffer;
	source.connect(audioCtx_destination);
	return source;
}
	function getWebAudioPlayer(midinote, frequency) {
		//gets a player that is not playing (cannot retrieve duration)
		var soundplayer;
		var soundplayers;
		if (!(midinote < soundplayersstorage.length)) soundplayersstorage[midinote] = []
		if (!soundplayersstorage[midinote]) soundplayersstorage[midinote] = []
		soundplayers = soundplayersstorage[midinote]

		for (var i = 0; i < soundplayers.length; i++)
		{
			if (!soundplayers[i].playing) {
				soundplayers[i] = webAudio_createPlayer(soundchoice, frequency, time, 0.5)
				soundplayers[i].playing = true
				soundplayers[i].onended = createOnEndedHandler_webaudio(soundplayersstorage[midinote], midinote);
				soundplayer = soundplayers[i]
				break;
			}
		}

		if (!soundplayer || (!soundplayersstorage[midinote][i] && (i < noteRepeats))) {
			soundplayer = webAudio_createPlayer(soundchoice, frequency, time, 0.5)
			soundplayer.playing = true
			soundplayer.onended = createOnEndedHandler_webaudio(soundplayersstorage[midinote], midinote);
			soundplayersstorage[midinote].push(soundplayer)
		}
		displayNote_webaudio(soundplayersstorage[midinote], midinote)
		return soundplayer
	}