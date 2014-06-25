var dragSnapback = {timer:null, element:null, step:0, start:0, total:0};
var dragAnimations = Array();


function Clocks() {	
	this.drag = {origin:0, offset:0, active:false, element:null, elementIndex:0};
	var _self = this;
	this.isSelected = false;
	this.contentHeight = 0;
	this.currentHeight = 100;
	this.realHeight = 0;
	this.displayItems = new Object();
	this.displayOrder = Array();
	this.doDragHandler = function(){ _self.doDrag(); };
	this.endDragHandler = function(){ _self.endDrag(); };
	this.snapbackHandler = function(){ _self.doSnapback(); };
	
	this.timerAction = function() { _self.updateClocks() };
	this.timer = setInterval(this.timerAction, 1000);
	
	this.animator = new AnimationController()
	
	if(p.v("clock ticks") != null)
		this.tickstatus = p.v("clock ticks");
	else
		this.tickstatus = 1;
		
	this.restoreClockMode();

	this.inModeSwitch = false;
}

Clocks.prototype.prepareToShow = function()
{
}

Clocks.prototype.prepareToHide = function()
{
}

Clocks.prototype.restoreClockMode = function()
{
	if(p.v("clock mode") != null)
		this.mode = parseInt(p.v("clock mode"));
	else
		this.mode = 1;

	if(this.mode == 1){
		this.clockHeight = 52;
		document.getElementById("clock-contents").setAttribute("class", "clock-mode-large");
	} else {
		this.clockHeight = 31;
		document.getElementById("clock-contents").setAttribute("class", "clock-mode-small");
	}
}

Clocks.prototype.switchMode = function()
{
	if(this.mode == 1){
		p.s("0", "clock mode")
	} else {
		p.s("1", "clock mode")
	}
	this.updateMode();
}

Clocks.prototype.finishedModeSwitchAnimation = function()
{
	this.inModeSwitch = false;
	if(this.mode == 0)
		document.getElementById("clock-contents").setAttribute("class", "clock-mode-small");
	else
		document.getElementById("clock-contents").setAttribute("class", "clock-mode-large");
	this.resize();
}

Clocks.prototype.switchModeBackgrounds = function()
{
	if(this.mode == 0)
		document.getElementById("clock-contents").setAttribute("class", "clock-mode-small clock-mode-animation");
	else
		document.getElementById("clock-contents").setAttribute("class", "clock-mode-large clock-mode-animation");
}	
	
