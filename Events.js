function Events(position, city) {
	var _self = this;
	
	this.realHeight = 0;
	this.indexContentHeight = 0;
	this.indexHeight = 0
	this.selectedEventHeight = 0;
	
	this.doDragHandler = function(){ _self.doResizeDrag(); };
	this.endDragHandler = function(){ _self.endResizeDrag(); };
	
	this.dayContainers = Array();
	this.displayOrder = Array();
	
	this.previouslySelectedCalendar = "ALL"
	this.selectedCalendar = "ALL"
	
	this.animators = Array();
	
	this.inAnimation = false;
	this.animateResize = false;
	
	this.slideAnimator = function(){ _self.doSlideAnimation(); };
	this.pageAnimator = function(){ _self.doPageAnimation(); };
	
	this.viewingevent = false;
	this.intransition = false;

	this.selectedevent = null;

	this.currentEventCount = 0;

	this.animator = new AnimationController();
	this.textcolors = Array("event-item-name-fade-0", "event-item-name-fade-1", "event-item-name-fade-2", "event-item-name-fade-3", "event-item-name-fade-4", "event-item-name-fade-5", "event-item-name-fade-6", "event-item-name-fade-7", "event-item-name-fade-8", "event-item-name-fade-9");
}

Events.prototype.inConfirmation = function()
{
	return false;
}

Events.prototype.respondToKey = function(key)
{
}

Events.prototype.prepareToShow = function()
{
}

Events.prototype.prepareToHide = function()
{
}

Events.prototype.tabElement = function()
{
	return document.getElementById("tab-events");	
}

Events.prototype.deselectTab = function()
{
	document.getElementById("tab-button-events").setAttribute("class", "tab tab-events tab-unselected");
}

Events.prototype.selectTab = function()
{
	document.getElementById("tab-button-events").setAttribute("class", "tab tab-events tab-selected");
}

Events.prototype.sectionHeight = function()
{	
	var baseMyguideHeight = 0;
	if(this.currentHeight != 0)
		if((this.contentHeight + 23) > this.currentHeight)
			baseMyguideHeight = this.currentHeight
		else
			baseMyguideHeight = this.contentHeight + 23;
	else
		baseMyguideHeight = this.contentHeight + 23;
	
	return baseMyguideHeight;
}


Events.prototype.resize = function()
{
	var newHeight = this.realHeight;
	
	if(!this.viewingevent)
		document.getElementById("tab-events").style.height = newHeight + "px";
	document.getElementById("event-index-container").style.height = newHeight + "px";
	document.getElementById("event-index-content").style.height = (this.indexContentHeight) + "px";
	document.getElementById("event-index-scroller-container").style.height = (newHeight - 23) + "px";
	document.getElementById("event-index-scroller").style.height = (newHeight - 46) + "px";
	document.getElementById("event-index-resizer").style.top = (newHeight - 15) + "px";
	this.indexScrollArea.refresh();

	if(this.isSelected == true){
		document.getElementById("tab-container").style.height = (newHeight) + "px"	
		document.getElementById("main-background").style.height = (newHeight - 26) + "px"
		document.getElementById("main-base").style.top = (newHeight + 258 - 26) + "px"
		if(!this.animator.active)
			resizeFront(newHeight + 258 + 24);
	}
}

Events.prototype.buildDisplay = function()
{
    this.indexScroller = new AppleVerticalScrollbar(document.getElementById("event-index-scroller"));
    this.indexScrollArea = new AppleScrollArea(document.getElementById("event-index-scroller-container"));
   	this.indexScrollArea.addScrollbar(this.indexScroller);
}

