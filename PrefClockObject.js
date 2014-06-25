function removeClockAnimator(){
	this.start = 0;
	this.final = 0;
	this.element = null;
	this.step = 1;
	this.stepChange = 0;
	this.timer = null;
	this.mode = 0;
	
	this.doStep = function(){
		if(this.mode == 0){
			this.element.style.top = (this.start + Math.floor(this.stepChange * this.step)) + "px";
			this.shadow.style.top = (this.start + Math.floor(this.stepChange * this.step)) - 4 + "px";
		} else
			this.element.style.height = (22 - Math.ceil(2.2 * this.step)) + "px";

		if(this.mode == 1){
			this.shadow.style.opacity = 1.0 - (0.1 * this.step);
			this.element.style.opacity = 1.0 - (0.1 * this.step);
		}
		
		if(this.step == 10){
			if(this.mode == 0){
				this.element.style.top = this.final + "px"
			} else {
				this.element.parentNode.removeChild(this.element);
				this.shadow.parentNode.removeChild(this.shadow);
			}
	
			this.active = false;
			clearInterval(this.timer);
			this.timer = null;
			return;
		}
		this.step++
	}

	this.animate = function(){
		this.step = 0;
		this.active = true;
       	var _this = this;
       	this.start = parseInt(this.element.style.top)
       	this.stepChange = (this.final - this.start) / 10;
		this.timer = setInterval(function(){_this.doStep()}, 20);
	}

	this.cancel = function(){	
		clearInterval(this.timer);
		this.timer = null;
	}
}

	
function PreferenceClock(position, details) {
	var _self = this;
	this.currentMode = -1
	this.city = details[1];
	this.country = details[2];
	this.uid = details[0];

	this.shadow = document.createElement('div');
	this.shadow.setAttribute ("class", "pref-current-clock-item-shadow");
	document.getElementById("behind").appendChild(this.shadow);

	this.container = document.createElement('div');
	this.container.setAttribute ("class", "pref-current-clock-item");
	this.container.setAttribute ("id", "pref-current-clock-" + this.city);
	this.container.style.top = (position * 22) + "px"
	this.container.onmousedown = function(event){ if(event.button == 0){_self.startDrag();} };

	this.button = document.createElement('div');
	this.button.setAttribute ("class", "pref-current-clock-remove-button");
	this.button.onclick = function(){ _self.remove(); };
	this.button.onmousedown = function(){  };
	this.container.appendChild(this.button);

	var title = document.createElement('div');
	title.setAttribute("class", "pref-current-clock-item-title ellipsis");
	title.innerHTML = getLocalizedString(this.city);
	this.container.appendChild(title);
	

	this.animator = new AnimationController();
	this.animator.pushCallback(function(){ _self.animationFinished(); });
	this.animationObject = new AnimationObject(this.container);
	this.animationObjectShadow = new AnimationObject(this.shadow);

	this.animationObjectInsertion = new AnimationObject(this.container);
	this.animationObjectInsertionShadow = new AnimationObject(this.shadow);
	
	this.mouseMoveHandler = function(){ _self.mouseMove(); };
	this.mouseUpHandler = function() { _self.mouseUp(); };
}

PreferenceClock.prototype.doAddAnimation = function(start, end, inlineposition)
{
	_self = this;
	this.finalPosition = inlineposition;
	this.shadow.style.display = "block"
	this.shadow.style.top = start - 4 + "px";
	this.container.style.top = start + "px";
	this.container.style.left = "32px";
	this.container.setAttribute("class", "pref-current-clock-item pref-current-clock-item-drag");

	this.animationObjectInsertionShadow.setOptions(0, 10);
	this.animationObjectInsertionShadow.purgePhases();
	this.animationObjectInsertionShadow.pushPhase(kAnimatorMoveVerticalTop, start - 4, end - 4, 10, 0, null)

	this.animationObjectInsertion.setOptions(0, 10);
	this.animationObjectInsertion.purgePhases();
	this.animationObjectInsertion.pushPhase(kAnimatorMoveVerticalTop, start, end, 10, 0, null)
		
	this.animator.purge();
	this.animator.purgeCallbacks();
	this.animator.pushCallback(function(){ _self.addAnimationFinished(); });
	this.animator.pushGroup(Array(this.animationObjectInsertion, this.animationObjectInsertionShadow));
	this.animator.prepare(200, 10);
	this.animator.run();
}


PreferenceClock.prototype.addAnimationFinished = function()
{
	this.shadow.style.display = "none";
	this.container.setAttribute("class", "pref-current-clock-item");

	this.container.parentNode.removeChild(this.container);
	document.getElementById("pref-clock-container").appendChild(this.container);
	this.container.setAttribute("class", "pref-current-clock-item");
	this.container.style.top = this.finalPosition + "px"
	this.container.style.left = "0px";
	this.shadow.style.display = "none"
}

PreferenceClock.prototype.animationFinished = function()
{
	this.shadow.style.display = "none";
	this.container.setAttribute("class", "pref-current-clock-item");
}

PreferenceClock.prototype.startDrag = function()
{
	if(this.animator.active || p.animator.active)
		return;
		
    document.addEventListener("mousemove", this.mouseMoveHandler, true);
    document.addEventListener("mouseup", this.mouseUpHandler, true);
}

PreferenceClock.prototype.mouseMove = function()
{
    document.removeEventListener("mouseup", this.mouseUpHandler, true);
    document.removeEventListener("mousemove", this.mouseMoveHandler, true);
	p.startClockDrag(this);
}

PreferenceClock.prototype.mouseUp = function()
{
	alert("mouseUp");
    document.removeEventListener("mousemove", this.mouseMoveHandler, true);
}

PreferenceClock.prototype.remove = function()
{
	if(this.animator.active != false)
		return;
    document.removeEventListener("mousemove", this.mouseMoveHandler, true);
	p.removeClock(this);
}

PreferenceClock.prototype.cleanup = function()
{
	this.container.parentNode.removeChild(this.container)
}