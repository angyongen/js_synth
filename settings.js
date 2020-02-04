	var noteRepeats = 3; //the number of duplicate note audio stored
	var appendToDocument = false; //whether or not note audio is appended to the soundplayers div
	var keyCodeMapping = [81, 50, 87, 51, 69, 82, 53, 84, 54, 89, 55, 85, 73, 57, 79, 48, 80, 219, 61, 221];
	var sampleRate = 44100;
	var volume = 16384;

	var totalTime1 = 0;
	var totalTimes1 = 0;
	var min1 = 99999;
	var max1 = 0;

	var totalTime2 = 0;
	var totalTimes2 = 0;
	var min2 = 99999;
	var max2 = 0;

	var audioCtx = new AudioContext();

	var base64mode = false;

	var soundplayersstorages;// = [[], [], [], []];
	var soundplayersstorage;
	var soundchoice;
	var time;

	function updateSoundChoice() {
		soundchoice = parseInt(document.form.soundchoice.value);
		if (!soundplayersstorages) soundplayersstorages = []
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
	