Events.prototype.fetchDataForSelectedDate = function()
{
	this.dayContainers.length = 0;

	var daysToFetch = parseInt(p.v("event days"));
	
	var baseDate = new Date()
	baseDate.setTime(calendarController.selectedDate.getTime());

	var endDate = new Date()
	endDate.setTime(baseDate.getTime());
	endDate.setDate(baseDate.getDate() + (daysToFetch - 1));
	endDate.setHours(23)
	endDate.setMinutes(59)
	endDate.setSeconds(59)

	var endDateFetch = new Date()
	endDateFetch.setTime(baseDate.getTime());
	endDateFetch.setDate(baseDate.getDate() + daysToFetch);
	
	var lastEventDate = new Date();
	lastEventDate.setFullYear(1970);
	
	var dayList = new Object();
	
	var events = Organized.getEventsBetweenDates(baseDate.getFullYear(), baseDate.getMonth() + 1, baseDate.getDate(), endDateFetch.getFullYear(), endDateFetch.getMonth() + 1, endDateFetch.getDate(), "ALL");
	var currentOffset = 0;
	var hasAllDayEvents = false;
	var today = new Date();
	today.setHours(0);
	today.setMinutes(0);
	today.setSeconds(0);
	
	
	for(x=0;x<events.length;x++){
		if(!events[x][7])
			continue;
			
		if(p.v("filter event calendars") == "1" && !p.isCalendarEnabled(events[x][7]))
			 continue;
			
		var startDate = new Date();
		startDate.setTime(events[x][2][1] * 1000);
		
		var eventEndDate = new Date();
		eventEndDate.setTime(events[x][2][2] * 1000);
		
		var daysForEvent = Math.floor((eventEndDate.getTime() - startDate.getTime()) / 86400000);
		if(daysForEvent == 0)
			daysForEvent = 1;
		
		for(y=0;y<daysForEvent;y++){
			var dayDate = new Date();
			dayDate.setTime(startDate.getTime());
						
			if(dayDate.getTime() < baseDate.getTime()-86400000){
				startDate.setDate(startDate.getDate() + 1);
				continue;
			}
			
			if(startDate.getTime() > endDate.getTime()){
				startDate.setDate(startDate.getDate() + 1);			
				continue;
			}
			startDate.setDate(startDate.getDate() + 1);
			
			dateString = startDate.getFullYear() + "" + startDate.getMonth() + "" + startDate.getDate();
			if(dayList[dateString]){
				dayList[dateString].events.push(events[x]);
			} else {
				dayList[dateString] = {events:Array(), headerdate:dayDate};
				dayList[dateString].events.push(events[x]);
			}
		}		
	}
	
	var dayArray = new Array();
	for(key in dayList)
		 dayArray.push(dayList[key]);
	
	var eventCount = 0;
	for(x=0;x<dayArray.length;x++){	
		var header = new EventHeader(dayArray[x].headerdate);
		var seperator = new EventSeperator();
		this.dayContainers.push({events:new Object(), order:new Array(), header:header, seperator:seperator});

		var events = dayArray[x].events;
		for(y=0;y<events.length;y++){
			var event = new Event(currentOffset, events[y]);
			event.updateTime();
		
			this.dayContainers[x].events[events[y][0]] = event;
			this.dayContainers[x].order[this.dayContainers[x].order.length] = event.uid;
			currentOffset += event.eventheight();
			eventCount++;
		}
	}
}

Events.prototype.timeChange = function()
{	
	for(y=0;y<this.dayContainers.length;y++){
		var order = this.dayContainers[y].order;
		for(x=0;x<order.length;x++){
			this.dayContainers[y].events[order[x]].updateTime();
		}
	}	
	
	if(this.selectedevent)
		this.updateEventDetails(this.selectedevent);	
}
	
Events.prototype.updateHeaders = function(additionalAnimators)
{		
	for(y=0;y<this.dayContainers.length;y++){
		this.dayContainers[y].header.updateDisplay();
	}	
}

