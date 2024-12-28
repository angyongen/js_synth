function log(x) {
	var element = document.createElement("pre")
	//element.innerHTML = x;
	var value = document.form.log.value
	value = value.slice(-1000) + (x+ '\n')
	document.form.log.value = value
	document.form.log.scrollTop = document.form.log.scrollHeight
}
function updateInputTypes() {
	document.getElementById("input_kb").style.display = document.form.inputchoice_kb.checked?"":"none"
	document.getElementById("input_vp").style.display = document.form.inputchoice_vp.checked?"":"none"
	document.getElementById("input_sm").style.display = document.form.inputchoice_sm.checked?"":"none"
}
function updateSoundChoice() {
	soundchoice = parseInt(document.form.soundchoice.value)
}

initialiseVariables()
document.getElementById('kb_offset_display').textContent = document.form.kb_offset.value
document.getElementById('kb_transpose_display').textContent = document.form.kb_transpose.value
document.getElementById('time_display').textContent = document.form.time.value
updateInputTypes();
updateSoundChoice();
updateTimeChoice();

function displayNoteState(midinote, percentage) { //percentage is 0 to 1
	if (!audioCtx || audioCtx.state == "running") {
		var keys = document.getElementById("keys").children
		var keyId = noteToId(midinote)
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
}

function midinote_to_frequency(midinote) {
	return 442 * Math.pow(2, ( (midinote - 69) / 12) )
}

function noteDown(midinote, volume) {
	var t0 = performance.now();

	var frequency = midinote_to_frequency(midinote)

	var soundplayer = getPlayer(midinote, frequency, volume)
	soundplayer._debugStartTime = t0;

	soundplayer.onplaying = function() {
		var t1 = performance.now();
		var time = (t1 - t0)
		if (time < min2) min2 = time
		if (time > max2) max2 = time
		log("t2:"+ time +", avg:" + (totalTime2 += time)/(++totalTimes2) + ", min" + min2 + ", max" + max2);
	}
	startPlayer(soundplayer, 1)

}

function noteUp(midinote) {
	if (!document.form.sustain.checked) {
		stopAll(midinote)
	}
}

function allKeysUp() {
	var keys = keyContainer.children
	for (var keyId = 0; keyId < keys.length; keyId++) {
		noteUp(idToNote(keyId))
	}
}

function isKey(element) {
	if (element && (element.className == 'w' || element.className == "b") && element.id && !isNaN(element.id)) {
		return true
	} else {
		return false
	}
}
function idToNote(id) {
	return parseInt(id)+21
}
function noteToId(note) {
	return note-21
}

function getTouchedKeys(touches) {
	var result = []
	for (var i = touches.length - 1; i >= 0; i--) {
		var touchedElement = document.elementFromPoint(touches[i].clientX, touches[i].clientY);
		if (isKey(touchedElement)) result.push(touchedElement)
	}
	return result
}

function noteKeyEvent(key, eventFunction, wkeyOffset, transpose) {
	var ukey = key.toLowerCase()
	var wkey = whiteKeyCodeMappings.indexOf(key)
	var bkey = blackKeyCodeMappings.indexOf(key)
	if (wkey == -1 && bkey == -1) return;
	//get offset
	var bwmappingLength = blackWhiteMappings.length
	var noOffsetWhiteKeys = []
	for (var i = 0; i < bwmappingLength; i++) {
		var noOffset_keyType = blackWhiteMappings[i]
		if (noOffset_keyType == "w") noOffsetWhiteKeys.push(i)
	}
	var wkeys_in_group = noOffsetWhiteKeys.length//whiteKeyOffsets.length
	//var bkeys_in_group = blackKeyOffsets.length
	var grouplength = blackWhiteMappings.length//wkeys_in_group + bkeys_in_group
	var groupOffset = wkeyOffset % wkeys_in_group
	var groupNumber = (wkeyOffset-groupOffset) / wkeys_in_group
	//firstwkeyInGroup = 
	midiOffset = grouplength * groupNumber + noOffsetWhiteKeys[groupOffset]

	var whiteKeyOffsets = []
	var blackKeyOffsets = []
	var lastKeyType = "";
	for (var i = 0; i < bwmappingLength; i++) {
		var keyType = blackWhiteMappings[(i+midiOffset)%bwmappingLength]
		switch (keyType) {
			case "w":
			if (lastKeyType == keyType) blackKeyOffsets.push(-1)
			whiteKeyOffsets.push(i)
			break;
			case "b":
			if (lastKeyType == keyType) whiteKeyOffsets.push(-1)
			blackKeyOffsets.push(i)
			break;
		}
		lastKeyType = keyType;
	}

	if (wkey != -1) {
		var keyoffset = whiteKeyOffsets[wkey]
		if (keyoffset != -1) eventFunction(midiOffset + keyoffset + transpose)
	}
	if (bkey != -1) {
		var keyoffset = blackKeyOffsets[bkey]
		if (keyoffset != -1) eventFunction(midiOffset + keyoffset + transpose)
	}
	//switch(blackWhiteMappingString
		//var midinote =  + keyId
		//eventFunction(midinote)
}

function genericKeyEvent(key, noteFunction) {
	switch (key) {
		case sustainKeyCode:
		document.form.sustain.click()
		break;
		default:
		noteKeyEvent(key, noteFunction, parseInt(document.form.kb_offset.value), parseInt(document.form.kb_transpose.value))
	}
}

document.form.log.value = ""
document.form.input.oninput = function(e) {
	if (this.value) {
		genericKeyEvent(this.value[this.value.length - 1], noteDown)
		this.value='';
	}
}
var pressed = {}
var allowMultipleKeyDown = false
document.body.onkeydown = function (event) {
	event.preventDefault();
	if (!pressed[event.key] || allowMultipleKeyDown) {
		pressed[event.key] = true
		if (document.form.inputchoice_kb.checked) genericKeyEvent(event.key, noteDown)
	}
}
document.body.onkeyup = function (event) {
	pressed[event.key] = false
	if (document.form.inputchoice_kb.checked) genericKeyEvent(event.key, noteUp)
}
var keyContainer = document.getElementById("keys")
keyContainer.ontouchstart = function(e) {
	if (document.form.scrollLock.checked) {
		e.preventDefault();
	}
}
keyContainer.ontouchend = function(e) {
	if(!e.cancelable) {
			updateTouchedKeys(getTouchedKeys(e.touches))
			log("touchend" + "kc")
			e.preventDefault()
		//} else { log("touchendcancelable" + "kc")
		}
}
function updateTouchedKeys(touchedKeys) {
	for (var i = lastTouchedKeys.length - 1; i >= 0; i--) {//find released keys
		var lastTouchedElement = lastTouchedKeys[i]
		if (!touchedKeys.includes(lastTouchedElement)) noteUp(idToNote(lastTouchedElement.id))
	}
	if (document.form.scrollLock.checked) {
		for (var i = touchedKeys.length - 1; i >= 0; i--) {//find new keys
			var touchedElement = touchedKeys[i]
			if (!lastTouchedKeys.includes(touchedElement)) noteDown(idToNote(touchedElement.id))
		}
	}
	lastTouchedKeys = touchedKeys
}
var keys = keyContainer.children
for (var keyId = 0; keyId < keys.length; keyId++) {
	keys[keyId].id = keyId;
	keys[keyId].ondragstart = function() {return false;}
	keys[keyId].onmousedown = function(e) {
    noteDown(idToNote(this.id))
		lastTouchElement = e.target
		log("mousedown" + this.id)
	}
	keys[keyId].onmouseup = function(e) {
		noteUp(idToNote(this.id))
		lastTouchElement = null
		log("mouseup" + this.id)
	}
	keys[keyId].onmouseenter = function(e) {
		if(e.buttons == 1 && e.target != lastTouchElement) {
			noteDown(idToNote(this.id))
		}
		lastTouchElement = e.target
		log("mouseenter" + this.id)
	}
	keys[keyId].onmouseleave = function(e) {
		if(e.buttons == 1) {
			noteUp(idToNote(this.id))
		}
		log("mouseleave" + this.id)
	}
	keys[keyId].ontouchstart = function(e) {
		//var touchedElement = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
		noteDown(idToNote(this.id))
		lastTouchedKeys.push(this)
		log("touchstart" + this.id)
	};
	keys[keyId].ontouchend = function(e) {
		if(e.cancelable) {
			updateTouchedKeys(getTouchedKeys(e.touches))
			log("touchend" + this.id)
			e.preventDefault()
		}
	}
	keys[keyId].ontouchmove = function(e) {
		updateTouchedKeys(getTouchedKeys(e.touches))
	}
}

var analyser = create_analyser_builtin(4096, null, 1, 0)

function updateSpectrogram() {

	var spectrogram = getSpectrogramBuffer(analyser)

	for (var keyId = 0; keyId < keys.length; keyId++) {
		var midinote = idToNote(keyId)
		var frequency = midinote_to_frequency(midinote)
		var closestBin = getClosestBin(frequency)
		var percentage = spectrogram[closestBin]
		switch (keys[keyId].className) {
			case "w":
				intensity = Math.round(255-percentage)
				keys[keyId].style.background = "rgb(255,"+intensity+","+intensity+")"
				break;
			case "b":
				intensity = Math.round(percentage)
				keys[keyId].style.background = "rgb("+intensity+",0,0)"
				break;
		}
	}
}


function startSpectrogram() {
	var oldDestination = audioCtx_destination
	audioCtx_destination = analyser
	analyser.connect(oldDestination)
	animatedSpectrogram()
}
var spectrogramEnabled = document.form.spectrogram_enabled.checked
function spectrogramEnabledChanged() {
	spectrogramEnabled = document.form.spectrogram_enabled.checked
	if (spectrogramEnabled) startSpectrogram()
}
function animatedSpectrogram() {
      if (spectrogramEnabled) requestAnimationFrame(animatedSpectrogram)
      updateSpectrogram()
}