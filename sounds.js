
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

	function acoustic_rand_float(data, period, samples, volume)
	{
		var i = 0;
		var j = 0;
		var p = 0;
		var period_int = Math.ceil(period)
		var valueTable = new Array(period_int)
		for(i = 0; i < period_int; i++) {
			var value = volume * (valueTable[i] = (Math.random() > 0.5) ? 1 : -1)
			data[j++] = value
		}
		for(; i < samples; i++) {
			var point = Math.floor(i % period)
			var next = point + 1;
			if (next == period_int) {next = 0}
			var value = volume * (valueTable[point] = (valueTable[point] + valueTable[next]) / 2)
			data[j++] = value
		}
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