Events.prototype.updateDisplay = function(additionalAnimators)
{	
	var fadeIn = Array();
	var slideOut = Array();
	var slideToPosition = Array();
		
	var currentOffset = 0;
				
	var hasAllDayEvents = false;
	var addedSeperator = false;
	var newAnimatorPosition = 0;
	var visibleDays = 0;
	var dayAnimatorsIn = Array()
	var dayAnimatorsOut = Array()
	var dayAnimatorsMove = Array()
	
	for(y=0;y<this.dayContainers.length;y++){
		var order = this.dayContainers[y].order;
		var hasEvents = false;
		for(x=0;x<order.length;x++){
			if(this.selectedCalendar == "ALL" || this.selectedCalendar == this.dayContainers[y].events[order[x]].calendar)
				hasEvents = true;
		}
		
		if(hasEvents){
			if(this.dayContainers[y].header.container.style.display == "block"){
				slideToPosition[slideToPosition.length] = this.dayContainers[y].header;
				this.dayContainers[y].header.offset = currentOffset;
			} else {
				fadeIn[fadeIn.length] = this.dayContainers[y].header;
				this.dayContainers[y].header.offset = currentOffset;
			}

			visibleDays++;
			currentOffset += 18;
			var hasAllDayEvents = false;
			var hasTimedEvents = false;
			var movedSeperator = false;
			for(x=0;x<order.length;x++){
				var found = false;
				if(this.selectedCalendar == "ALL" || this.selectedCalendar == this.dayContainers[y].events[order[x]].calendar)
					found = true;
	
				if(!found){
					if(this.dayContainers[y].events[order[x]].visible == true)
						slideOut[slideOut.length] = this.dayContainers[y].events[order[x]];
				} else {
					if(this.dayContainers[y].events[order[x]].mode != 0 && this.dayContainers[y].events[order[x]].mode != 3)
						hasTimedEvents = true;

					if(hasAllDayEvents && this.dayContainers[y].events[order[x]].mode != 0 && this.dayContainers[y].events[order[x]].mode != 3){
						newAnimatorPosition = currentOffset;
						if(this.dayContainers[y].seperator.container.style.display == "block"){
							slideToPosition[slideToPosition.length] = this.dayContainers[y].seperator;
							this.dayContainers[y].seperator.offset = currentOffset;
						} else {
							fadeIn[fadeIn.length] = this.dayContainers[y].seperator;
							this.dayContainers[y].seperator.offset = currentOffset;
						}
						currentOffset += 2;
						hasAllDayEvents = false;
						movedSeperator = true;
					}
					
					if(this.dayContainers[y].events[order[x]].mode == 0 || this.dayContainers[y].events[order[x]].mode == 3)
						hasAllDayEvents = true;
										
					if(this.dayContainers[y].events[order[x]].visible == true){
						slideToPosition[slideToPosition.length] = this.dayContainers[y].events[order[x]];
						this.dayContainers[y].events[order[x]].offset = currentOffset;
						currentOffset += this.dayContainers[y].events[order[x]].eventheight();
					} else {
						fadeIn[fadeIn.length] = this.dayContainers[y].events[order[x]];
						this.dayContainers[y].events[order[x]].offset = currentOffset;
						currentOffset += this.dayContainers[y].events[order[x]].eventheight();
					}
				}
			}
			if(hasAllDayEvents && hasTimedEvents && !movedSeperator){
				if(this.dayContainers[y].seperator.container.style.display == "block"){
					slideOut[slideOut.length] = this.dayContainers[y].seperator;
					this.dayContainers[y].seperator.offset = currentOffset;
				} else {
					fadeIn[fadeIn.length] = this.dayContainers[y].seperator;
					this.dayContainers[y].seperator.offset = currentOffset;
				}
			} else if(!movedSeperator){
				if(this.dayContainers[y].seperator.container.style.display == "block"){
					slideOut[slideOut.length] = this.dayContainers[y].seperator;
					this.dayContainers[y].seperator.offset = currentOffset;
				}
			}
		} else {
			if(this.dayContainers[y].header.container.style.display == "block"){
				dayAnimatorsOut[dayAnimatorsOut.length] = this.dayContainers[y].header;
			}
			var hasAllDayEvents = false;
			var movedSeperator = false;
			for(x=0;x<order.length;x++){
				if(hasAllDayEvents && this.dayContainers[y].seperator.container.style.display == "block"){
					dayAnimatorsOut[dayAnimatorsOut.length] = this.dayContainers[y].seperator;
					hasAllDayEvents = false;
					movedSeperator = true;
				}
				if(this.dayContainers[y].events[order[x]].mode == 0)
					hasAllDayEvents = true;
				if(this.dayContainers[y].events[order[x]].visible == true)
					slideOut[slideOut.length] = this.dayContainers[y].events[order[x]];
			}
			if(!movedSeperator){
				if(this.dayContainers[y].seperator.container.style.display == "block"){
					dayAnimatorsOut[dayAnimatorsOut.length] = this.dayContainers[y].seperator;
				}
			}
		}
	}

	if(this.animateResize && p.useanimation){
		this.animateResize = false;

		var currentOffset = 0;
		var visibleElements = fadeIn.length + slideToPosition.length;
		
		animators = new Array();

		for(x=0;x<fadeIn.length;x++){
			fadeIn[x].container.style.opacity = 0;
			fadeIn[x].container.style.top = fadeIn[x].offset + "px";
			fadeIn[x].container.style.display = "block"
			currentOffset += fadeIn[x].eventheight();

			fadeIn[x].positionAnimationObject.setOptions(0, 10);
			fadeIn[x].positionAnimationObject.purgePhases();
			fadeIn[x].positionAnimationObject.pushPhase(kAnimateOpacity, 0, 1, 10, 0, null)
			animators.push(fadeIn[x].positionAnimationObject)

			fadeIn[x].visible = true;
		}

		for(x=0;x<slideToPosition.length;x++){
			slideToPosition[x].positionAnimationObject.setOptions(0, 10);
			currentOffset += slideToPosition[x].eventheight();

			slideToPosition[x].positionAnimationObject.purgePhases();
			slideToPosition[x].positionAnimationObject.pushPhase(kAnimatorMoveVerticalTop, parseInt(slideToPosition[x].container.style.top), slideToPosition[x].offset, 10, 0, null)
			animators.push(slideToPosition[x].positionAnimationObject)

			slideToPosition[x].visible = true;
		}

		for(x=0;x<slideOut.length;x++){
			slideOut[x].positionAnimationObject.setOptions(kAnimateOptionsHide, 10);
			slideOut[x].positionAnimationObject.purgePhases();
			slideOut[x].positionAnimationObject.pushPhase(kAnimatorMoveVerticalTop, parseInt(slideOut[x].container.style.top), parseInt(slideOut[x].container.style.top) + currentOffset, 10, 0, null)
			animators.push(slideOut[x].positionAnimationObject)

			slideOut[x].visible = false;
		}

		for(x=0;x<dayAnimatorsOut.length;x++){
			dayAnimatorsOut[x].positionAnimationObject.setOptions(kAnimateOptionsHide, 10);
			dayAnimatorsOut[x].positionAnimationObject.purgePhases();
			dayAnimatorsOut[x].positionAnimationObject.pushPhase(kAnimatorMoveVerticalTop, parseInt(dayAnimatorsOut[x].container.style.top), parseInt(dayAnimatorsOut[x].container.style.top) + currentOffset, 10, 0, null)
			animators.push(dayAnimatorsOut[x].positionAnimationObject)
		}


		if(visibleElements == 0 && currentOffset < 40)
			currentOffset = 40;

		if(additionalAnimators && additionalAnimators != null){
			for(x=0;x<additionalAnimators.length;x++){
				additionalAnimators[x].setOptions(kAnimateOptionsRemoveFromParent, 15);
				additionalAnimators[x].setEndForPhase(additionalAnimators[x].properties[0].start + currentOffset, 0);
				animators.push(additionalAnimators[x])
			}
		}
		
	

		if(visibleElements == 0){
			if(p.v("event days") == "1")
				document.getElementById("events-noevents-date").innerText = getLocalizedString("No events in next day");
			else{
				var baseString = getLocalizedString("No events in next %@ days");
				baseString = baseString.replace("%@", p.v("event days"));
				document.getElementById("events-noevents-date").innerText = baseString;
			}
		} else {
			document.getElementById("events-noneforday").style.display = "none"
		}
		
		if(visibleElements < 3){
			document.getElementById("event-index-scroller").style.display = "none"
			document.getElementById("event-index-resizer").style.display = "none"	
		} else {
			document.getElementById("event-index-scroller").style.display = "block"
			document.getElementById("event-index-resizer").style.display = "block"
		}
		
		if(visibleElements == 0)
			currentOffset = 40;

		var oldContentHeight = this.indexContentHeight;

		var finalHeight = currentOffset + 23;
		if((finalHeight) > this.indexHeight){
			finalHeight = this.indexHeight;	
		}

		///// Animation Code
		var _self = this;

		this.animator.purge();
		this.animator.purgeCallbacks();
	
		if(visibleElements == 0 && this.currentEventCount > 0){
			document.getElementById("events-noneforday").style.display = "block"
			document.getElementById("events-noneforday").style.opacity = 0;
			var fakeAnimator = new AnimationObject(document.getElementById("events-noneforday"));
			fakeAnimator.setOptions(0, 25);
			fakeAnimator.pushPhase(kAnimateOpacity, 0, 1, 10, 10, null)
			this.animator.pushAnimator(fakeAnimator);	
		}
		
		this.currentEventCount  = visibleElements;
		
		var fakeAnimator = new AnimationObject(null);
		fakeAnimator.setOptions(0, 10);
		callback = this.animator.callbackWithOptions(kAnimatorCallBackValue, function(size){ _self.indexContentHeightChange(size); });
		fakeAnimator.pushPhase(0, oldContentHeight, currentOffset, 10, 0, callback)
		this.animator.pushAnimator(fakeAnimator);		

		var fakeAnimator = new AnimationObject(null);
		fakeAnimator.setOptions(0, 10);
		callback = this.animator.callbackWithOptions(kAnimatorCallBackValue, function(size){ _self.transitionHeightChange(size); });
		fakeAnimator.pushPhase(0, this.realHeight, finalHeight, 10, 0, callback)
		this.animator.pushAnimator(fakeAnimator);		

		if(window.outerHeight < (finalHeight + 258 + 24))
			window.resizeTo(246, finalHeight + 258 + 24);

		var _self = this;
		
		this.animator.pushCallback(function(){ _self.resize(); });
		this.animator.pushGroup(animators);
		
		if(visibleElements == 0)	
			this.animator.prepare(440, 20);
		else
			this.animator.prepare(330, 15);
	
		this.animator.run();
		///// End Of Animation Code
	} else {
		var currentOffset = 0;
		var visibleElements = fadeIn.length + slideToPosition.length;
		for(x=0;x<fadeIn.length;x++){
			fadeIn[x].container.style.top = fadeIn[x].offset + "px";
			currentOffset += fadeIn[x].eventheight();
			fadeIn[x].container.style.display = "block"
			fadeIn[x].visible = true;
		}
		for(x=0;x<slideToPosition.length;x++){
			slideToPosition[x].container.style.top = slideToPosition[x].offset + "px";
			currentOffset += slideToPosition[x].eventheight();
			slideToPosition[x].container.style.display = "block"
			slideToPosition[x].visible = true;
		}

		for(x=0;x<slideOut.length;x++){
			slideOut[x].container.style.display = "none"
			slideOut[x].visible = false;
		}

		for(x=0;x<dayAnimatorsOut.length;x++){
			dayAnimatorsOut[x].container.style.display = "none"
		}

		if(additionalAnimators && additionalAnimators != null){
			for(x=0;x<additionalAnimators.length;x++){
				document.getElementById("event-index-content").removeChild(additionalAnimators[x].element);
			}
		}
		
		if(visibleElements == 0 && currentOffset < 40)
			currentOffset = 40;

		if(hasAllDayEvents)
			currentOffset += 2	

		if(visibleElements == 0){
			document.getElementById("events-noneforday").style.display = "block"
			if(p.v("event days") == "1")
				document.getElementById("events-noevents-date").innerText = getLocalizedString("No events in next day");
			else {
				var baseString = getLocalizedString("No events in next %@ days");
				baseString = baseString.replace("%@", p.v("event days"));
				document.getElementById("events-noevents-date").innerText = baseString;
			}
		} else {
			document.getElementById("events-noneforday").style.display = "none"
		}
		
		if(visibleElements < 5){
			document.getElementById("event-index-scroller").style.display = "none"
			document.getElementById("event-index-resizer").style.display = "none"
		} else {
			document.getElementById("event-index-scroller").style.display = "block"
			document.getElementById("event-index-resizer").style.display = "block"
		}
			
		this.currentEventCount  = visibleElements;

		if(currentOffset + 23 < this.indexHeight)
			this.realHeight = currentOffset + 23;
		else
			this.realHeight = this.indexHeight;
		this.indexContentHeight = currentOffset;
		this.resize();
	}
	return;
}

