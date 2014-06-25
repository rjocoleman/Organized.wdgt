function EventHeader(baseDate) {
	var _self = this;
	this.time = baseDate.getTime();

	this.container = document.createElement("div");
	this.container.setAttribute("class", "event-day-header");
	document.getElementById("event-index-content").appendChild(this.container);
	this.cssClassName = "event-day-header";

	this.title = document.createElement("div");
	this.title.setAttribute("class", "event-day-header-text ellipsis");
	this.container.appendChild(this.title);

	
	this.positionAnimationObject = new AnimationObject(this.container);
	this.positionAnimationObject.setOptions(0, 10);
	
	this.updateDisplay();
	
	this.visible = false;
	this.isHeader = true;
}

EventHeader.prototype.eventheight = function()
{
	return 18;
}

EventHeader.prototype.updateDisplay = function()
{
	var displayDate = new Date();
	displayDate.setTime(this.time);
	
	var now = new Date()
	var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
	var tomorrow = new Date();
	tomorrow.setTime(today.getTime() + 86400000);
	var tomorrow2 = new Date();
	tomorrow2.setTime(tomorrow.getTime() + 86400000);

	if(displayDate.getTime() >= today.getTime() && displayDate.getTime() < tomorrow.getTime())
		this.title.innerHTML = getLocalizedString("Today");
	else if(displayDate.getTime() >= tomorrow.getTime() && displayDate.getTime() < tomorrow2.getTime())
		this.title.innerHTML = getLocalizedString("Tomorrow");
	else
		this.title.innerHTML = Organized.formattedDate(displayDate.getTime()/1000, "%A, %B %e");
}

function EventSeperator() {
	var _self = this;

	this.container = document.createElement("div");
	this.container.setAttribute("class", "event-seperator");
	this.container.style.display = "none"
	document.getElementById("event-index-content").appendChild(this.container);
	this.cssClassName = "event-seperator";

	this.positionAnimationObject = new AnimationObject(this.container);
	this.positionAnimationObject.setOptions(0, 10);
	
	this.visible = false;
	this.isHeader = false;
}

EventSeperator.prototype.eventheight = function()
{
	return 2;
}

