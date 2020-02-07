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

function noteDown(midinote) {
	var t0 = performance.now();

	var frequency = 440 * Math.pow(2, ( (midinote - 69) / 12) )
	var soundplayer = getPlayer(midinote, frequency)
	soundplayer._debugStartTime = t0;

	soundplayer.onplaying = function() {
		var t1 = performance.now();
		var time = (t1 - t0)
		if (time < min2) min2 = time
		if (time > max2) max2 = time
		log("t2:"+ time +", avg:" + (totalTime2 += time)/(++totalTimes2) + ", min" + min2 + ", max" + max2);
	}

	startPlayer(soundplayer)
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


document.form.log.value = ""
document.form.input.oninput = function(e) {
	var keyId = 'AWSEDFTGYHJIKL'.indexOf(this.value[this.value.length - 1].toUpperCase())
	this.value='';
	var midinote = parseInt(document.form.kb_offset.value) + keyId
	noteDown(midinote)
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
var keys = document.getElementById("keys").children
for (var keyId = 0; keyId < keys.length; keyId++) {
	keys[keyId].id = keyId;
	keys[keyId].ondragstart = function() {return false;}
	keys[keyId].onclick = function(e) {noteDown(parseInt(this.id)+21)}
	keys[keyId].onmouseenter = function(e) {
		if(e.buttons == 1) {
			noteDown(parseInt(this.id)+21)
		}
	}
	keys[keyId].ontouchstart = function(e) {
		var touchedElement = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
		if (document.form.scrollLock.checked) {
			e.preventDefault();
			noteDown(parseInt(this.id)+21)
		} else {
		}
		lastTouchElement = touchedElement
	};
	keys[keyId].ontouchmove = function(e) {
		var touchedElement = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
		if (document.form.scrollLock.checked) {
			if (lastTouchElement != touchedElement) {
				if (touchedElement && touchedElement.id) noteDown(parseInt(touchedElement.id)+21)
			}
		}
		lastTouchElement = touchedElement
	}
}