Events.prototype.didSelect = function()
{
	this.isSelected = true;
	this.resize();
}

Events.prototype.willSelect = function()
{
}

Events.prototype.didUnselect = function()
{
}

Events.prototype.willUnselect = function()
{
	this.isSelected = false;
}

Events.prototype.restoreDisplayFromPrefs = function()
{
	this.indexHeight = 200;
	if(widget.preferenceForKey("eventsSectionHeight"))
		this.indexHeight = widget.preferenceForKey("eventsSectionHeight")
	
}

Events.prototype.beginResizeDrag = function()
{
	var _self = this;
	document.addEventListener("mousemove", this.doDragHandler, false);	document.addEventListener("mouseup", this.endDragHandler, false);
	this.resizeOrigin = this.indexHeight - (event.y - 215);
			event.stopPropagation();
	event.preventDefault();
}

Events.prototype.doResizeDrag = function()
{
	event.stopPropagation();
	event.preventDefault();

	y = event.y - this.resizeOrigin;

	this.indexHeight = this.resizeOrigin + (event.y - 215);
	if(this.indexHeight < 103)
		this.indexHeight = 103;

	if(this.indexHeight > this.indexContentHeight + 23)
		this.indexHeight = this.indexContentHeight + 23;

	this.realHeight = this.indexHeight
	this.resize();
}
	
