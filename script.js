
	function log(x) {
		var element = document.createElement("pre")
		//element.innerHTML = x;
		document.form.log.value += (x+ '\n')
		document.form.log.scrollTop = document.form.log.scrollHeight
	}
	function generateData_16(sound, sampleRate, time, frequency, volume)
	{
		var decayEnd = (sampleRate * time) | 0;
		var data = new Uint8Array(new ArrayBuffer(decayEnd * 2));

		var t0 = performance.now();
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
		var t1 = performance.now();
		var time = (t1 - t0)
		if (time < min2) min2 = time
		if (time > max2) max2 = time
		log("t2:"+ time +", avg:" + (totalTime2 += time)/(++totalTimes2) + ", min" + min2 + ", max" + max2);

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

		var source = audioCtx.createMediaElementSource(soundplayer);
		source.connect(audioCtx.destination);

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
	function displayNoteState(midinote, percentage) {
		var keys = document.getElementById("keys").children
		var keyId = midinote - 21
		if (keyId >= 0 && keyId < keys.length) {
			if (percentage == 0) {
				keys[keyId].style.background = ""
			} else {
				var intensity;
				switch (keys[keyId].className) {
					case "w":
						intensity = Math.round(255*(1-percentage))
						keys[keyId].style.background = "rgb(255,"+intensity+","+intensity+")"
						break;
					case "b":
						intensity = Math.round(255*percentage)
						keys[keyId].style.background = "rgb("+intensity+",0,0)"
						break;
				}
				
			}
		}
	}
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
	function getPlayer(midinote, frequency) {
		//gets a player that least affects sound (one that has been playing for maximum time)
		var soundplayer;
		var soundplayers;
		if (!(midinote < soundplayersstorage.length)) soundplayersstorage[midinote] = []
		if (!soundplayersstorage[midinote]) soundplayersstorage[midinote] = []
		soundplayers = soundplayersstorage[midinote]

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
		if (!soundplayer || (!soundplayersstorage[midinote][i] && (i < noteRepeats))) {
			soundplayer = createSoundPlayer(soundchoice, sampleRate, time, frequency, 16384)
			soundplayer.ontimeupdate = createTimeUpdateHandler(soundplayersstorage[midinote], midinote);
			//soundplayer.onended = createOnEndedHandler(midinote)
			//soundplayer.onpause = createOnEndedHandler(midinote)
			//soundplayer.onplay = createOnPlayHandler(midinote)
			soundplayersstorage[midinote].push(soundplayer)
		} else {
		}
		return soundplayer
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
				soundplayers[i] = webAudio_createPlayer(frequency, time)
				soundplayers[i].playing = true
				soundplayers[i].onended = createOnEndedHandler_webaudio(soundplayersstorage[midinote], midinote);
				soundplayer = soundplayers[i]
				break;
			}
		}

		if (!soundplayer || (!soundplayersstorage[midinote][i] && (i < noteRepeats))) {
			soundplayer = webAudio_createPlayer(frequency, time)
			soundplayer.playing = true
			soundplayer.onended = createOnEndedHandler_webaudio(soundplayersstorage[midinote], midinote);
			soundplayersstorage[midinote].push(soundplayer)
		}
		displayNote_webaudio(soundplayersstorage[midinote], midinote)
		return soundplayer
	}
	function noteDown(midinote) {
		var frequency = 440 * Math.pow(2, ( (midinote - 69) / 12) )


		var soundplayer = getWebAudioPlayer(midinote, frequency)
		
		soundplayer.start()
		/*
		if (soundplayer.currentTime == soundplayer.duration || soundplayer.currentTime == 0) {
			//soundplayer.load();
			soundplayer.play();
		} else {
			soundplayer.currentTime = 0;
		}
		*/
	}
	function noteUp(midinote) {
		/*
		if (!sustain) {
			var soundchoice = parseInt(document.form.soundchoice.value);
			var soundplayers = soundplayersstorage[midinote]
			for (var i = 0; i < soundplayers.length; i++)
			{
				var soundplayer = soundplayers[i]
				setTimeout(function() {soundplayer.pause()}, 10);
			}
		}
		*/
	}
	function updateInputTypes() {
		document.getElementById("input_kb").style.display = document.form.inputchoice_kb.checked?"":"none"
		document.getElementById("input_vp").style.display = document.form.inputchoice_vp.checked?"":"none"
	}
