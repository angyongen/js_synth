
	function encodeWAVBlob(Channels, SampleRate, BitsPerSample, data) {
		//var t0 = performance.now();
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
			uint32_bytes(SubChunk1Size),//"\x10\x00\x00\x00",//
			uint16_bytes(AudioFormat),//"\x01\x00",//
			uint16_bytes(Channels),
			uint32_bytes(SampleRate),
			uint32_bytes(ByteRate),
			uint16_bytes(BlockAlign),
			uint16_bytes(BitsPerSample),
			"data",//SubChunk2ID,
			uint32_bytes(SubChunk2Size),
			data
		], {type: 'audio/wav'})

		//var t1 = performance.now();
		//var time = (t1 - t0)
		//if (time < min1) min1 = time
		//if (time > max1) max1 = time
		//log("t1:"+ time +", avg:" + (totalTime1 += time)/(++totalTimes1) + ", min" + min1 + ", max" + max1);

		return blob//
	}
	function arrayBufferToString(buffer){
//https://stackoverflow.com/questions/6965107/converting-between-strings-and-arraybuffers
    var bufView = new Uint16Array(buffer);
    var length = bufView.length;
    var result = '';
    var addition = Math.pow(2,16)-1;

    for(var i = 0;i<length;i+=addition){

        if(i + addition > length){
            addition = length - i;
        }
        result += String.fromCharCode.apply(null, bufView.subarray(i,i+addition));
    }

    return result;

}
	function encodeWAVbase64(Channels, SampleRate, BitsPerSample, data) {
		var t0 = performance.now();
		//var enc = new TextEncoder();
		var c = new TextDecoder("utf-8");

		var uint16_string = function(v) {
			var PACKED = new Uint8Array(2);
			new DataView(PACKED.buffer).setUint16(0, v, true/*all values are little endian*/);
			return String.fromCharCode(PACKED[0]) + String.fromCharCode(PACKED[1])
			//arrayBufferToString([PACKED[0],PACKED[1]]);
		}
		var uint32_string = function(v) {
			var PACKED = new Uint8Array(4);
			new DataView(PACKED.buffer).setUint32(0, v, true/*all values are little endian*/);
			return String.fromCharCode(PACKED[0]) + String.fromCharCode(PACKED[1]) + String.fromCharCode(PACKED[2]) + String.fromCharCode(PACKED[3])
			//c.decode(PACKED) 
			//arrayBufferToString([PACKED[0],PACKED[1],PACKED[2],PACKED[3]]);
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

		var str = [
			"RIFF",//ChunkID,
			uint32_string(ChunkSize),
			"WAVE",//ChunkFormat,
			"fmt ",//SubChunk1ID,
			uint32_string(SubChunk1Size),
			uint16_string(AudioFormat),
			uint16_string(Channels),
			uint32_string(SampleRate),
			uint32_string(ByteRate),
			uint16_string(BlockAlign),
			uint16_string(BitsPerSample),
			"data",//SubChunk2ID,
			uint32_string(SubChunk2Size),
			arrayBufferToString(data)
		].join("")

		var t1 = performance.now();
		var time = (t1 - t0)
		if (time < min1) min1 = time
		if (time > max1) max1 = time
		log("t1:"+ time +", avg:" + (totalTime1 += time)/(++totalTimes1) + ", min" + min1 + ", max" + max1);

		return 'data:audio/wav;base64,' + escape(window.btoa(str));
	}
