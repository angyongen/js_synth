function log(x) {
	var element = document.createElement("pre")
	//element.innerHTML = x;
	document.form.log.value += (x+ '\n')
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
document.getElementById('time_display').textContent = document.form.time.value
updateInputTypes();
updateSoundChoice();
updateTimeChoice();

function displayNoteState(midinote, percentage) {
	if (!audioCtx || audioCtx.state == "running") {
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
}

function noteDown(midinote, volume) {
	var t0 = performance.now();

	var frequency = 440 * Math.pow(2, ( (midinote - 69) / 12) )

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

function getTouchedKeys(touches) {
	var result = []
	for (var i = touches.length - 1; i >= 0; i--) {
		var touchedElement = document.elementFromPoint(touches[i].clientX, touches[i].clientY);
		if (isKey(touchedElement)) result.push(touchedElement)
	}
	return result
}

document.form.log.value = ""
document.form.input.oninput = function(e) {
	if (this.value) {
		var keyId = 'AWSEDFTGYHJIKL'.indexOf(this.value[this.value.length - 1].toUpperCase())
		this.value='';
		var midinote = parseInt(document.form.kb_offset.value) + keyId
		noteDown(midinote)
	}
}
document.body.onkeydown = function (event) {
	event.preventDefault();
	if (document.form.inputchoice_kb.checked) {
		var keyId = keyCodeMapping.indexOf(event.keyCode)
		if (keyId != -1) {
			var midinote = parseInt(document.form.kb_offset.value) + keyId
			noteDown(midinote)
		}
	}
}
document.body.onkeyup = function (event) {
	if (document.form.inputchoice_kb.checked) {
		var keyId = keyCodeMapping.indexOf(event.keyCode)
		if (keyId != -1) {
			var midinote = parseInt(document.form.kb_offset.value) + keyId
			noteUp(midinote)
		}
	}
}
var keyContainer = document.getElementById("keys")
keyContainer.ontouchstart = function(e) {
	if (document.form.scrollLock.checked) {
		e.preventDefault();
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