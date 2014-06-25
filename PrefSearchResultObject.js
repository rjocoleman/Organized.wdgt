function PreferenceSearchClock(details) {
	var _self = this;
	this.searchdisplay = details[1] + "" + details[2];
	this.display = details[1];
	this.uid = details[0];
	this.searchkeys = details[3];

	this.container = document.createElement('div');
	this.container.setAttribute ("class", "search-result-item");
	this.container.style.display = "none";
	document.getElementById("search-results-content").appendChild(this.container);

	this.button = document.createElement('div');
	this.button.setAttribute ("class", "search-result-item-button");
	this.button.onclick = function() { _self.add(); };
	this.container.appendChild(this.button);

	var title = document.createElement('div');
	title.setAttribute ("class", "search-result-item-title ellipsis");
	this.container.appendChild(title);

	var newnameparts = Array();
	var nameparts = this.searchdisplay.split(", ");
	for(z=0;z<nameparts.length;z++){
		newnameparts.push(getLocalizedString(nameparts[z]));
	}
	title.innerHTML = getLocalizedString(details[1]) + ", " + getLocalizedString(details[2]);
	
	this.enabled = false;
}

PreferenceSearchClock.prototype.add = function()
{
	if(this.enabled){
		this.disable();
		p.addClock(this)
	}
}

PreferenceSearchClock.prototype.enable = function()
{
	this.enabled = true;
	this.button.style.opacity = 1;
}

PreferenceSearchClock.prototype.disable = function()
{
	this.enabled = false;
	this.button.style.opacity = 0.25;
}