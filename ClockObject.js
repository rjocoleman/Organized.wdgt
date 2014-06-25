function Clock(position, id, data) {
	var _self = this;
	this.currentMode = -1
	this.city = data[1];
	this.uid = id;
	this.timezone = data[3];

	this.outercontainer = document.createElement('div');
	this.outercontainer.setAttribute ("class", "worldclock-item-outer");
	this.outercontainer.style.display = "none";
	this.outercontainer.setAttribute("id", this.city);
	document.getElementById("clock-contents-inner").appendChild(this.outercontainer);

	this.dragHandle = document.createElement('div');
	this.dragHandle.setAttribute ("class", "worldclock-item-draghandle");
	this.dragHandle.onmousedown = function(){ _self.startDrag(); };
	this.outercontainer.appendChild(this.dragHandle);

	this.container = document.createElement('div');
	if(clockController.tickstatus == 1)
		this.container.setAttribute ("class", "worldclock-item");
	else if(clockController.tickstatus == 0)
		this.container.setAttribute ("class", "worldclock-item");

	this.outercontainer.appendChild(this.container);

	this.clockfacetickContainer = document.createElement('div');
	this.clockfacetickContainer.setAttribute ("class", "clockface-container");
	this.container.appendChild(this.clockfacetickContainer);

	this.shine = document.createElement('img');
	this.shine.setAttribute ("class", "shine");
	this.shine.src = "./images/clocks/clock_shine.png";
	this.shine.width = "52";
	this.shine.height = "52";
	this.shine.style.opacity = 0.4;
	this.container.appendChild(this.shine);

	this.locationField = document.createElement('div');
	this.locationField.setAttribute ("class", "worldclock-location ellipsis");
	this.container.appendChild(this.locationField);
	this.locationField.innerHTML = getLocalizedString(this.city);

	this.date = document.createElement('div');
	this.date.setAttribute ("class", "worldclock-date");
	this.container.appendChild(this.date);

	this.time = document.createElement('div');
	this.time.setAttribute ("class", "worldclock-time");
	this.container.appendChild(this.time);

	this.canvas = document.createElement('canvas');
	this.canvas.setAttribute ("style", "position:absolute; left:6px; top:3px; z-index:5;");
	this.canvas.width = "41";
	this.canvas.height = "41";
	this.container.appendChild(this.canvas);
	
	this.animator = new AnimationController();
	this.animator.pushCallback(function(){ _self.animationFinished(); });
	this.miniclockAnimator = new AnimationObject(this.outercontainer);
}

Clock.prototype.updateMode = function()
{
	var _self = this;
	if(clockController.mode == 0)
		this.outercontainer.onmousedown = function(){ _self.startDrag(); };
	else
		this.outercontainer.onmousedown = function(){ };
}

Clock.prototype.animationFinished = function()
{
	this.outercontainer.setAttribute ("class", "worldclock-item-outer");
}

Clock.prototype.cleanup = function()
{
	this.outercontainer.parentNode.removeChild(this.outercontainer)
}

Clock.prototype.selectClock = function()
{
}

Clock.prototype.startDrag = function()
{
	clockController.startDrag(this)	
}

