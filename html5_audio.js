
	function createTimeUpdateHandler(soundplayers, midinote) {
		return function() {
			var percentageSum = 0;
			for (var i = 0; i < soundplayers.length; i++)
			{
				soundplayer = soundplayers[i]
				percentageSum += 1 - (soundplayer.currentTime / soundplayer.duration);
			}
			displayNoteState(midinote, percentageSum/noteRepeats)
		}
	}
	function generateData_16(sound, sampleRate, time, frequency, volume)
	{
		var decayEnd = (sampleRate * time) | 0;
		var data = new Uint8Array(new ArrayBuffer(decayEnd * 2));
		switch(sound)
		{
			case 0: //piano
			piano_16(data, sampleRate, frequency, volume, time, decayEnd)
			break;
			case 1: //organ
			organ_16(data, sampleRate, frequency, volume, time, decayEnd)
			break;
			case 2: //acoustic
			var period = sampleRate/frequency
			acoustic_rand_16(data, period, decayEnd, volume)
			break;
			case 3: //edm
			edm_16(data, sampleRate, frequency, volume, time, decayEnd)
			break;
		}

	/*
		while(i < attackLen_int) {
			val = volume * (i/attackLen) * waveFunc(waveBind, i, sampleRate, frequency, volume);

			data[j++] = val;
			data[j++] = val >> 8;
			++i;
		}

		while (i < decayEnd) {
			val = volume * Math.pow((1-((i-attackLen)/decayLen)),dampen) * waveFunc(waveBind, i, sampleRate, frequency, volume);

			data[j++] = val;
			data[j++] = val >> 8;
			++i;
		}
		*/

		return data
	}
	function createSoundPlayer(sound, sampleRate, time, frequency, volume) {
		var data = generateData_16(sound, sampleRate, time, frequency, volume)
		var src
		if (base64mode) {
			src = encodeWAVbase64(1, sampleRate, 16, data)
		} else {
			src = URL.createObjectURL(encodeWAVBlob(1, sampleRate, 16, data))
		}
		var soundplayer = new Audio(src);

		//var source = audioCtx.createMediaElementSource(soundplayer);
		//source.connect(audioCtx.destination);

		soundplayer.setAttribute('type', 'audio/wav');
		soundplayer.autoplay = false;
		if (appendToDocument) {
			soundplayer.controls = true;
			document.getElementById("soundplayers").appendChild(soundplayer)
		}
		//soundplayer.onloadeddata = function(e) { e.target.play(); };
		//soundplayer.onended = function() {soundplayer = null; URL.revokeObjectURL(src)}
		//soundplayer.load();
		return soundplayer;
	}
	function getHTML5AudioPlayer(midinote, frequency) {
		//gets a player that least affects sound (one that has been playing for maximum time)
		var soundplayer;
		var soundplayers = getSoundPlayers(midinote);
		
		var maxTime = -1;
		var maxTime_soundplayer;
		for (var i = 0; i < soundplayers.length; i++)
		{
			soundplayer = soundplayers[i]
			if (soundplayer.currentTime > maxTime) {
				maxTime_soundplayer = soundplayer;
				maxTime = soundplayer.currentTime;
				if (soundplayer.paused || soundplayer.ended) break;
			}
		}
		soundplayer = maxTime_soundplayer
			//create if unavailable
		if (!soundplayer || (!soundplayers[i] && (i < noteRepeats))) {
			soundplayer = createSoundPlayer(soundchoice, sampleRate, time, frequency, volume * 16384)
			soundplayer.ontimeupdate = createTimeUpdateHandler(soundplayers, midinote);
			//soundplayer.onended = createOnEndedHandler(midinote)
			//soundplayer.onpause = createOnEndedHandler(midinote)
			//soundplayer.onplay = createOnPlayHandler(midinote)
			soundplayers.push(soundplayer)
		} else {
		}
		return soundplayer
	}

	function startHTML5AudioPlayer(soundplayer, volume) {
		if (soundplayer.currentTime == soundplayer.duration || soundplayer.currentTime == 0) {
			//soundplayer.load();
			soundplayer.play();
		} else {
			soundplayer.currentTime = 0;
		}
		soundplayer.volume = volume
	}

	function stopAllHTML5AudioPlayer(midinote) {
		var soundplayers = getSoundPlayers(midinote);
		for (var i = 0; i < soundplayers.length; i++)
		{
			var soundplayer = soundplayers[i]
			
			soundplayer.pause()
			soundplayer.currentTime = 0;
			//setTimeout(function() {soundplayer.pause()}, 10);
		}
	}