Events.prototype.endResizeDrag = function()
{
	document.removeEventListener("mousemove", this.doDragHandler, false);	document.removeEventListener("mouseup", this.endDragHandler, false);
	widget.setPreferenceForKey(this.indexHeight, "eventsSectionHeight");
}

Events.prototype.switchCalendar = function(option, animate)
{
	if(this.animator.active)
		return;

	this.animateResize = animate;
	document.getElementById("events-calendar-title").innerHTML = option.text;
	this.selectedCalendar = option.value
	this.updateDisplay(null);
}

Events.prototype.eventsDidChange = function()
{
	while (document.getElementById("event-index-content").hasChildNodes())
		document.getElementById("event-index-content").removeChild(document.getElementById("event-index-content").firstChild);
	this.fetchDataForSelectedDate();
	this.updateDisplay(null);
}

Events.prototype.dateChange = function()
{
	this.viewingevent = false;
	document.getElementById("event-item-container").style.left = "196px";
	document.getElementById("event-index-container").style.left = "0px";
	document.getElementById("event-index-container").style.display = "block";
	
	var additionalAnimators = Array();

	for(y=0;y<this.dayContainers.length;y++){
		if(this.dayContainers[y].header.container.style.display == "block"){
			this.dayContainers[y].header.positionAnimationObject.setOptions(kAnimateOptionsRemoveFromParent, 15);
			this.dayContainers[y].header.positionAnimationObject.purgePhases();
			this.dayContainers[y].header.positionAnimationObject.pushPhase(kAnimatorMoveVerticalTop, parseInt(this.dayContainers[y].header.container.style.top), 0, 15, 0, null)
			additionalAnimators.push(this.dayContainers[y].header.positionAnimationObject)
		} else
			document.getElementById("event-index-content").removeChild(this.dayContainers[y].header.container);

		if(this.dayContainers[y].seperator.container.style.display == "block"){
			this.dayContainers[y].seperator.positionAnimationObject.setOptions(kAnimateOptionsRemoveFromParent, 15);
			this.dayContainers[y].seperator.positionAnimationObject.purgePhases();
			this.dayContainers[y].seperator.positionAnimationObject.pushPhase(kAnimatorMoveVerticalTop, parseInt(this.dayContainers[y].seperator.container.style.top), 0, 15, 0, null)
			additionalAnimators.push(this.dayContainers[y].seperator.positionAnimationObject)
			this.dayContainers[y].seperator.container.setAttribute ("class", "event-item-container event-item-animation");
		} else
			document.getElementById("event-index-content").removeChild(this.dayContainers[y].seperator.container);

		var order = this.dayContainers[y].order;
		var hasEvents = false;
		for(x=0;x<order.length;x++){
			if(this.dayContainers[y].events[order[x]].visible == true){
				this.dayContainers[y].events[order[x]].positionAnimationObject.setOptions(kAnimateOptionsRemoveFromParent, 15);
				this.dayContainers[y].events[order[x]].positionAnimationObject.purgePhases();
				this.dayContainers[y].events[order[x]].positionAnimationObject.pushPhase(kAnimatorMoveVerticalTop, parseInt(this.dayContainers[y].events[order[x]].container.style.top), 0, 15, 0, null)
				additionalAnimators.push(this.dayContainers[y].events[order[x]].positionAnimationObject)
				this.dayContainers[y].events[order[x]].container.setAttribute ("class", "event-item-container event-item-animation");
			} else {
				document.getElementById("event-index-content").removeChild(this.dayContainers[y].events[order[x]].container);
			}
		}
	}

	if(this.isSelected)
		this.animateResize = true;
	else
		this.animateResize = false;
	this.fetchDataForSelectedDate();
	this.updateDisplay(additionalAnimators);
}