Clocks.prototype.updateMode = function()
{
	if(this.inModeSwitch)
		return;
	
	this.mode = parseInt(p.v("clock mode"));
	
	if(this.mode == 1)
		document.getElementById("clock-drag-shadow").setAttribute("class", "clock-drag-shadow");
	else
		document.getElementById("clock-drag-shadow").setAttribute("class", "clock-drag-shadow-mini");
	
	if(this.mode == 1)
		this.clockHeight = 52;
	else
		this.clockHeight = 31;

	var oldHeight = this.realHeight;

	this.realHeight = this.displayOrder.length * this.clockHeight;
	
	if(!p.useanimation || p.active){
		for(x=0;x<this.displayOrder.length;x++){
			this.displayItems[this.displayOrder[x]].updateMode();
			this.displayItems[this.displayOrder[x]].outercontainer.style.top = (this.clockHeight * x) + "px";
			this.displayItems[this.displayOrder[x]].outercontainer.style.height = this.clockHeight + "px";
		}

		if(this.mode == 0)
			document.getElementById("clock-contents").setAttribute("class", "clock-mode-small");
		else
			document.getElementById("clock-contents").setAttribute("class", "clock-mode-large");

		this.resize();
		return;
	}

	if(this.mode == 0)
		document.getElementById("clock-contents").setAttribute("class", "clock-mode-large clock-mode-animation");
	else
		document.getElementById("clock-contents").setAttribute("class", "clock-mode-small clock-mode-animation");

	this.inModeSwitch = true;
	this.animator.purgeCallbacks();
	this.animator.purgeStepCallbacks();
	this.animator.purge();
	
	_self = this;
	this.animator.pushCallback(function(){ _self.finishedModeSwitchAnimation(); });

	var clockAnimators = Array();

	for(x=0;x<this.displayOrder.length;x++){
		this.displayItems[this.displayOrder[x]].updateMode();

		var animator = new AnimationObject(this.displayItems[this.displayOrder[x]].outercontainer);
		animator.setOptions(0, 30);
		
		if(this.mode == 0){
			this.animator.pushStepCallback(this.animator.callbackAtStep(10, function(){ _self.switchModeBackgrounds(); }));
			
			animator.pushPhase(kAnimatorMoveVerticalTop, parseInt(this.displayItems[this.displayOrder[x]].outercontainer.style.top), (this.clockHeight * x), 10, 0)
			animator.pushPhase(kAnimatorResizeHeight, 52, this.clockHeight, 10, 0)
			animator.pushPhase(kAnimateOpacity, 1, 0, 10, 0)
			animator.pushPhase(kAnimateOpacity, 0, 1, 20, 10)
		} else {
			this.animator.pushStepCallback(this.animator.callbackAtStep(20, function(){ _self.switchModeBackgrounds(); }));

			animator.pushPhase(kAnimatorMoveVerticalTop, parseInt(this.displayItems[this.displayOrder[x]].outercontainer.style.top), (this.clockHeight * x), 10, 20)
			animator.pushPhase(kAnimatorResizeHeight, 32, this.clockHeight, 10, 20)
			animator.pushPhase(kAnimateOpacity, 1, 0, 20, 0)
			animator.pushPhase(kAnimateOpacity, 0, 1, 10, 20)
		}
		clockAnimators.push(animator)
	}
	

	if(this.isSelected){
		if(window.outerHeight < (this.realHeight + 258 + 24))
			window.resizeTo(246, (this.realHeight + 258 + 24))
	}

	if(this.realHeight > oldHeight){
		document.getElementById("tab-clocks").style.height = this.realHeight + "px"
		document.getElementById("clock-contents").style.height = this.realHeight + "px"
	}

	var tabItem = new AnimationObject(document.getElementById("tab-container"));
	var bgItem = new AnimationObject(document.getElementById("main-background"));
	var baseItem = new AnimationObject(document.getElementById("main-base"));
	var inFade = new AnimationObject(document.getElementById("clock-contents-inner"));
	var outFade = new AnimationObject(document.getElementById("clock-contents-inner"));
	
	if(this.mode == 0){
		tabItem.setOptions(0, 10);
		tabItem.pushPhase(kAnimatorResizeHeight, oldHeight, this.realHeight, 10, 0)

		bgItem.setOptions(0, 10);
		bgItem.pushPhase(kAnimatorResizeHeight, oldHeight - 26, this.realHeight - 26, 10, 0)

		baseItem.setOptions(0, 10);
		baseItem.pushPhase(kAnimatorMoveVerticalTop, (oldHeight + 258 - 26), (this.realHeight + 258 - 26), 10, 0)
	} else {
		tabItem.setOptions(0, 30);
		tabItem.pushPhase(kAnimatorResizeHeight, oldHeight, this.realHeight, 10, 20)

		bgItem.setOptions(0, 30);
		bgItem.pushPhase(kAnimatorResizeHeight, oldHeight - 26, this.realHeight - 26, 10, 20)

		baseItem.setOptions(0, 30);
		baseItem.pushPhase(kAnimatorMoveVerticalTop, (oldHeight + 258 - 26), (this.realHeight + 258 - 26), 10, 20)
	}			
		

	clockAnimators.push(tabItem)
	clockAnimators.push(bgItem)
	clockAnimators.push(baseItem)
	
	this.animator.pushGroup(clockAnimators);
	this.animator.prepare(450, 30);
	this.animator.run();
}

Clocks.prototype.inConfirmation = function()
{
	return false;
}

Clocks.prototype.respondToKey = function(key)
{
}

Clocks.prototype.tabElement = function()
{
	return document.getElementById("tab-clocks");	
}

Clocks.prototype.deselectTab = function()
{
	document.getElementById("tab-button-clocks").setAttribute("class", "tab tab-clocks tab-unselected");
}

Clocks.prototype.selectTab = function()
{
	document.getElementById("tab-button-clocks").setAttribute("class", "tab tab-clocks tab-selected");
}

Clocks.prototype.resize = function()
{
	document.getElementById("tab-clocks").style.height = this.realHeight + "px"
	document.getElementById("clock-contents").style.height = this.realHeight + "px"
	
	if(this.isSelected){
		document.getElementById("tab-container").style.height = this.realHeight + "px"
		document.getElementById("main-background").style.height = (this.realHeight - 26) + "px"
		document.getElementById("main-base").style.top = (this.realHeight + 258 - 26) + "px"
		resizeFront(258 + 24 + this.realHeight);
	}
}

Clocks.prototype.setup = function()
{
	if(this.mode == 1)
		document.getElementById("clock-drag-shadow").setAttribute("class", "clock-drag-shadow");
	else
		document.getElementById("clock-drag-shadow").setAttribute("class", "clock-drag-shadow-mini");
	this.shadowAnimator = new AnimationObject(document.getElementById("clock-drag-shadow"));
	this.shadowAnimator.setOptions(kAnimateOptionsHide, 10);
}

