	var noteRepeats = 3 //the number of duplicate note audio stored
	var appendToDocument = false //whether or not note audio is appended to the soundplayers div
	var keyCodeMapping = [81, 50, 87, 51, 69, 82, 53, 84, 54, 89, 55, 85, 73, 57, 79, 48, 80, 219, 61, 221]
	var sampleRate = 44100
	var volume = 16384

	var totalTime1 = 0
	var totalTimes1 = 0
	var min1 = 99999
	var max1 = 0

	var totalTime2 = 0
	var totalTimes2 = 0
	var min2 = 99999
	var max2 = 0


	var soundplayersstorages = [[], [], [], []]
	var soundplayersstorage
	var soundchoice
	var time
	function updateSoundChoice() {
		soundchoice = parseInt(document.form.soundchoice.value);
		soundplayersstorage = soundplayersstorages[soundchoice]
	}
	//var soundplayersplaying = new Uint8Array(128)

	function resetTimes() {
		totalTime1 = 0
		totalTimes1 = 0
		min1 = 99999
		max1 = 0
		totalTime2 = 0
		totalTimes2 = 0
		min2 = 99999
		max2 = 0
	}
	function resetStorages() {
		soundplayersstorages = [[], [], [], []]
	}
	function updateTimeChoice() {
		time = parseInt(document.form.time.value)
		document.getElementById('time_display').textContent = time;
		resetTimes();
		resetStorages();
	}
	
	function log(x) {
		var element = document.createElement("pre")
		//element.innerHTML = x;
		document.form.log.value += (x+ '\n')
		document.form.log.scrollTop = document.form.log.scrollHeight
	}
	function encodeWAVBlob1(Channels, SampleRate, BitsPerSample, data) {
		var t0 = performance.now();
		//var enc = new TextEncoder();

		var uint16_bytes = function(v) {
			var PACKED = new Uint8Array(2);
			new DataView(PACKED.buffer).setUint16(0, v, true/*all values are little endian*/);
			return PACKED;
		}
		var uint32_bytes = function(v) {
			var PACKED = new Uint8Array(4);
			new DataView(PACKED.buffer).setUint32(0, v, true/*all values are little endian*/);
			return PACKED;
		}
		//var ChunkID = enc.encode("RIFF")
		//var ChunkFormat = enc.encode("WAVE")
		//var SubChunk1ID = enc.encode("fmt ")
		var SubChunk1Size = 16
		var AudioFormat = 1 // Values other than 1 indicate compression.
		var ByteRate = SampleRate * Channels * BitsPerSample / 8 //bytes per second
		var BlockAlign = Channels * BitsPerSample / 8  //#bytes for 1 sample, all channels
		//var SubChunk2ID = enc.encode("data")
		var SubChunk2Size =  data.length
		var ChunkSize = 36 + SubChunk2Size

		var blob = new Blob([
			"RIFF",//ChunkID,
			uint32_bytes(ChunkSize),
			"WAVE",//ChunkFormat,
			"fmt ",//SubChunk1ID,
			uint32_bytes(SubChunk1Size),
			uint16_bytes(AudioFormat),
			uint16_bytes(Channels),
			uint32_bytes(SampleRate),
			uint32_bytes(ByteRate),
			uint16_bytes(BlockAlign),
			uint16_bytes(BitsPerSample),
			"data",//SubChunk2ID,
			uint32_bytes(SubChunk2Size),
			data
		], {type: 'audio/wav'})

		var t1 = performance.now();
		var time = (t1 - t0)
		if (time < min1) min1 = time
		if (time > max1) max1 = time
		log("t1:"+ time +", avg:" + (totalTime1 += time)/(++totalTimes1) + ", min" + min1 + ", max" + max1);

		return blob//
	}
	function encodeWAVBlob2(Channels, SampleRate, BitsPerSample, data) {
		var t0 = performance.now();
		//var enc = new TextEncoder();

		var uint16_bytes = function(v) {
			var PACKED = new Uint8Array(2);
			new DataView(PACKED.buffer).setUint16(0, v, true/*all values are little endian*/);
			return PACKED;
		}
		var uint32_bytes = function(v) {
			var PACKED = new Uint8Array(4);
			new DataView(PACKED.buffer).setUint32(0, v, true/*all values are little endian*/);
			return PACKED;
		}
		//var ChunkID = enc.encode("RIFF")
		//var ChunkFormat = enc.encode("WAVE")
		//var SubChunk1ID = enc.encode("fmt ")
		var SubChunk1Size = 16
		var AudioFormat = 1 // Values other than 1 indicate compression.
		var ByteRate = SampleRate * Channels * BitsPerSample / 8 //bytes per second
		var BlockAlign = Channels * BitsPerSample / 8  //#bytes for 1 sample, all channels
		//var SubChunk2ID = enc.encode("data")
		var SubChunk2Size =  data.length
		var ChunkSize = 36 + SubChunk2Size

		var blob = new Blob([
			"RIFF",//ChunkID,
			uint32_bytes(ChunkSize),
			"WAVE",//ChunkFormat,
			"fmt ",//SubChunk1ID,
			uint32_bytes(SubChunk1Size),
			uint16_bytes(AudioFormat),
			uint16_bytes(Channels),
			uint32_bytes(SampleRate),
			uint32_bytes(ByteRate),
			uint16_bytes(BlockAlign),
			uint16_bytes(BitsPerSample),
			"data",//SubChunk2ID,
			uint32_bytes(SubChunk2Size),
			data
		], {type: 'audio/wav'})

		var t1 = performance.now();
		var time = (t1 - t0)
		if (time < min1) min1 = time
		if (time > max1) max1 = time
		log("t1:"+ time +", avg:" + (totalTime1 += time)/(++totalTimes1) + ", min" + min1 + ", max" + max1);

		return blob//
	}
	var encodeWAVBlob = encodeWAVBlob1;

	var modulations = [
		function(i, sampleRate, frequency, x) { return 1 * Math.sin(2 * Math.PI * ((i / sampleRate) * frequency) + x); },
		function(i, sampleRate, frequency, x) { return 1 * Math.sin(4 * Math.PI * ((i / sampleRate) * frequency) + x); },
		function(i, sampleRate, frequency, x) { return 1 * Math.sin(8 * Math.PI * ((i / sampleRate) * frequency) + x); },
		function(i, sampleRate, frequency, x) { return 1 * Math.sin(0.5 * Math.PI * ((i / sampleRate) * frequency) + x); },
		function(i, sampleRate, frequency, x) { return 1 * Math.sin(0.25 * Math.PI * ((i / sampleRate) * frequency) + x); },
		function(i, sampleRate, frequency, x) { return 0.5 * Math.sin(2 * Math.PI * ((i / sampleRate) * frequency) + x); },
		function(i, sampleRate, frequency, x) { return 0.5 * Math.sin(4 * Math.PI * ((i / sampleRate) * frequency) + x); },
		function(i, sampleRate, frequency, x) { return 0.5 * Math.sin(8 * Math.PI * ((i / sampleRate) * frequency) + x); },
		function(i, sampleRate, frequency, x) { return 0.5 * Math.sin(0.5 * Math.PI * ((i / sampleRate) * frequency) + x); },
		function(i, sampleRate, frequency, x) { return 0.5 * Math.sin(0.25 * Math.PI * ((i / sampleRate) * frequency) + x); }
	]
	function piano_wave(i, sampleRate, frequency)
	{
		//var base = modulations[0];
		return modulations[1](
					i,
					sampleRate,
					frequency,
					Math.pow(modulations[0](i, sampleRate, frequency, 0), 2) + (0.75 * modulations[0](i, sampleRate, frequency, 0.25)) + (0.1 * modulations[0](i, sampleRate, frequency, 0.5))
					)
	}
	function piano_16(data, sampleRate, frequency, volume, time, decayEnd)
	{
		var i = 0;
		var j = 0;
		var attack = 0.002; 
		var dampen = Math.pow(0.5*Math.log((frequency*volume)/sampleRate),2)

		var attackLen_int = (sampleRate * attack) | 0;
		var attackLen = (sampleRate*attack)
		var decayLen = (sampleRate*(time-attack))
		while(i < attackLen_int) {
			val = volume * (i/attackLen) * piano_wave(i, sampleRate, frequency)
			data[j++] = val;
			data[j++] = val >> 8;
			++i;
		}
		while (i < decayEnd) {
			val = volume * Math.pow((1-((i-attackLen)/decayLen)),dampen) * piano_wave(i, sampleRate, frequency)
			data[j++] = val;
			data[j++] = val >> 8;
			++i;
		}
	}
	function organ_wave(i, sampleRate, frequency)
	{
		var base = modulations[0];
		return modulations[1](
					i,
					sampleRate,
					frequency,
					base(i, sampleRate, frequency, 0) + 0.5*base(i, sampleRate, frequency, 0.25) + 0.25*base(i, sampleRate, frequency, 0.5)
				);
	}
	function organ_16(data, sampleRate, frequency, volume, time, decayEnd)
	{
		var i = 0;
		var j = 0;
		var attack = 0.3
		var dampen = 1+(frequency * 0.01);

		var attackLen_int = (sampleRate * attack) | 0;
		var attackLen = (sampleRate*attack)
		var decayLen = (sampleRate*(time-attack))
		while(i < attackLen_int) {
			val = volume * (i/attackLen) * organ_wave(i, sampleRate, frequency);

			data[j++] = val;
			data[j++] = val >> 8;
			++i;
		}

		while (i < decayEnd) {
			val = volume * Math.pow((1-((i-attackLen)/decayLen)),dampen) * organ_wave(i, sampleRate, frequency);

			data[j++] = val;
			data[j++] = val >> 8;
			++i;
		}
	}
	function acoustic_rand_16(data, period, samples, volume)
	{
		var i = 0;
		var j = 0;
		var p = 0;
		//var data = new Uint8Array(samples * 2); //16 bit integer
		var period_int = Math.ceil(period)
		var valueTable = new Array(period_int)
		for(i = 0; i < period_int; i++) {
			var value = volume * (valueTable[i] = (Math.random() > 0.5) ? 1 : -1)
			data[j++] = value
			data[j++] = value >> 8
		}
		for(; i < samples; i++) {
			var point = Math.floor(i % period)
			var next = point + 1;
			if (next == period_int) {next = 0}
			var value = volume * (valueTable[point] = (valueTable[point] + valueTable[next]) / 2)
			data[j++] = value
			data[j++] = value >> 8
		}
		/*
		var periods = samples/period - 1
		for(p = 0; p < periods; p++) {
			for(i = 0; i < period_int; i++) {
				var next = i + 1;
				if (next == period_int) {next = 0}
				var value = volume * (valueTable[i] = (valueTable[i] + valueTable[next]) / 2)
				data[j++] = value
				data[j++] = value >> 8
			}
		}
		*/
		/*
		for(; i < samples; i++) {
			var point = i % period_int
			var next = point + 1;
			if (next == period_int) {next = 0}
			var value = volume * (valueTable[point] = (valueTable[point] + valueTable[next]) / 2)
			data[j++] = value
			data[j++] = value >> 8
		}
		*/
		//return data;
	}
	function edm_16(data, sampleRate, frequency, volume, time, decayEnd)
	{
		var i = 0;
		var j = 0;
		var attack = 0.002
		var dampen = 1
		var attackLen_int = (sampleRate * attack) | 0;
		var attackLen = (sampleRate*attack)
		var decayLen = (sampleRate*(time-attack))
		var wave = function() {
			var base = modulations[0];
			//var mod = modulations.slice(0);
			return modulations[0](
				i,
				sampleRate,
				frequency,
				modulations[9](
					i,
					sampleRate,
					frequency,
					modulations[2](
						i,
						sampleRate,
						frequency,
						Math.pow(base(i, sampleRate, frequency, 0), 3) +
							Math.pow(base(i, sampleRate, frequency, 0.5), 5) +
							Math.pow(base(i, sampleRate, frequency, 1), 7)
					)
				) +
					modulations[6](
						i,
						sampleRate,
						frequency,
						base(i, sampleRate, frequency, 1.75)
					)
			);
		}
		while(i < attackLen_int) {
			val = volume * (i/attackLen) * wave();

			data[j++] = val;
			data[j++] = val >> 8;
			++i;
		}

		while (i < decayEnd) {
			val = volume * Math.pow((1-((i-attackLen)/decayLen)),dampen) * wave();

			data[j++] = val;
			data[j++] = val >> 8;
			++i;
		}
	}
	function generateWAV(sound, sampleRate, time, frequency, volume)
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
		return encodeWAVBlob(1, sampleRate, 16, data)
	}
	function createSoundPlayer(sound, sampleRate, time, frequency, volume) {
		var src = URL.createObjectURL(generateWAV(sound, sampleRate, time, frequency, volume))
		var soundplayer = new Audio(src);
		soundplayer.setAttribute('type', 'audio/wav');
		soundplayer.autoplay = false;
		if (appendToDocument) {
			soundplayer.controls = true;
			document.getElementById("soundplayers").appendChild(soundplayer)
		}
		soundplayer.onloadeddata = function(e) { e.target.play(); };
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
	function noteDown(midinote) {
		var frequency = 440 * Math.pow(2, ( (midinote - 69) / 12) )
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
		//++i;
		if (!soundplayer || (!soundplayersstorage[midinote][i] && (i < noteRepeats))) {
			soundplayer = createSoundPlayer(soundchoice, sampleRate, time, frequency, 16384)
			soundplayer.ontimeupdate = createTimeUpdateHandler(soundplayersstorage[midinote], midinote);
			//soundplayer.onended = createOnEndedHandler(midinote)
			//soundplayer.onpause = createOnEndedHandler(midinote)
			//soundplayer.onplay = createOnPlayHandler(midinote)
			soundplayersstorage[midinote].push(soundplayer)
		} else {
		}
		if (soundplayer.currentTime == soundplayer.duration || soundplayer.currentTime == 0) {
			//soundplayer.play();
			soundplayer.load();
		} else {
			soundplayer.currentTime = 0;
		}
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
