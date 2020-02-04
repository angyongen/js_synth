
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
	function noteDown(midinote) {
		var frequency = 440 * Math.pow(2, ( (midinote - 69) / 12) )
		try {
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
		catch(err) {
			log(err.message);
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