Clocks.prototype.buildDisplay = function()
{
	this.displayItems = new Object();
	this.restoreDisplayFromPrefs();
	while (document.getElementById("clock-contents-inner").hasChildNodes())
		document.getElementById("clock-contents-inner").removeChild(document.getElementById("clock-contents-inner").firstChild);

	var added = 0;
	
	var validatedOrder = Array();
	for(x=0;x<this.displayOrder.length;x++){
		var data = Organized.cityDataForID(this.displayOrder[x]);
		if(!data)
			continue;
		validatedOrder.push(this.displayOrder[x]);
	}
	
	this.displayOrder = validatedOrder;
	
	for(x=0;x<this.displayOrder.length;x++){
		var data = Organized.cityDataForID(this.displayOrder[x]);
		if(!data)
			continue;
		var clock = new Clock(x, this.displayOrder[x], data);
		clock.outercontainer.style.display = "block";
		clock.updateMode();
		this.displayItems[this.displayOrder[x]] = clock;
	}
	
	this.sortClocks();
	
	this.currentHeight = (this.displayOrder.length * this.clockHeight);
	this.realHeight = this.currentHeight;
	this.resize()
	this.updateClocks(false);
}

Clocks.prototype.removeClock = function(uid)
{
	this.buildDisplay();
}

Clocks.prototype.sortClocks = function()
{	
	for(x=0;x<this.displayOrder.length;x++){
		this.displayItems[this.displayOrder[x]].outercontainer.style.top = (this.clockHeight * x) + "px"
	}
}

Clocks.prototype.updateSortOrder = function()
{
	this.realHeight = 0;
	this.displayOrder.length = 0;
	var cities = p.currentClocks();
	if(cities && cities.length > 0){
		this.displayOrder = cities;
	}

	var validatedOrder = Array();
	for(x=0;x<this.displayOrder.length;x++){
		var data = Organized.cityDataForID(this.displayOrder[x]);
		if(!data)
			continue;
		validatedOrder.push(this.displayOrder[x]);
	}
	
	this.displayOrder = validatedOrder;
}

Clocks.prototype.updateDisplay = function()
{
}

Clocks.prototype.didSelect = function()
{
	this.isSelected = true;
	this.resize()
}

Clocks.prototype.willSelect = function()
{
}

Clocks.prototype.didUnselect = function()
{
}

Clocks.prototype.willUnselect = function()
{
	this.isSelected = false;
}

Clocks.prototype.restoreDisplayFromPrefs = function()
{
	this.updateSortOrder();
}

Clocks.prototype.startDrag = function(controller)
{
	this.realHeight = this.displayOrder.length * this.clockHeight
	if(this.displayOrder.length == 1)
		return;
	
	for(x=0;x<this.displayOrder.length;x++){
		if(this.displayItems[this.displayOrder[x]].animator.active != false)
			this.displayItems[this.displayOrder[x]].animator.cancel();
		this.displayItems[this.displayOrder[x]].outercontainer.style.top = (this.clockHeight * x) + "px"
	}
	
	this.drag.controller = controller;
	this.drag.element = controller.outercontainer;

	this.drag.element.setAttribute("class", "worldclock-item-outer drag");
		
	this.drag.origin = parseInt(this.drag.element.style.top);
	this.drag.index = Math.floor(this.drag.origin / this.clockHeight);
	
	document.getElementById("clock-drag-shadow").style.display = "block"
	document.getElementById("clock-drag-shadow").style.top = (258 + (this.drag.origin - 6)) + "px"

	this.drag.active = true;
    document.addEventListener("mousemove", this.doDragHandler, true);
    document.addEventListener("mouseup", this.endDragHandler, true);
 
    this.drag.offset = parseInt(event.y) - 236;
 	event.stopPropagation();
	event.preventDefault();
}

