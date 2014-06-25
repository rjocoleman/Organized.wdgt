function Calendar() {
	var _self = this;
	
	this.cells = Array();
	this.rows = Array();

	var date = new Date();
	date.setHours(0)
	date.setMinutes(0)
	date.setSeconds(0)
	Organized.setCurrentEventDate(date.getTime());
	this.selectedDate = date;
	
	this.viewingCurrentMonth = true;
	this.viewingCurrentDay = true;

	var monthDate = new Date();
	monthDate.setDate(1);
	this.calendarMonth = monthDate
	
	this.previousMonthRow = 0;
	this.nextMonthRow = 0;
	
	this.selectedcell = null;
	
	this.textcolors = Array("calendar-day-text-slide-0", "calendar-day-text-slide-1", "calendar-day-text-slide-2", "calendar-day-text-slide-3", "calendar-day-text-slide-4", "calendar-day-text-slide-5", "calendar-day-text-slide-6", "calendar-day-text-slide-7", "calendar-day-text-slide-8", "calendar-day-text-slide-9");

	this.intransition = false;
	
	this.animator = new AnimationController();

	this.daytimer = null;
	this.daytimerAction = function(){ _self.updateDay(); }
	this.resetDaytimer();
}

Calendar.prototype.resetDaytimer = function()
{
	if(this.daytimer){
		clearTimeout(this.daytimer);
		this.daytimer = null;
	}
	
	var today = new Date()
	var tomorrow = new Date()
	tomorrow.setDate(today.getDate() + 1);
	tomorrow.setHours(0);
	tomorrow.setMinutes(0);
	tomorrow.setSeconds(1);
	
	this.daytimer = setTimeout(this.daytimerAction, tomorrow.getTime() - today.getTime());
}

Calendar.prototype.updateDay = function()
{
	document.getElementById("main-date").innerHTML = Organized.getCurrentDateDisplay();

	if(this.viewingCurrentDay){
		var date = new Date();
		this.selectedDate = date
		Organized.setCurrentEventDate(date.getTime());
		eventsController.dateChange();
	}
	
	if(this.viewingCurrentMonth){
		var monthDate = new Date();
		monthDate.setDate(1);
		this.calendarMonth = monthDate
		this.viewingMonth = this.selectedDate.getMonth();		
		this.update();
	}
		
	this.resetDaytimer();
	noteController.dateChange();
	eventsController.updateHeaders();
}

Calendar.prototype.buildCalendar = function()
{
	for(x=0;x<16;x++){
		var row = document.createElement('div');
		row.setAttribute ("class", "calendar-row");
		row.style.top = (-125 + (x * 25)) + "px"
		document.getElementById("calendar-contents").appendChild(row);
		this.rows[x] = row;
	
		for(y=0;y<7;y++){
			var dayContainer = document.createElement('div');
			dayContainer.setAttribute ("class", "calendar-day-cell");
			row.appendChild(dayContainer);
			dayContainer.setAttribute("onclick", "calendarController.selectDate(" + ((x * 7) + y) + ", this)");
			dayContainer.setAttribute("ondblclick", "calendarController.openiCal(" + ((x * 7) + y) + ", this)");
	
			var day = document.createElement('div');
			day.setAttribute ("class", "calendar-day-text");
			dayContainer.appendChild(day);

			var dot = document.createElement('div');
			dot.setAttribute ("class", "calendar-day-dot");
			dayContainer.appendChild(dot);
			
			this.cells[this.cells.length] = {day:day, container:dayContainer, dot:dot};
		}	
	}
}