Clock.prototype.update = function(clockdata)
{
	var now = new Date();
	now.setDate(1);
	now.setFullYear(clockdata[3]);
	now.setMonth(clockdata[4] - 1);
	now.setDate(clockdata[5]);
	now.setHours(clockdata[0]);
	now.setMinutes(clockdata[1]);

	if(now.getHours() >= 18 || now.getHours() < 6){
		hourtype = "PM";
		if(this.currentMode != 1){
			this.currentMode = 1;
			if(clockController.tickstatus == 1)
				this.container.setAttribute ("class", "worldclock-item pm-ticks");
			else if(clockController.tickstatus == 0)
				this.container.setAttribute ("class", "worldclock-item pm-noticks");
		}
	} else {
		hourtype = "AM"
		if(this.currentMode != 0){
			this.currentMode = 0;
			if(clockController.tickstatus == 1)
				this.container.setAttribute ("class", "worldclock-item am-ticks");
			else if(clockController.tickstatus == 0)
				this.container.setAttribute ("class", "worldclock-item am-noticks");
		}
	}
	

	this.date.innerHTML = Organized.formattedDate(now.getTime()/1000, "%A %B %e")
	if(p.v("use 24hr time") == "1")
		this.time.innerHTML = Organized.formattedDate(now.getTime()/1000, "%H:%M")
	else
		this.time.innerHTML = Organized.formattedDate(now.getTime()/1000, "%1I:%M %p")


	var context = this.canvas.getContext("2d");
    context.clearRect(0, 0, 41, 41);
	context.save();

	context.save();
	
	//Hours
	var hangle = ((now.getHours() * 0.523598775598) + (now.getMinutes() * 0.008726646259966667)) * -1;
	
	context.beginPath();
	context.moveTo((0 * Math.cos(hangle) - 12.5 * Math.sin(hangle)) + 21.5,8.5 + (1 - (0 * Math.sin(hangle) + 12.5 * Math.cos(hangle))) + 13);
	context.lineTo((3 * Math.cos(hangle) - 0 * Math.sin(hangle)) + 21.5,8.5 + (1 - (3 * Math.sin(hangle) + 0 * Math.cos(hangle))) + 13);
	context.lineTo((-3 * Math.cos(hangle) - 0 * Math.sin(hangle)) + 21.5,8.5 + (1 - (-3 * Math.sin(hangle) + 0 * Math.cos(hangle))) + 13);

	context.closePath();

	if(this.currentMode == 0)
		context.fillStyle = "rgba(90, 96, 106, 1)";
	else
		context.fillStyle = "rgba(230, 230, 230, 1)";
	context.fill();
	context.restore();

	context.save();
	
	// Minutes
	
	var mangle = (now.getMinutes() * 0.10471975122) * -1;
	context.beginPath();
	context.moveTo((0 * Math.cos(mangle) - 16.5 * Math.sin(mangle)) + 21.5,8.5 + (1 - (0 * Math.sin(mangle) + 16.5 * Math.cos(mangle))) + 13);
	context.lineTo((3 * Math.cos(mangle) - 0 * Math.sin(mangle)) + 21.5,8.5 + (1 - (3 * Math.sin(mangle) + 0 * Math.cos(mangle))) + 13);
	context.lineTo((-3 * Math.cos(mangle) - 0 * Math.sin(mangle)) + 21.5,8.5 + (1 - (-3 * Math.sin(mangle) + 0 * Math.cos(mangle))) + 13);

	context.closePath();

	if(this.currentMode == 0)
		context.fillStyle = "rgba(97, 103, 114, 1)";
	else
		context.fillStyle = "rgba(255, 255, 255, 1)";
	context.fill();
	context.restore();

	context.save();

	// Center white dot
	var	pi = Math.PI;
	context.arc(21.5, 22.5, 3.5, pi, -pi, 0);
	if(this.currentMode == 0)
		context.fillStyle = "rgba(97, 103, 114, 1)";
	else
		context.fillStyle = "rgba(255, 255, 255, 1)";

	context.fill();
	context.restore();
	
	// Center black dot
	var	pi = Math.PI;
	context.arc(21.5, 22.5, 2.5, pi, -pi, 0);
	context.fillStyle = "rgba(0, 0, 0, 1)";

	context.fill();
	context.restore();
	
	// Seconds
	
	var sangle = (now.getSeconds() * 0.10471975122) * -1;
	context.beginPath();
	context.moveTo((-0.7 * Math.cos(sangle) - 17.5 * Math.sin(sangle)) + 21.5,8.5 + (1 - (-0.7 * Math.sin(sangle) + 17.5 * Math.cos(sangle))) + 13);
	context.lineTo((0.7 * Math.cos(sangle) - 17.5 * Math.sin(sangle)) + 21.5,8.5 + (1 - (0.7 * Math.sin(sangle) + 17.5 * Math.cos(sangle))) + 13);
	context.lineTo((0.7 * Math.cos(sangle) - 0 * Math.sin(sangle)) + 21.5,8.5 + (1 - (0.7 * Math.sin(sangle) + 0 * Math.cos(sangle))) + 13);
	context.lineTo((-0.7 * Math.cos(sangle) - 0 * Math.sin(sangle)) + 21.5,8.5 + (1 - (-0.7 * Math.sin(sangle) + 0 * Math.cos(sangle))) + 13);

	context.closePath();

	context.fillStyle = "rgba(255, 0, 0, 1)";
	context.fill();
	context.restore();
	
	
	// Center red dot
	var	pi = Math.PI;
	context.arc(21.5, 22.5, 1.5, pi, -pi, 0);
	context.fillStyle = "rgba(255, 0, 0, 1)";

	context.fill();
	context.restore();
}