Events.prototype.selectIndex = function()
{	
	if(this.selectedevent)
		this.selectedevent.isSelected = false;

	this.viewingevent = false;

	if(p.useanimation){	
		var slideOut = new AnimationObject(document.getElementById("event-item-container"));
		slideOut.setOptions(0, 13);
		slideOut.pushPhase(kAnimatorMoveHorizontalLeft, 0, 196, 13, 0, null)

		document.getElementById("event-index-container").style.display = "block";
		var slideIn = new AnimationObject(document.getElementById("event-index-container"));
		slideIn.setOptions(0, 13);
		slideIn.pushPhase(kAnimatorMoveHorizontalLeft, -196, 0, 13, 0, null)

		var fakeAnimator = new AnimationObject(null);
		fakeAnimator.setOptions(0, 10);
		var _self = this;
		callback = this.animator.callbackWithOptions(kAnimatorCallBackValue, function(size){ _self.transitionHeightChange(size); });
		if((this.indexContentHeight + 23) > this.indexHeight){
			fakeAnimator.pushPhase(0, this.realHeight, this.indexHeight, 10, 0, callback);
			if(window.outerHeight < (this.indexHeight + 258 + 24))
				window.resizeTo(246, this.indexHeight + 258 + 24);
		} else {
			fakeAnimator.pushPhase(0, this.realHeight, this.indexContentHeight + 23, 10, 0, callback);
			if(window.outerHeight < (this.indexContentHeight + 23 + 258 + 24))
				window.resizeTo(246, this.indexContentHeight + 23 + 258 + 24);
		}
		
		this.animator.purge();
		this.animator.purgeCallbacks();

		if(this.selectedevent){
			this.selectedevent.animationObject.purgePhases();
			this.selectedevent.animationObject.pushPhase(kAnimateOpacity, 1, 0, 10, 23, null)
			this.animator.pushAnimator(this.selectedevent.animationObject);		

			var animator = new AnimationObject(this.selectedevent.title);
			animator.setOptions(0, 32);
			callback = this.animator.callbackWithOptions(kAnimatorCallBackStep, function(cell, step){ _self.fadeCellText(cell, step); });
	
			animator.pushPhase(0, 0, 0, 9, 23, callback)
			this.animator.pushAnimator(animator);

			var animator = new AnimationObject(this.selectedevent.timefield);
			animator.setOptions(0, 32);
			callback = this.animator.callbackWithOptions(kAnimatorCallBackStep, function(cell, step){ _self.fadeCellTextTime(cell, step); });
	
			animator.pushPhase(0, 0, 0, 9, 23, callback)
			this.animator.pushAnimator(animator);
		}


		var _self = this;
		this.animator.pushGroup(Array(slideOut, slideIn, fakeAnimator));		
		this.animator.prepare(660, 33);
	
		this.intransition = true;
		this.animator.run();
	} else {
		if((this.indexContentHeight + 23) > this.indexHeight){
			this.realHeight = this.indexHeight;
		} else {
			this.realHeight = this.indexContentHeight + 23;
		}
		document.getElementById("event-index-container").style.left = 0 + "px";
		document.getElementById("event-item-container").style.left = 196 + "px";
		
		this.selectedevent.unhighlightEvent();
		this.selectedevent = null;
		
		this.resize();
	}
}

Events.prototype.transitionHeightChange = function(size)
{
	this.realHeight = size;
	this.resize();
}

Events.prototype.indexContentHeightChange = function(size)
{
	this.indexContentHeight = size;
}


Events.prototype.selectedEvent = function()
{
	this.realHeight = this.selectedEventHeight;
	this.resize()
}

Events.prototype.selectedIndex = function()
{
	this.realHeight = this.indexHeight;
	this.resize()
}
	
Events.prototype.fadeCellText = function(cell, step)
{
	cell.setAttribute("class", "event-item-title ellipsis " + this.textcolors[9 - step]);
}

Events.prototype.fadeCellTextTime = function(cell, step)
{
	cell.setAttribute("class", "event-item-time " + this.textcolors[9 - step]);
}

Events.prototype.eventDown = function(event)
{
	for(y=0;y<this.dayContainers.length;y++){
		var order = this.dayContainers[y].order;
		for(x=0;x<order.length;x++){
			if(this.dayContainers[y].events[order[x]].container == event){
				this.dayContainers[y].events[order[x]].highlightFromDown();
				break;	
			}
		}
	}
}

Events.prototype.eventUp = function(event)
{
	for(y=0;y<this.dayContainers.length;y++){
		var order = this.dayContainers[y].order;
		for(x=0;x<order.length;x++){
			if(this.dayContainers[y].events[order[x]].container == event){
				this.dayContainers[y].events[order[x]].unhighlightEvent(false);
				break;	
			}
		}
	}
}

Events.prototype.openIcalAndSelectEvent = function()
{
	var result = Organized.openEvent(this.selectedevent.uid, this.selectedevent.calendar);
	if(result == 0)
		widget.openURL("");
}