Calendar.prototype.update = function()
{
	var isThisMonth = false;
	var today = new Date();
	var foundNextMonth = false;
	var foundPreviousMonth = false;
	
	if(this.calendarMonth.getMonth() == today.getMonth() && this.calendarMonth.getFullYear() == today.getFullYear())
		isThisMonth = true;
	
	var currentMonthData = Organized.calendarDatesForMonth(this.calendarMonth.getMonth() + 1, this.calendarMonth.getFullYear());

	var baseDate = new Date();
	var dateparts = currentMonthData[0][1].split("/");
	baseDate.setDate(1);
	baseDate.setMonth(dateparts[1] - 1);
	baseDate.setFullYear(dateparts[2]);
	baseDate.setDate(dateparts[0]);
	baseDate.setHours(0)
	baseDate.setMinutes(0)
	baseDate.setSeconds(0)

	var endDate = new Date();
	var dateparts = currentMonthData[currentMonthData.length - 1][1].split("/");
	endDate.setDate(1);
	endDate.setMonth(dateparts[1] - 1);
	endDate.setFullYear(dateparts[2]);
	endDate.setDate(dateparts[0]);
	endDate.setHours(0)
	endDate.setMinutes(0)
	endDate.setSeconds(0)

	var events = Organized.getEventsBetweenDates(baseDate.getFullYear(), baseDate.getMonth() + 1, baseDate.getDate(), endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate(), "ALL");

	var dayList = new Object();
	for(x=0;x<events.length;x++){
		if(p.v("filter event calendars") == "1" && !p.isCalendarEnabled(events[x][7]))
			continue;
			
		var startDate = new Date();
		startDate.setTime(events[x][2][1] * 1000);
		
		var endDate = new Date();
		endDate.setTime(events[x][2][2] * 1000);
		
		var daysForEvent = Math.floor((endDate.getTime() - startDate.getTime()) / 86400000);
		if(daysForEvent == 0)
			daysForEvent = 1;
		
		for(y=0;y<daysForEvent;y++){
			var dayDate = new Date();
			dayDate.setTime(startDate.getTime());
			
			startDate.setDate(startDate.getDate() + 1);
			
			if(dayDate.getTime() < baseDate.getTime()-86400000)
				continue;
			
			dateString = dayDate.getDate() + "/" + (dayDate.getMonth() + 1) + "/" + dayDate.getFullYear();
			if(dayList[dateString]){
				dayList[dateString].events.push(events[x]);
			} else {
				dayList[dateString] = {events:Array(), headerdate:dayDate};
				dayList[dateString].events.push(events[x]);
			}
		}		
	}

	for(x=0;x<112;x++){
		if(currentMonthData.length > x){
			this.cells[x].day.innerHTML = currentMonthData[x][0];
			this.cells[x].container.date = currentMonthData[x][1];
			this.cells[x].container.displaymode = currentMonthData[x][2];
			if(currentMonthData[x][2] == 0 || currentMonthData[x][2] == 1 || currentMonthData[x][2] == 3 || currentMonthData[x][2] == 4){
				this.cells[x].day.setAttribute("class", "calendar-day-text calendar-day-text-surrounding");
				this.cells[x].container.surrounding = true;
			} else {
				this.cells[x].day.setAttribute("class", "calendar-day-text");
				this.cells[x].container.surrounding = false;
			}

			if(this.cells[x].container.displaymode == 1 && foundPreviousMonth == false){
				this.previousMonthRow = Math.floor(x / 7);
				foundPreviousMonth = true;
			}

			if(this.cells[x].container.displaymode == 3 && foundNextMonth == false){
				this.nextMonthRow = Math.floor(x / 7);
				foundNextMonth = true;
			}
			
				
			var theDate = new Date();
			var dateparts = currentMonthData[x][1].split("/");
			theDate.setDate(1);
			theDate.setMonth(dateparts[1] - 1);
			theDate.setFullYear(dateparts[2]);
			theDate.setDate(dateparts[0]);
			theDate.setHours(0)
			theDate.setMinutes(0)
			theDate.setSeconds(0)
		
			var isSelected = false;
			if(theDate.getDate() == this.selectedDate.getDate() && theDate.getMonth() == this.selectedDate.getMonth() && theDate.getFullYear() == this.selectedDate.getFullYear()){
				this.selectedcell = this.cells[x];
				isSelected = true;
			}

			if(isSelected)
				this.cells[x].day.setAttribute("class", "calendar-day-text calendar-day-text-surrounding-selected");
			
			if(dayList[currentMonthData[x][1]]){
				if(currentMonthData[x][0] == today.getDate() && currentMonthData[x][2] != 0 && theDate.getMonth() == today.getMonth())
					this.cells[x].dot.setAttribute("class", "calendar-day-dot calendar-day-dot-hasevent-selected");
				else {
					if(currentMonthData[x][2] == 0 || currentMonthData[x][2] == 1 || currentMonthData[x][2] == 3 || currentMonthData[x][2] == 4){
						this.cells[x].dot.setAttribute("class", "calendar-day-dot calendar-day-dot-hasevent-surrounding");
					} else {
						this.cells[x].dot.setAttribute("class", "calendar-day-dot calendar-day-dot-hasevent");
					}
				}
			} else {
				this.cells[x].dot.setAttribute("class", "calendar-day-dot");
			}
				
			if(currentMonthData[x][0] == today.getDate() && currentMonthData[x][2] != 0 && theDate.getMonth() == today.getMonth()){
				this.cells[x].container.today = true;
				if(isSelected)
					this.cells[x].container.setAttribute("class", "calendar-day-cell calendar-day-cell-today-selected");
				else
					this.cells[x].container.setAttribute("class", "calendar-day-cell calendar-day-cell-today");
			} else {
				this.cells[x].container.today = false;
				if(currentMonthData[x][2] == 0)
					this.cells[x].container.setAttribute("class", "calendar-day-cell");
				else if(isSelected)
					this.cells[x].container.setAttribute("class", "calendar-day-cell calendar-day-cell-selected");
				else
					this.cells[x].container.setAttribute("class", "calendar-day-cell");
			}
		}
	}
	document.getElementById("calendarmonth").innerHTML = Organized.displayForMonth(this.calendarMonth.getMonth() + 1, this.calendarMonth.getFullYear());
}

