var noteRepeats, appendToDocument, keyCodeMapping, sampleRate, volume
var totalTime1, totalTimes1, min1, max1
var totalTime2, totalTimes2, min2, max2

var base64mode

var soundplayersstorages, soundplayersstorage, soundchoice

var getPlayer, startPlayer

var time

var lastTouchElement;
var lastTouchedKeys;

var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();
var audioCtx_destination// = audioCtx.destination;

function initialiseVariables() {
	noteRepeats = 5 //the number of duplicate note audio stored
	appendToDocument = false //whether or not note audio is appended to the soundplayers div
	keyCodeMapping = [81, 50, 87, 51, 69, 82, 53, 84, 54, 89, 55, 85, 73, 57, 79, 48, 80, 219, 61, 221]
	sampleRate = 44100

	volume = 0.25

	totalTime1 = 0
	totalTimes1 = 0
	min1 = 99999
	max1 = 0

	totalTime2 = 0
	totalTimes2 = 0
	min2 = 99999
	max2 = 0

	base64mode = false

	soundplayersstorages = []// = [[], [], [], []];

	lastTouchedKeys = []

	if (audioCtx) {
		audioCtx_destination = audioCtx.destination
		getPlayer = getWebAudioPlayer
		startPlayer = startWebAudioPlayer
		stopAll = stopAllWebAudioPlayer
	} else {
		getPlayer = getHTML5AudioPlayer
		startPlayer = startHTML5AudioPlayer
		stopAll = stopAllHTML5AudioPlayer
	}
}

function getSoundPlayersStorage() {
	if (!soundplayersstorages[soundchoice]) soundplayersstorages[soundchoice] = []
	return soundplayersstorages[soundchoice]
}
//var soundplayersplaying = new Uint8Array(128)
function getSoundPlayers(midinote) {
	var soundplayersstorage = getSoundPlayersStorage();
	if (!(midinote < soundplayersstorage.length)) soundplayersstorage[midinote] = []
	if (!soundplayersstorage[midinote]) soundplayersstorage[midinote] = []
	return soundplayersstorage[midinote]
}

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