Events.prototype.selectEvent = function(event)
{
	event.highlightEvent();
	
	
	document.getElementById("event-item-container").style.left = "196px";
	document.getElementById("event-item-container").style.display = "block";
	
	var height = this.updateEventDetails(event);
	
	document.getElementById("event-item-content").style.height = (height + 29) + "px"
	document.getElementById("event-item-container").style.height = (height + 29) + "px"

	if(p.useanimation){	
		var slideOut = new AnimationObject(document.getElementById("event-index-container"));
		slideOut.setOptions(0, 13);
		slideOut.pushPhase(kAnimatorMoveHorizontalLeft, 0, -196, 13, 0, null)

		document.getElementById("event-item-container").style.display = "block";
		var slideIn = new AnimationObject(document.getElementById("event-item-container"));
		slideIn.setOptions(0, 13);
		slideIn.pushPhase(kAnimatorMoveHorizontalLeft, 196, 0, 13, 0, null)

		if(parseInt(document.getElementById("tab-events").style.height) < (height + 29))
			document.getElementById("tab-events").style.height = (height + 29) + "px";

		var fakeAnimator = new AnimationObject(null);
		fakeAnimator.setOptions(0, 10);
		var _self = this;
		callback = this.animator.callbackWithOptions(kAnimatorCallBackValue, function(size){ _self.transitionHeightChange(size); });
		fakeAnimator.pushPhase(0, this.realHeight, this.selectedEventHeight, 10, 0, callback)

		this.animator.purge();
		this.animator.purgeCallbacks();

		if(window.outerHeight < (this.selectedEventHeight + 258 + 24))
			window.resizeTo(246, this.selectedEventHeight + 258 + 24);

		var _self = this;
		
		this.animator.pushCallback(function(){ _self.selectedEvent(); });
		this.animator.pushGroup(Array(slideOut, slideIn, fakeAnimator));		
		this.animator.prepare(660, 33);
	
		this.intransition = true;
		this.animator.run();
	} else {
		this.realHeight = this.selectedEventHeight;
		document.getElementById("tab-events").style.height = (height + 29) + "px";
		document.getElementById("event-index-container").style.left = -196 + "px";
		document.getElementById("event-item-container").style.left = 0 + "px";
		this.resize();
	}
}