Calendar.prototype.finishSlide = function()
{
	this.update();
	for(x=0;x<this.rows.length;x++){
		this.rows[x].style.top = (-125 + (x * 25)) + "px"
	}
	this.intransition = false;
}

Calendar.prototype.reloadEvents = function()
{
	eventsController.dateChange();
}

Calendar.prototype.selectDate = function(index, element)
{
	if(this.intransition)
		return;
	var date = new Date();
	var today = new Date();
	var dateparts = element.date.split("/");
	date.setDate(1);
	date.setMonth(dateparts[1] - 1);
	date.setFullYear(dateparts[2]);
	date.setDate(dateparts[0]);
	date.setHours(0)
	date.setMinutes(0)
	date.setSeconds(0)

	if(date.getDate() == this.selectedDate.getDate() && date.getMonth() == this.selectedDate.getMonth() && date.getFullYear() == this.selectedDate.getFullYear()){
		if(tabController.selectedTab != 2)
			tabController.selectTab(2)
		return;
	}

	Organized.setCurrentEventDate(date.getTime());
	this.selectedDate = date;
	
	if(this.cells[index].container.displaymode != 2){
		if(this.cells[index].container.displaymode == 1){
			this.calendarBack(element, true, true);
		} else {
			this.calendarForward(element, true, true);
		}
		return;
	}
	eventsController.dateChange();
	this.update();
	if(tabController.selectedTab != 2)
		tabController.selectTab(2)
}

Calendar.prototype.openiCal = function()
{
	if(this.intransition)
		return;	
	
	var today = new Date();
	var result = Organized.openDate(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, this.selectedDate.getDate());
	if(result == 0)
		widget.openURL("");
}

Calendar.prototype.cellToFocus = function(cell, step)
{
	cell.setAttribute("class",  "calendar-day-text " + this.textcolors[9 - (step)]);	
}	

