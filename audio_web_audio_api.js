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
	return source;
}

function getWebAudioPlayer(midinote, frequency) {
	//gets a player that is not playing (cannot retrieve duration)
	var soundplayer;
	var soundplayers = getSoundPlayers(midinote);
	for (var i = 0; i < soundplayers.length; i++)
	{
		if (!soundplayers[i].playing) {
			//soundplayers[i] = webAudio_createPlayer(soundchoice, frequency, time, 0.5)
			var buffer = soundplayers[i].buffer
			soundplayers[i] = audioCtx.createBufferSource();
			soundplayers[i].buffer = buffer;

			soundplayers[i].gainNode = audioCtx.createGain();
			soundplayers[i].connect(soundplayers[i].gainNode);
			soundplayers[i].gainNode.connect(audioCtx_destination);
			soundplayers[i].playing = true
			soundplayers[i].onended = createOnEndedHandler_webaudio(soundplayers, midinote);
			soundplayer = soundplayers[i]
			break;
		}
	}

	if (!soundplayer || (!soundplayers[i] && (i < noteRepeats))) {
		soundplayer = webAudio_createPlayer(soundchoice, frequency, time, volume)

		soundplayer.gainNode = audioCtx.createGain();
		soundplayer.connect(soundplayer.gainNode);
		soundplayer.gainNode.connect(audioCtx_destination);
		soundplayer.playing = true
		soundplayer.onended = createOnEndedHandler_webaudio(soundplayers, midinote);
		soundplayers.push(soundplayer)
	}
	displayNote_webaudio(soundplayers, midinote)
	return soundplayer
}

function startWebAudioPlayer(soundplayer, volume) {
	soundplayer.start()
	if (soundplayer.onplaying) soundplayer.onplaying()
	soundplayer.gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
}

function stopAllWebAudioPlayer(midinote) {
	var soundplayers = getSoundPlayers(midinote);
	for (var i = 0; i < soundplayers.length; i++)
	{
		soundplayers[i].stop()
	}
}