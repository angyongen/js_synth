
	function log(x) {
		var element = document.createElement("pre")
		//element.innerHTML = x;
		document.form.log.value += (x+ '\n')
		document.form.log.scrollTop = document.form.log.scrollHeight
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
	function checkSupport_InitialisePlayer() {
		if (audioCtx) {
			getPlayer = getWebAudioPlayer
			startPlayer = startWebAudioPlayer
		} else {
			getPlayer = getHTML5AudioPlayer
			startPlayer = startHTML5AudioPlayer
		}
	}
	function noteDown(midinote) {

		var t0 = performance.now();

		var frequency = 440 * Math.pow(2, ( (midinote - 69) / 12) )
		var soundplayer = getPlayer(midinote, frequency)
		startPlayer(soundplayer)

		var t1 = performance.now();
		var time = (t1 - t0)
		if (time < min2) min2 = time
		if (time > max2) max2 = time
		log("t2:"+ time +", avg:" + (totalTime2 += time)/(++totalTimes2) + ", min" + min2 + ", max" + max2);
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