Calendar.prototype.cellFromFocus = function(cell, step)
{
	cell.setAttribute("class",  "calendar-day-text " + this.textcolors[(step)]);	
}

Calendar.prototype.selectEvents = function()
{
	if(tabController.selectedTab != 2)
		tabController.selectTab(2)
}
	
Calendar.prototype.calendarBack = function(element, events, selectevents)
{
	if(this.animator.active)
		return;
		
	var _self = this;

	this.calendarMonth.setMonth(this.calendarMonth.getMonth() - 1);
	
	var today = new Date()
	if(today.getYear() == this.calendarMonth.getYear() && today.getMonth() == this.calendarMonth.getMonth()){
		this.viewingCurrentMonth = true;
		widget.setPreferenceForKey(1, "calendarViewingCurrentMonth");
	} else {
		this.viewingCurrentMonth = false;
		widget.setPreferenceForKey(0, "calendarViewingCurrentMonth");
	}

	if(!p.useanimation){
		this.update();
		return;
	}
	
	var animators = Array();
	
	for(x=this.previousMonthRow;x<6;x++){
		var animator = new AnimationObject(this.rows[x]);
		animator.setOptions(0, 10);
		animator.pushPhase(kAnimatorMoveVerticalTop, parseInt(this.rows[x].style.top), parseInt(this.rows[x].style.top) + ((5 - this.previousMonthRow) * 25), 10, 0, null)
		animators.push(animator)
	}

	for(x=6;x<11;x++){
		var animator = new AnimationObject(this.rows[x]);
		animator.setOptions(0, 10);
		animator.pushPhase(kAnimatorMoveVerticalTop, parseInt(this.rows[x].style.top), parseInt(this.rows[x].style.top) + ((5 - this.previousMonthRow) * 25), 10, 0, null)
		animators.push(animator)
	}

	var newmonthcells = Array();
	var oldmonthcells = Array();
	for(x=0;x<112;x++){
		var animator = new AnimationObject(this.cells[x].day);
		animator.setOptions(0, 9);
		
		var callback = null;
		if(this.cells[x].container.displaymode == 1){
			callback = this.animator.callbackWithOptions(kAnimatorCallBackStep, function(cell, step){ _self.cellToFocus(cell, step); });
		}
		if(this.cells[x].container.displaymode == 2){
			callback = this.animator.callbackWithOptions(kAnimatorCallBackStep, function(cell, step){ _self.cellFromFocus(cell, step); });
		}

		animator.pushPhase(0, 0, 0, 9, 0, callback)
		animators.push(animator)
	}
	
	
	if(element != null){
		if(this.selectedcell != null){
			if(this.selectedcell.container.today)
				this.selectedcell.container.setAttribute("class", "calendar-day-cell calendar-day-cell-today");
			else	
				this.selectedcell.container.setAttribute("class", "calendar-day-cell");
		}
		
		if(element.today)
			element.setAttribute("class", "calendar-day-cell calendar-day-cell-today-selected");
		else	
			element.setAttribute("class", "calendar-day-cell calendar-day-cell-selected");
	}

	this.animator.purge();
	this.animator.purgeCallbacks();
	this.animator.pushGroup(animators);
	
	var _self = this
	if(events){
		if(selectevents)
			this.animator.pushCallback(function(){ _self.finishSlide();_self.reloadEvents();_self.selectEvents() });
		else
			this.animator.pushCallback(function(){ _self.finishSlide();_self.reloadEvents(); });
	} else
		this.animator.pushCallback(function(){ _self.finishSlide(); });
	
	this.animator.prepare(300, 11);
	this.animator.run();
}
	