Clocks.prototype.doDrag = function()
{
    var raw_position = parseInt(event.y) - 236;
	var newposition =  (raw_position - this.drag.offset) + this.drag.origin;
	if(newposition < 0)
		newposition = 0;
	
	if(newposition > (this.realHeight - this.clockHeight))
		newposition = (this.realHeight - this.clockHeight);
		
	var newIndex = this.drag.index;
	newIndex = Math.floor((newposition + (this.clockHeight / 2)) / this.clockHeight);
		
	if(newIndex != this.drag.index){
		var newcontent = Array();
		
		var draggedItem;
		for(x=0;x<this.displayOrder.length;x++){
			if(this.displayItems[this.displayOrder[x]].outercontainer == this.drag.element){
				draggedItem = this.displayItems[this.displayOrder[x]];
				break;
			}
		}

		for(x=0;x<this.displayOrder.length;x++){
			if(newIndex < this.drag.index){
				if(x == newIndex)
					newcontent[newcontent.length] = draggedItem.uid;
			}
			if(this.displayItems[this.displayOrder[x]].outercontainer != this.drag.element){
				newcontent[newcontent.length] = this.displayOrder[x];
			}
			if(newIndex > this.drag.index){
				if(x == newIndex)
					newcontent[newcontent.length] = draggedItem.uid;
			}
		}

		this.displayOrder = newcontent;
		for(x=0;x<this.displayOrder.length;x++){
			if(this.displayItems[this.displayOrder[x]].outercontainer != this.drag.element){
				var doSlide = false;
				if(parseInt(this.displayItems[this.displayOrder[x]].outercontainer.style.top) != (this.clockHeight * x)){
					doSlide = true;	
				}
				
				if(doSlide){
					if(p.useanimation){
						if(this.displayItems[this.displayOrder[x]].animator.active != false){
							if(this.displayItems[this.displayOrder[x]].miniclockAnimator.properties[0].end == (this.clockHeight * x)){
								continue;
							}
							this.displayItems[this.displayOrder[x]].animator.cancel();
						}

						var container = this.displayItems[this.displayOrder[x]].outercontainer
						
						this.displayItems[this.displayOrder[x]].miniclockAnimator.setOptions(0, 10);
						this.displayItems[this.displayOrder[x]].miniclockAnimator.purgePhases();
						this.displayItems[this.displayOrder[x]].miniclockAnimator.pushPhase(kAnimatorMoveVerticalTop, parseInt(container.style.top), this.clockHeight * x, 10, 0)
						
						this.displayItems[this.displayOrder[x]].animator.purge();
						this.displayItems[this.displayOrder[x]].animator.pushAnimator(this.displayItems[this.displayOrder[x]].miniclockAnimator);
						this.displayItems[this.displayOrder[x]].animator.prepare(200, 10);
						this.displayItems[this.displayOrder[x]].animator.run();

					} else {
						var container = this.displayItems[this.displayOrder[x]].outercontainer
						container.style.top = (this.clockHeight * x) +"px";
					}
				}
			}
		}
		this.drag.index = newIndex;	
	}
		
	this.drag.element.style.top = newposition + "px";
	document.getElementById("clock-drag-shadow").style.top = (258 + (newposition - 6)) + "px"
	
	event.stopPropagation();
	event.preventDefault();
}
	
Clocks.prototype.endDrag = function()
{
	widget.setPreferenceForKey(this.displayOrder.join(), "installed_clocks");
	p.resetClockSortOrder();
	p.sortClocks();
	
	if(p.useanimation){
		this.shadowAnimator.purgePhases();
		this.shadowAnimator.pushPhase(kAnimatorMoveVerticalTop, 258 + parseInt(this.drag.element.style.top) - 6, 258 + (this.drag.index * this.clockHeight) - 6, 10, 0)

		this.drag.controller.miniclockAnimator.purgePhases();
		this.drag.controller.miniclockAnimator.pushPhase(kAnimatorMoveVerticalTop, parseInt(this.drag.element.style.top), (this.drag.index * this.clockHeight), 10, 0)
		this.drag.controller.miniclockAnimator.setOptions(0, 10);
		
		this.drag.controller.animator.purge();
		this.drag.controller.animator.pushGroup(Array(this.drag.controller.miniclockAnimator, this.shadowAnimator));
		this.drag.controller.animator.prepare(200, 10);
		this.drag.controller.animator.run();
	} else {
		this.drag.element.style.top = (this.drag.index * this.clockHeight) + "px"
			this.drag.element.setAttribute("class", "worldclock-item-outer");
		document.getElementById("clock-drag-shadow").style.display = "none"
	}
	
	this.drag.active = false;
	document.removeEventListener("mousemove", this.doDragHandler, true);	
	document.removeEventListener("mouseup", this.endDragHandler, true);
}
	

Clocks.prototype.updateTicks = function()
{
	this.tickstatus = p.v("clock ticks");
	this.updateClocks(true);
}

Clocks.prototype.updateClocks = function(resetTicks)
{
	for(key in this.displayItems){
		var timeData = Organized.timeForZone(this.displayItems[key].timezone);
		if(resetTicks)
			this.displayItems[key].currentMode = -1
		this.displayItems[key].update(timeData);
	}
}