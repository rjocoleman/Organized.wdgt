function Event(position, details) {
	var _self = this;
	this.isHeader = false;

	this.name = details[1].replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
	this.mode = details[2][0];
	this.uid = details[0]
	this.eventurl = details[6]
	this.notes = details[5];
	this.eventlocation = details[4]
	this.people = details[3]
	this.calendar = details[7];
	
	var startComponents = details[8];
	var endComponents = details[9];

	this.startDate = new Date();
	this.startDate.setTime(parseInt(details[2][1]) * 1000)
	this.endDate = new Date();
	this.endDate.setTime(parseInt(details[2][2]) * 1000)
	
	this.container = document.createElement('div');
	this.container.setAttribute ("class", "event-item-container");
	this.container.setAttribute ("title", details[1]);
	this.cssClassName = "event-item-container";
	
	this.container.setAttribute ("style", "top:" + (position) + "px");
	this.container.style.display = "none";
	this.container.onmousedown = function(){ _self.highlightEvent(); };
	this.container.onclick = function(){ _self.selectEvent(); };
	this.container.setAttribute("onmousedown", "eventsController.eventDown(this)");
	this.container.setAttribute("onmouseup", "eventsController.eventUp(this)");
	document.getElementById("event-index-content").appendChild(this.container);

	this.highlight = document.createElement('div');
	this.highlight.setAttribute ("class", "event-item-container-highlight");
	this.container.appendChild(this.highlight);

	this.title = document.createElement('div');
	this.title.setAttribute ("class", "event-item-title ellipsis");
	this.title.innerHTML = this.name;
	this.container.appendChild(this.title);

	this.timefield = document.createElement('div');
	this.timefield.setAttribute ("class", "event-item-time");
	
	if(this.mode == 0 || this.mode == 3){
		this.timefield.innerHTML = "ALL DAY";
	} else {
	}
	this.container.appendChild(this.timefield);
	
	this.animationObject = new AnimationObject(this.highlight);
	this.animationObject.setOptions(0, 33);

	this.positionAnimationObject = new AnimationObject(this.container);
	this.positionAnimationObject.setOptions(0, 10);
	
	this.visible = false;
}

Event.prototype.updateTime = function()
{
	if(this.mode == 0 || this.mode == 3)
		return;
		
	if(p.v("use 24hr time") == "1"){
		this.timefield.innerHTML = "";
		this.timefield.innerText = Organized.formattedDate(this.startDate.getTime()/1000, "%H:%M")
	} else {
		this.timefield.innerHTML = "";
		
		this.timefield.innerText = Organized.formattedDate(this.startDate.getTime()/1000, "%1I:%M")

		this.timefieldHour = document.createElement("span");
		this.timefieldHour.setAttribute("class", "event-item-time-hour");
		
		if(this.startDate.getHours() > 11)
			this.timefieldHour.innerText = "pm";
		else
			this.timefieldHour.innerText = "am";

		this.timefield.appendChild(this.timefieldHour);
	}
}

Event.prototype.resetText = function()
{
	this.title.setAttribute("class", "event-item-title ellipsis");
	this.timefield.setAttribute("class", "event-item-time");
}

Event.prototype.highlightFromDown = function()
{
	var _self = this;
	this.highlight.style.opacity = 1;
	this.title.setAttribute("class", "event-item-title ellipsis event-item-name-fade-9");
	this.timefield.setAttribute("class", "event-item-time event-item-name-fade-9");
	
	document.addEventListener("mouseup", function(){_self.unhighlightFromDown()}, false);
}

Event.prototype.unhighlightFromDown = function()
{
	if(this.isSelected)
		return;
	var _self = this;
	this.highlight.style.opacity = 0;
	this.title.setAttribute("class", "event-item-title ellipsis");
	this.timefield.setAttribute("class", "event-item-time");
	document.removeEventListener("mouseup", function(){_self.unhighlightFromDown()}, false);
}

Event.prototype.highlightEvent = function()
{
	this.title.setAttribute("class", "event-item-title ellipsis event-item-name-fade-9");
	this.timefield.setAttribute("class", "event-item-time event-item-name-fade-9");
	this.highlight.style.opacity = 1;
}

Event.prototype.unhighlightEvent = function()
{
	this.title.setAttribute("class", "event-item-title ellipsis");
	this.timefield.setAttribute("class", "event-item-time");
	this.highlight.style.opacity = 0;
}

Event.prototype.selectEvent = function()
{
	this.isSelected = true;
	eventsController.selectEvent(this);
}

Event.prototype.startDrag = function()
{
	clockController.startDrag(this.city)	
}

Event.prototype.eventheight = function()
{
	return 26;
}