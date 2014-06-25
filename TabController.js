function TabController() {
	this.selectedTab = 0;
	var _self = this;
	this.animator = new AnimationController();
	this.animator.mode = kSubAnimatorModeFollow;
	
	this.tabSwitchCallback = function(){ _self.tabSwitchComplete(); };
	this.timerAction = function() { _self.doFade() };
	
	this.animator.pushCallback(this.tabSwitchCallback);
}

TabController.prototype.controllerForTab = function(tab)
{
	switch(tab){
		case 0:
			return clockController	
		break;	
		case 1:
			return noteController	
		break;	
		case 2:
			return eventsController	
		break;	
		case 3:
			return todoController	
		break;	
	}
	return null
}

TabController.prototype.selectTab = function(tab)
{
	if(this.inTransiation)
		return;

	if(this.selectedTab == tab)
		return;
			
	inController = this.controllerForTab(tab);
	outController = this.controllerForTab(this.selectedTab);
			
	if(inController == null || outController == null)
		return;
		
	outController.willUnselect();	
	inController.willSelect();
	
	outController.deselectTab();
	inController.selectTab();

	this.selectedTab = tab;
	widget.setPreferenceForKey(tab, "tab");

	outElement = outController.tabElement();
	inElement = inController.tabElement();

	if(p.useanimation){	
		this.inTransiation = true;
		heightChange = inController.realHeight - outController.realHeight;
		
		if(window.outerHeight < (inController.realHeight + 258 + 24))
			window.resizeTo(246, (inController.realHeight + 258 + 24))
		
	//	outController.prepareToHide();
		inElement.setAttribute("class", "section-in");
		outElement.setAttribute("class", "section-out");	
		inElement.style.opacity = 0;
		inElement.style.visibility = "visible";
//		inElement.style.display = "block";
	//	inController.prepareToShow();
		
		this.animator.purge();
	
		var tabItem = new AnimationObject(document.getElementById("tab-container"));
		var bgItem = new AnimationObject(document.getElementById("main-background"));
		var baseItem = new AnimationObject(document.getElementById("main-base"));
		var inFade = new AnimationObject(inElement);
		var outFade = new AnimationObject(outElement);
		
		var firstTick = 0;
		if(heightChange > 0)
			firstTick = 10;

		tabItem.setOptions(0, 10 + firstTick);
		tabItem.pushPhase(kAnimatorResizeHeight, outController.realHeight, inController.realHeight, 10, firstTick)

		bgItem.setOptions(0, 10 + firstTick);
		bgItem.pushPhase(kAnimatorResizeHeight, outController.realHeight - 26, inController.realHeight - 26, 10, firstTick)

		baseItem.setOptions(0, 10 + firstTick);
		baseItem.pushPhase(kAnimatorMoveVerticalTop, (outController.realHeight + 258 - 26), (inController.realHeight + 258 - 26), 10, firstTick)

		inFade.setOptions(0, 20);
		inFade.pushPhase(kAnimateOpacity, 0, 1, 20, 0)
		outFade.setOptions(kAnimateOptionsInvisible, 20);
		outFade.pushPhase(kAnimateOpacity, 1, 0, 20, 0)
		
		this.animator.pushGroup(Array(tabItem, bgItem, baseItem, inFade, outFade));
		this.animator.prepare(300, 20);
		this.animator.run();
	} else {
		inElement.style.opacity = 0;
		//inElement.style.display = "block";
		inElement.style.visibility = "visible";
	//	inController.prepareToShow();
		
	//	outController.prepareToHide();
		outElement.style.visibility = "hidden";
		document.getElementById("tab-container").style.height = (inController.realHeight) +  "px"
		document.getElementById("main-background").style.height = (inController.realHeight - 26) + "px"
		document.getElementById("main-base").style.top = (inController.realHeight + 258 - 26) + "px"
		this.controllerForTab(this.selectedTab).didSelect();
		inElement.style.opacity = 1
		window.resizeTo(246, (inController.realHeight + 258 + 24))
	}		
}

TabController.prototype.tabSwitchComplete = function()
{
	this.inTransiation = false;
	this.controllerForTab(this.selectedTab).didSelect();
}