Events.prototype.updateEventDetails = function(event)
{
	var offset = 6;

	document.getElementById("event-item-title").innerHTML = event.name;
		
	var truncatedHeight = parseInt(document.defaultView.getComputedStyle(document.getElementById("event-item-title-hidden"),"").getPropertyValue("height"));

	document.getElementById("event-item-title-hidden").innerHTML = "_";
	var baseheight = parseInt(document.defaultView.getComputedStyle(document.getElementById("event-item-title-hidden"),"").getPropertyValue("height"));
	document.getElementById("event-item-title-hidden").innerHTML = event.name;
	var realheight = parseInt(document.defaultView.getComputedStyle(document.getElementById("event-item-title-hidden"),"").getPropertyValue("height"));
	
	var needsExtendedTitle = false;
	if(baseheight != realheight)
		needsExtendedTitle = true;

	if(event.eventlocation.length > 0){
		document.getElementById("event-item-location").innerHTML = event.eventlocation;
		document.getElementById("event-item-location-container").style.display = "block";
		var sectionheight = parseInt(document.defaultView.getComputedStyle(document.getElementById("event-item-location"),"").getPropertyValue("height"));
		if(sectionheight < 13)
			offset += 16;
		else
			offset += sectionheight + 3;
		offset += 15;
	} else {
		document.getElementById("event-item-location-container").style.display = "none";
	}

	if(event.mode == 0){
		document.getElementById("event-item-allday-container").style.top = offset + "px";
		document.getElementById("event-item-allday-container").style.display = "block";
		offset += 16;
		offset += 15;
		document.getElementById("event-item-tofrom-container").style.display = "none";
		document.getElementById("event-detail-allday").innerHTML = Organized.formattedDate(event.startDate.getTime()/1000, "%B %e");
		document.getElementById("event-detail-allday-suffix").style.display = "none";
	} else if(event.mode == 3){
		document.getElementById("event-item-allday-container").style.display = "block";
		document.getElementById("event-item-allday-container").style.top = offset + "px";
		document.getElementById("event-item-allday-container").style.display = "block";
		offset += 16;
		offset += 15;
		document.getElementById("event-item-tofrom-container").style.display = "none";
		document.getElementById("event-detail-allday").innerHTML = Organized.formattedDate(event.startDate.getTime()/1000, "%B %e") + " to " + Organized.formattedDate(event.endDate.getTime()/1000, "%B %e");
		document.getElementById("event-detail-allday-suffix").style.display = "none";
	} else if(event.mode == 1){
		document.getElementById("event-item-allday-container").style.display = "block";
		document.getElementById("event-item-allday-container").style.top = offset + "px";
		document.getElementById("event-item-tofrom-container").style.display = "none";
		if(p.v("use 24hr time") == "1")
			document.getElementById("event-detail-allday").innerHTML = Organized.formattedDate(event.startDate.getTime()/1000, "%b %e") + ", " + Organized.formattedDate(event.startDate.getTime()/1000, "%H:%M") + " to " + Organized.formattedDate(event.endDate.getTime()/1000, "%H:%M")
		else
			document.getElementById("event-detail-allday").innerHTML = Organized.formattedDate(event.startDate.getTime()/1000, "%b %e") + ", " + Organized.formattedDate(event.startDate.getTime()/1000, "%1I:%M") + Organized.formattedDate(event.startDate.getTime()/1000, "%p").toLowerCase() + " to " + Organized.formattedDate(event.endDate.getTime()/1000, "%1I:%M") + Organized.formattedDate(event.endDate.getTime()/1000, "%p").toLowerCase();
		document.getElementById("event-detail-allday-suffix").style.display = "none";
		offset += 16;
		offset += 15;
	} else if(event.mode == 2){
		document.getElementById("event-item-tofrom-container").style.top = offset + "px";
		document.getElementById("event-item-tofrom-container").style.display = "block";
		document.getElementById("event-item-allday-container").style.display = "none";
		if(p.v("use 24hr time") == "1"){
			document.getElementById("event-item-from").innerHTML = Organized.formattedDate(event.startDate.getTime()/1000, "%b %e") + ", " + Organized.formattedDate(event.startDate.getTime()/1000, "%H:%M");
			document.getElementById("event-item-to").innerHTML = Organized.formattedDate(event.endDate.getTime()/1000, "%b %e") + " " + Organized.formattedDate(event.endDate.getTime()/1000, "%H:%M");
		} else {
			document.getElementById("event-item-from").innerHTML = Organized.formattedDate(event.startDate.getTime()/1000, "%b %e") + ", " + Organized.formattedDate(event.startDate.getTime()/1000, "%1I:%M") + Organized.formattedDate(event.startDate.getTime()/1000, "%p").toLowerCase();
			document.getElementById("event-item-to").innerHTML = Organized.formattedDate(event.endDate.getTime()/1000, "%b %e") + " " + Organized.formattedDate(event.endDate.getTime()/1000, "%1I:%M") + Organized.formattedDate(event.endDate.getTime()/1000, "%p").toLowerCase();
		}
		document.getElementById("event-detail-allday-suffix").style.display = "none";
		offset += 16;
		offset += 45;
	}

	if(event.people.length > 0){
		while (document.getElementById("event-item-people").hasChildNodes())
			document.getElementById("event-item-people").removeChild(document.getElementById("event-item-people").firstChild);

		for(x=0;x<event.people.length;x++){
			var container;
			if(event.people[x][1].length > 0){
				container = document.createElement('a');
				container.setAttribute("class", "link");
				var url = event.people[x][1];
				container.onclick = function(){widget.openURL(url)};
			} else
				container = document.createElement('sppn');
			container.innerText = event.people[x][0];
			if(x < event.people.length - 1)
				container.innerText += ", ";
			document.getElementById("event-item-people").appendChild(container);
		}

		document.getElementById("event-item-people-container").style.top = offset + "px";
		document.getElementById("event-item-people-container").style.display = "block";
		var sectionheight = parseInt(document.defaultView.getComputedStyle(document.getElementById("event-item-people"),"").getPropertyValue("height"));
		if(sectionheight < 13)
			offset += 13;
		else
			offset += sectionheight;
		offset += 15;
	} else {
		document.getElementById("event-item-people-container").style.display = "none";
	}

	if(event.eventurl.length > 0){
		document.getElementById("event-item-url-container").style.display = "block";
		document.getElementById("event-item-url-container").style.top = offset + "px";
		document.getElementById("event-item-url").innerHTML = event.eventurl.replace("http://", "");
		document.getElementById("event-item-url").setAttribute("onclick","widget.openURL('" + event.eventurl + "')");
		var sectionheight = parseInt(document.defaultView.getComputedStyle(document.getElementById("event-item-url"),"").getPropertyValue("height"));
		if(sectionheight < 13)
			offset += 13;
		else
			offset += sectionheight;
		offset += 15;
	} else {
		document.getElementById("event-item-url-container").style.display = "none";
	}

	if(event.notes.length > 0){
		document.getElementById("event-item-notes-container").style.display = "block";
		document.getElementById("event-item-notes-container").style.top = offset + "px";
		document.getElementById("event-item-notes").innerHTML = this.parseNotes(event.notes);
		var sectionheight = parseInt(document.defaultView.getComputedStyle(document.getElementById("event-item-notes"),"").getPropertyValue("height"));
		if(sectionheight < 13)
			offset += 13;
		else
			offset += sectionheight;
		offset += 15;
		
		try {
			var nodes = document.getElementsByTagName("a");
			for(x=0;x<nodes.length;x++){
				nodes[x].setAttribute("class", "link");
				var link = nodes[x].href;
				nodes[x].setAttribute("onclick","widget.openURL('" + link + "');return false")
				nodes[x].href = "";
			}
		} catch(err){
		}
		document.getElementById("event-item-notes").innerHTML = document.getElementById("event-item-notes").innerHTML.replace("href=\"\"", "");
	} else {
		document.getElementById("event-item-notes-container").style.display = "none";
	}
	
	offset += 6; // bottom spacing
	
	this.viewingevent = true;
	this.selectedEventHeight = offset + 23;
	this.selectedevent = event;
	return offset;
}

Events.prototype.parseNotes = function(notes)
{
	notes = notes.replace(/\n/gi, "<br/>");
	notes = notes.replace(/\r/gi, "<br/>");
	return notes;
}