Calendar.prototype.calendarForward = function(element, events, selectevents)
{
	if(this.animator.active)
		return;

	this.calendarMonth.setMonth(this.calendarMonth.getMonth() + 1);

	var today = new Date()
	if(today.getYear() == this.calendarMonth.getYear() && today.getMonth() == this.calendarMonth.getMonth()){
		this.viewingCurrentMonth = true;
		widget.setPreferenceForKey(1, "calendarViewingCurrentMonth");
	} else {
		this.viewingCurrentMonth = false;
		widget.setPreferenceForKey(0, "calendarViewingCurrentMonth");
	}

	if(!p.useanimation){
		this.update();
		return;
	}

	var animators = Array();
	
	for(x=11;x<(11 + (this.nextMonthRow - 5));x++){
		var animator = new AnimationObject(this.rows[x]);
		animator.setOptions(0, 10);
		animator.pushPhase(kAnimatorMoveVerticalTop, parseInt(this.rows[x].style.top), parseInt(this.rows[x].style.top) - ((this.nextMonthRow - 5) * 25), 10, 0, null)
		animators.push(animator)
	}

	for(x=5;x<11;x++){
		var animator = new AnimationObject(this.rows[x]);
		animator.setOptions(0, 10);
		animator.pushPhase(kAnimatorMoveVerticalTop, parseInt(this.rows[x].style.top), parseInt(this.rows[x].style.top) - ((this.nextMonthRow - 5) * 25), 10, 0, null)
		animators.push(animator)
	}

	var newmonthcells = Array();
	var oldmonthcells = Array();
	for(x=0;x<112;x++){
		var animator = new AnimationObject(this.cells[x].day);
		animator.setOptions(0, 9);
		
		var callback = null;
		if(this.cells[x].container.displaymode == 3){
			callback = this.animator.callbackWithOptions(kAnimatorCallBackStep, function(cell, step){ _self.cellToFocus(cell, step); });
		}
		if(this.cells[x].container.displaymode == 2){
			callback = this.animator.callbackWithOptions(kAnimatorCallBackStep, function(cell, step){ _self.cellFromFocus(cell, step); });
		}

		animator.pushPhase(0, 0, 0, 9, 0, callback)
		animators.push(animator)
	}
	
	
	if(element != null){
		if(this.selectedcell != null){
			if(this.selectedcell.container.today)
				this.selectedcell.container.setAttribute("class", "calendar-day-cell calendar-day-cell-today");
			else	
				this.selectedcell.container.setAttribute("class", "calendar-day-cell");
		}
		
		if(element.today)
			element.setAttribute("class", "calendar-day-cell calendar-day-cell-today-selected");
		else	
			element.setAttribute("class", "calendar-day-cell calendar-day-cell-selected");
	}

	this.animator.purge();
	this.animator.purgeCallbacks();
	this.animator.pushGroup(animators);
	
	var _self = this;
	if(events){
		if(selectevents)
			this.animator.pushCallback(function(){ _self.finishSlide();_self.reloadEvents();_self.selectEvents() });
		else
			this.animator.pushCallback(function(){ _self.finishSlide();_self.reloadEvents(); });
	} else
		this.animator.pushCallback(function(){ _self.finishSlide(); });
	
	this.animator.prepare(300, 11);
	this.animator.run();
}
	
Calendar.prototype.calendarReset = function()
{
	if(this.animator.active)
		return;

	this.viewingCurrentMonth = true;
	this.viewingCurrentDay = true;
	var date = new Date();
	date.setHours(0)
	date.setMinutes(0)
	date.setSeconds(0)

	if(date.getDate() == this.selectedDate.getDate() && date.getMonth() == this.selectedDate.getMonth() && date.getFullYear() == this.selectedDate.getFullYear()){
		var monthDate = new Date();
		monthDate.setDate(1);
		this.calendarMonth = monthDate
		this.viewingMonth = this.selectedDate.getMonth();
		this.update();
		return;
	}
	
	this.selectedDate = date
	Organized.setCurrentEventDate(date.getTime());
	
	var monthDate = new Date();
	monthDate.setDate(1);
	this.calendarMonth = monthDate
	this.viewingMonth = this.selectedDate.getMonth();
	this.update();
	eventsController.dateChange();
	this.selectEvents();
}
