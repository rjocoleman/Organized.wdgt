function Updater() {
	this.visible = false;
	this.currentversion = 1.11;
	this.updateVersion = 0.0;
}

Updater.prototype.setup = function(silent)
{
    this.scroller = new AppleVerticalScrollbar(document.getElementById("updateCheckerNewFeaturesScroller"));
    this.scrollArea = new AppleScrollArea(document.getElementById("updateCheckerNewFeaturesScrollerContainer"));
   	this.scrollArea.addScrollbar(this.scroller);
   	
   	var _self = this;
   	this.timer = setInterval(function(){ _self.timerCheck(); }, 86400000);
}

Updater.prototype.timerCheck = function()
{
	if(p.v("update checker") == "1")
		this.check(true);
}

Updater.prototype.getReleaseNotes = function()
{
	var _self = this;
	url = 'http://islayer.com/index.php?op=releasenotes&id=64&type=1&v=' + this.currentversion + '&random=' + new Date().getTime(); // real
	releaseNotesRequest = new XMLHttpRequest();
	releaseNotesRequest.open("GET", url, true);
	releaseNotesRequest.onreadystatechange = function() {
		if(releaseNotesRequest.readyState == 4) {
			if(releaseNotesRequest.status == 200){
				_self.processReleaseNotes(releaseNotesRequest.responseText);
			}	
		}
	}
	releaseNotesRequest.send(null);
}

Updater.prototype.check = function(silent)
{
	var _self = this;
	url = 'http://islayer.com/index.php?op=version&id=64&type=1&random=' + new Date().getTime(); // real
	versionCheckRequest = new XMLHttpRequest();
	versionCheckRequest.open("GET", url, true);
	versionCheckRequest.onreadystatechange = function() {
		if(versionCheckRequest.readyState == 4) {
			if(versionCheckRequest.status == 200){
				_self.processVersion(parseFloat(versionCheckRequest.responseText), silent);
			}	
		}
	}
	versionCheckRequest.send(null);
}

Updater.prototype.processReleaseNotes = function(response)
{
	while (document.getElementById("updateCheckerNewFeatures").hasChildNodes())
		document.getElementById("updateCheckerNewFeatures").removeChild(document.getElementById("updateCheckerNewFeatures").firstChild);

	var notes = null;
	try {
		notes = eval(response);
	}
	catch(err){
		notes = Array("Release notes not available");
	}
	if(notes == null)
		notes = Array("Release notes not available");
	 

	for(x=0;x<notes.length;x++){
		var li = document.createElement("li");
		li.style.width = "160px"
		li.style.padding = "0px 0px 2px 0px";
		li.innerHTML = notes[x];
		document.getElementById("updateCheckerNewFeatures").appendChild(li);
	}	
	this.reposition();
	this.show();
}

Updater.prototype.processVersion = function(version, silent)
{
	this.updateVersion = version;
	if(p.v("skip update version") && p.v("skip update version") == version){
		return;
	}
	
	 if(version > this.currentversion){
	 	this.getReleaseNotes();
		this.latestversion = version;
	 } else {
	 	if(!silent){
	 		this.showCurrent();
	 	}
	 }
}

Updater.prototype.showCurrent = function()
{
	alert("showCurrent");
	this.visible = true;
	document.getElementById("updater-current").style.opacity = 0;
	document.getElementById("updater-current").style.display = "block"

	var updateHeight = parseInt(document.defaultView.getComputedStyle(document.getElementById("updater-current"),"").getPropertyValue("height"));
	var windowHeight = window.outerHeight;
	var offset = (windowHeight - updateHeight - 5) / 2
	document.getElementById("updater-current").style.top = offset + "px"
	document.getElementById("updater-current").style.opacity = 1;
	document.getElementById("back-updater-mask").style.height = window.outerHeight + "px";
	document.getElementById("back-updater-mask").style.display = "block";
	this.fadeOut();
}

Updater.prototype.show = function()
{
	this.visible = true;
	document.getElementById("updater-new").style.opacity = 0;
	document.getElementById("updater-new").style.display = "block"


	var releaseNotesHeight = parseInt(document.defaultView.getComputedStyle(document.getElementById("updateCheckerNewFeatures"),"").getPropertyValue("height"));
	if(releaseNotesHeight > 125){
		releaseNotesHeight = 125;
		document.getElementById("updateCheckerNewFeaturesScroller").style.height = (releaseNotesHeight + 13) + "px"
		document.getElementById("updateCheckerNewFeaturesScrollerContainer").style.height = "125px"
		document.getElementById("updateCheckerNewFeaturesScroller").style.display = "block";
		this.scrollArea.refresh();
		this.scroller.refresh();
	} else {
		document.getElementById("updateCheckerNewFeatures").style.height = releaseNotesHeight + "px";
		document.getElementById("updateCheckerNewFeaturesScrollerContainer").style.height = (releaseNotesHeight + 5) + "px"
		document.getElementById("updateCheckerNewFeaturesScroller").style.display = "none";
	}


	var updateHeight = parseInt(document.defaultView.getComputedStyle(document.getElementById("updater-new"),"").getPropertyValue("height"));
	var windowHeight = window.outerHeight;
	var offset = (windowHeight - updateHeight - 5) / 2
	document.getElementById("updater-new").style.top = offset + "px"

	document.getElementById("updater-new").style.opacity = 1;
	if(p.active){
		document.getElementById("back-updater-mask").style.height = window.outerHeight + "px";
		document.getElementById("back-updater-mask").style.display = "block";
	}
	
	
	
	this.fadeOut();
}

Updater.prototype.fadeOut = function(){
	if(p.active){
		document.getElementById("pref-tab-container").style.opacity = 0.3;
		document.getElementById("pref-tab-buttons").style.opacity = 0.3;
		document.getElementById("done").style.opacity = 0.3;
	} else {
		document.getElementById("update-fader-top").style.display = "block"
		document.getElementById("update-fader-nav").style.display = "block"
		document.getElementById("update-fader-tabs").style.display = "block"
	}
}

Updater.prototype.hide = function()
{
	this.visible = false;
	document.getElementById("updater-current").style.display = "none"
	document.getElementById("updater-new").style.display = "none"
	document.getElementById("update-fader-top").style.display = "none"
	document.getElementById("update-fader-nav").style.display = "none"
	document.getElementById("update-fader-tabs").style.display = "none"
	document.getElementById("pref-tab-container").style.opacity = 1.0;
	document.getElementById("pref-tab-buttons").style.opacity = 1.0;
	document.getElementById("done").style.opacity = 1.0;
	document.getElementById("back-updater-mask").style.display = "none";
}

Updater.prototype.get = function()
{
	widget.openURL("http://islayer.com/index.php?op=item&id=64");
	this.hide();
}

Updater.prototype.skip = function()
{
	widget.setPreferenceForKey(this.updateVersion, "skip update version");
	this.hide();
}

Updater.prototype.later = function()
{
	this.hide();
}

Updater.prototype.reposition = function()
{
}