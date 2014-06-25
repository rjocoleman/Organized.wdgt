Array.prototype.toJSON = function() {
    return '["' + this.join('", "') + '"]';
}

function PrefCal(cal) {
	this.uid = cal[1];
	var calcontainer = document.createElement('div');
	calcontainer.setAttribute ("class", "pref-cal-container");
	document.getElementById("pref-cal-content").appendChild(calcontainer);


	var calname = document.createElement('div');
	calname.setAttribute ("class", "pref-cal-name");
	calname.innerText = cal[0];
	calcontainer.appendChild(calname);

	var chkclass;
	if(p.isCalendarEnabled(cal[1]))
		chkclass = " pref-cal-checkbox-checked";
	else
		chkclass = " pref-cal-checkbox-unchecked";

	var _self = this;
	this.chk = document.createElement('div');
	this.chk.setAttribute ("class", "pref-cal-checkbox" + chkclass);
	this.chk.onclick = function(){ _self.toggle()};
	this.chk.style.backgroundColor = "rgba(" + Math.round((cal[3][0]) * 255) + ", " + Math.round((cal[3][1]) * 255) + ", " + Math.round((cal[3][2]) * 255) + ", 1)"
	calcontainer.appendChild(this.chk);
}

PrefCal.prototype.toggle = function(){
	p.toggleCal(this);
}

function Prefs() {
	var _self = this;
	this.clockCount = 0;
	this.searchareaheight = 0
	this.clockareaheight = 0;
	
	this.selectedTab = 0;
	this.clockTabHeight = 0;
	this.generalTabHeight = 228;
	this.calTabHeight = 250;
	this.tabHeight = this.generalTabHeight;
	
	this.tabOffset = 76;
	this.baseSize = 66;
	
	this.drag = {origin:0, offset:0, active:false, element:null, elementIndex:0};
	
	this.doClockDragHandler = function(){ _self.doClockDrag(); };
	this.endClockDragHandler = function(){ _self.endClockDrag(); };
	
	this.animator = new AnimationController();
	
	this.clockObjects = new Object();
	this.clockDisplayOrder = new Array();
	
	this.searchResults = Array();
	
	this.active = false;
	this.backheight = 0;
	
	this.useanimation = true;
	
	this.defaults = {};
	this.defaults["event days"] = "3";
	this.defaults["marker felt"] = "0";
	this.defaults["use animation"] = "1";
	this.defaults["clock ticks"] = "1";
	this.defaults["update checker"] = "1";
	this.defaults["clock mode"] = "1";
	this.defaults["use 24hr time"] = "0";
	this.defaults["hide completed todos"] = "1";
	this.defaults["hide completed todos immediatly"] = "0";
	this.defaults["show due date in todos"] = "0";
	this.defaults["disable delete confirmations"] = "0";
	this.defaults["calendar filter"] = "[]";
	this.defaults["filter event calendars"] = "1";
	this.defaults["filter todo calendars"] = "0";
	this.defaults["week start"] = "0";
	
	this.hiddenCalendars = null;
	try {
		this.hiddenCalendars = eval(this.v("calendar filter"));
	} catch(err){
		this.hiddenCalendars = Array();
	}
	if(!this.hiddenCalendars)
		this.hiddenCalendars = Array();
}

Prefs.prototype.updateCityIdentifiers = function(clocks)
{
	var idsToReplace = Array(1673, 1013, 1019, 1023, 1112, 1122, 1155, 1165, 1171, 1271, 1307, 1316, 1338, 1391, 1593, 1606, 1631, 1640, 1682, 1688, 1690, 1691);
	var replacementIds = Array(1695, 1013, 1289, 1429, 1014, 1566, 2136, 1618, 1650, 1638, 1022, 1001, 1608, 1391, 1259, 1605, 1632, 1275, 1252, 1760, 1, 2);
	
	if(!widget.preferenceForKey("city upgrade 1.1")){
		var save = false;
		for(x=0;x<clocks.length;x++){
			for(y=0;y<idsToReplace.length;y++){
				if(idsToReplace[y] == clocks[x]){
					clocks[x] = replacementIds[y];
					save = true;
				}
			}
		}
		if(save){
			this.s(clocks.join(), "installed_clocks");
		}
		widget.setPreferenceForKey("1", "city upgrade 1.1")
	}
	return clocks;
}

Prefs.prototype.updateClockModeMenu = function()
{
	var options = document.getElementById("clock-mode-menu").options;
	for(x=0;x<options.length;x++){
		if(x == this.v("clock mode")){
			document.getElementById("clock-mode-menu").selectedIndex = x;
			document.getElementById("clock-mode-text").innerText = options[x].text;
			break;	
		}
	}
}

Prefs.prototype.setup = function()
{
    this.scroller = new AppleVerticalScrollbar(document.getElementById("pref-search-scroller"));
    this.scrollArea = new AppleScrollArea(document.getElementById("search-results-container"));
   	this.scrollArea.addScrollbar(this.scroller);

    this.calScroller = new AppleVerticalScrollbar(document.getElementById("pref-cal-scroller"));
    this.calScrollArea = new AppleScrollArea(document.getElementById("pref-cal-scroller-container"));
   	this.calScrollArea.addScrollbar(this.calScroller);

	document.getElementById("pref-clockticks").key = "clock ticks";
	document.getElementById("pref-hidecompleted").key = "hide completed todos";
	document.getElementById("pref-hidecompletedimmedite").key = "hide completed todos immediatly";
	document.getElementById("pref-animation").key = "use animation";
	document.getElementById("pref-updates").key = "update checker";
	document.getElementById("pref-24hr").key = "use 24hr time";
	document.getElementById("pref-font").key = "marker felt";
	document.getElementById("pref-showtododuedates").key = "show due date in todos";
	document.getElementById("pref-disableconfirmations").key = "disable delete confirmations";
	document.getElementById("pref-filterevents").key = "filter event calendars";
	document.getElementById("pref-filtertodos").key = "filter todo calendars";
	
	this.statetoggleForCheckbox("pref-clockticks");
	this.statetoggleForCheckbox("pref-hidecompleted");
	this.statetoggleForCheckbox("pref-hidecompletedimmedite");
	this.statetoggleForCheckbox("pref-animation");
	this.statetoggleForCheckbox("pref-updates");
	this.statetoggleForCheckbox("pref-24hr");
	this.statetoggleForCheckbox("pref-font");
	this.statetoggleForCheckbox("pref-disableconfirmations");
	this.statetoggleForCheckbox("pref-showtododuedates");
	this.statetoggleForCheckbox("pref-filterevents");
	this.statetoggleForCheckbox("pref-filtertodos");

	document.getElementById("pref-clockticks").innerHTML = getLocalizedString("Show clock ticks");
	document.getElementById("pref-hidecompleted").innerHTML = getLocalizedString("Hide completed To Do's");
	document.getElementById("pref-hidecompletedimmedite").innerHTML = getLocalizedString("Hide immediately");
	document.getElementById("pref-animation").innerHTML = getLocalizedString("Interface animation");
	document.getElementById("pref-updates").innerHTML = getLocalizedString("Check for updates");
	document.getElementById("pref-24hr").innerHTML = getLocalizedString("Use 24 hour time");
	document.getElementById("pref-font").innerHTML = getLocalizedString("Don't use Marker Felt");
	document.getElementById("pref-showtododuedates").innerHTML = getLocalizedString("Show due date in To Do's");
	document.getElementById("pref-disableconfirmations").innerHTML = getLocalizedString("Disable delete confirmations");
	document.getElementById("pref-filterevents").innerHTML = getLocalizedString("Filter events");
	document.getElementById("pref-filtertodos").innerHTML = getLocalizedString("Filter To Do's");
	
	var options = document.getElementById("event-days-menu").options;
	for(x=0;x<options.length;x++){
		if(options[x].value == this.v("event days")){
			document.getElementById("event-days-menu").selectedIndex = x;
			document.getElementById("event-days-text").innerText = options[x].text;
			break;	
		}
	}

	var options = document.getElementById("clock-mode-menu").options;
	for(x=0;x<options.length;x++){
		if(x == this.v("clock mode")){
			document.getElementById("clock-mode-menu").selectedIndex = x;
			document.getElementById("clock-mode-text").innerText = options[x].text;
			break;	
		}
	}

	var options = document.getElementById("calendar-day-menu").options;
	for(x=0;x<options.length;x++){
		if(x == this.v("week start")){
			document.getElementById("calendar-day-menu").selectedIndex = x;
			document.getElementById("calendar-day-text").innerText = options[x].text;
			break;	
		}
	}

	if(document.getElementById("pref-animation").statetoggle == 0)
		this.useanimation = false
	else
		this.useanimation = true

	this.restoreClocks();
	
	var cities = Organized.allCities();
	for(x=0;x<cities.length;x++){
		var clock = new PreferenceSearchClock(cities[x]);
		if(this.clockObjects[clock.uid])
			clock.disable();
		else
			clock.enable();
		this.searchResults[x] = clock;
	}

	this.noResultsContainer = document.createElement('div');
	this.noResultsContainer.setAttribute ("class", "search-result-item");
	this.noResultsContainer.style.display = "none";
	this.noResultsContainer.style.top = "0px";
	document.getElementById("search-results-content").appendChild(this.noResultsContainer);

	var title = document.createElement('div');
	title.setAttribute ("class", "search-result-item-title-noresults ellipsis");
	title.innerHTML = "No cities found";
	this.noResultsContainer.appendChild(title);

	var _self = this;

	var cals = Organized.allCalendars();
	for(x=0;x<cals.length;x++){
		var cal = new PrefCal(cals[x]);
	}
}

Prefs.prototype.toggleCal = function(cal){
	if(!cal)
		return;
	
	if(this.isCalendarEnabled(cal.uid)){
		this.hiddenCalendars.push(cal.uid);
		cal.chk.setAttribute ("class", "pref-cal-checkbox unchecked");
		if(eventsController.selectedCalendar == cal.uid){
			document.getElementById("event-calendars").selectedIndex = 0;
			eventsController.switchCalendar(document.getElementById("event-calendars").options[0], false);
		}
	} else {
		for(y=0;y<this.hiddenCalendars.length;y++){
			if(cal.uid == this.hiddenCalendars[y]){
				this.hiddenCalendars.splice(y, 1);
				break;
			}
		}
		cal.chk.setAttribute ("class", "pref-cal-checkbox pref-cal-checkbox-checked");
	}
	widget.setPreferenceForKey(this.hiddenCalendars.toJSON(), "calendar filter");
	eventsController.eventsDidChange();
	updateCalendarList();
	calendarController.update();
	
	if(p.v("filter todo calendars") == "1")
		todoController.resetDisplay();
}

Prefs.prototype.isCalendarEnabled = function(uid){
	for(y=0;y<this.hiddenCalendars.length;y++){
		if(uid == this.hiddenCalendars[y])
			return false;
	}
	return true;
}

Prefs.prototype.statetoggleForCheckbox = function(id)
{
	var checkboxobject = document.getElementById(id);
	if(parseInt(this.v(checkboxobject.key)) == 1){
		checkboxobject.statetoggle = 1;
		checkboxobject.setAttribute("class", "checked");
	} else {
		checkboxobject.statetoggle = 0;
		checkboxobject.setAttribute("class", "unchecked");
	}

}

Prefs.prototype.setCheckboxState = function(checkboxobject)
{
	if(this.v(checkboxobject.key)){
		if(this.v(checkboxobject.key) == 1){
			checkboxobject.statetoggle = 1;
			checkboxobject.setAttribute("class", "checked");
		} else {
			checkboxobject.statetoggle = 0;
			checkboxobject.setAttribute("class", "unchecked");
		}
	}
}

Prefs.prototype.defaultForKey = function(key)
{
	if(this.defaults[key])
		return this.defaults[key];
	return null;
}
	
Prefs.prototype.v = function(key)
{
	if(widget.preferenceForKey(key) == null)
		return this.defaultForKey(key);
	return widget.preferenceForKey(key);	
}

Prefs.prototype.s = function(value, key)
{
	widget.setPreferenceForKey(value, key);
}

Prefs.prototype.setEventDays = function(option)
{
	document.getElementById("event-days-text").innerText = option.text;
	widget.setPreferenceForKey(option.value, "event days");
	eventsController.eventsDidChange();
}

Prefs.prototype.setClockMode = function(option)
{
	document.getElementById("clock-mode-text").innerText = option.text;
	widget.setPreferenceForKey(option.value, "clock mode");
	clockController.updateMode();
}

Prefs.prototype.setFirstDay = function(option)
{
	document.getElementById("calendar-day-text").innerText = option.text;
	widget.setPreferenceForKey(option.value, "week start");
	updateCalendarDayNames();
	calendarController.update();
}

Prefs.prototype.checkboxAction = function(checkboxobject)
{
	if(checkboxobject.statetoggle == 0){
		checkboxobject.statetoggle = 1;
		this.s(1, checkboxobject.key);
		checkboxobject.setAttribute("class", "checked");
	} else {
		checkboxobject.statetoggle = 0;
		this.s(0, checkboxobject.key);
		checkboxobject.setAttribute("class", "unchecked");
	}
	
	if(checkboxobject.key == "clock ticks"){
		clockController.updateTicks();
	}
	
	if(checkboxobject.key == "marker felt"){
		setupFonts();
	}

	if(checkboxobject.key == "use 24hr time"){
		eventsController.timeChange();
	}

	if(checkboxobject.key == "show due date in todos"){
		todoController.toggleDueDates();
	}
	
	
	if(checkboxobject.key == "use animation"){
		if(checkboxobject.statetoggle == 0)
			this.useanimation = false
		else
			this.useanimation = true
	}

	if(checkboxobject.key == "filter todo calendars"){
		todoController.resetDisplay();
		updateCalendarList();
	}

	if(checkboxobject.key == "filter event calendars"){
		eventsController.eventsDidChange();
		updateCalendarList();
		calendarController.update();
	}

	if(checkboxobject.key == "hide completed todos immediatly" || checkboxobject.key == "hide completed todos")
		todoController.resetDisplay();
}

Prefs.prototype.dosearch = function(searchstring)
{
	if(searchstring != null &&searchstring.length > 0){
		document.getElementById("search-results-container").style.display = "block"
		document.getElementById("pref-search-footer").style.display = "block";
		this.buildSearchResults(searchstring);
		document.getElementById("pref-clock-search-close").style.display = "block";
	} else {
		this.endSearch();
	}
}

Prefs.prototype.endSearch = function()
{
	document.getElementById("pref-clock-search").value = "";
	document.getElementById("pref-clock-search-close").style.display = "none";

	if(p.useanimation){	
		var change = (containerheight + 1) - this.searchareaheight;
		
		var fakeAnimator = new AnimationObject(null);
		fakeAnimator.setOptions(0, 5);
		callback = this.animator.callbackWithOptions(kAnimatorCallBackValue, function(size){ p.searchResizeTick(size); });
		fakeAnimator.pushPhase(0, this.searchareaheight, 0, 5, 0, callback)

		this.animator.purge();
		this.animator.purgeCallbacks();
		this.animator.pushGroup(Array(fakeAnimator));		
		this.animator.prepare(150, 5);

		document.getElementById("pref-search-scroller").style.display = "none";


		document.getElementById("search-header").setAttribute("class", "search-header search-header-active");

		this.animator.pushCallback(function(){ p.endSearchAfterAnimation(); });
		
		this.animator.run();
	} else {
		this.searchareaheight = 0;
		
		document.getElementById("search-header").setAttribute("class", "search-header search-header-active");
		document.getElementById("search-results-container").style.height = "0px"
		document.getElementById("search-results-container").style.display = "none"
		document.getElementById("pref-search-footer").style.top = "1px"
		document.getElementById("pref-search-footer").style.display = "none";
		document.getElementById("pref-search-container").style.height = (0 + 33 + 2) + "px"

		document.getElementById("pref-clock-container").style.top = (30 + this.searchareaheight) + "px";
		this.clockTabHeight = this.searchareaheight + this.clockareaheight + 125;
		this.tabHeight = this.clockTabHeight;
		document.getElementById("prefs-clock-tab").style.height = this.clockTabHeight + "px";
		this.resize();
		
		document.getElementById("search-header").setAttribute("class", "search-header search-header-inactive");
	}
}

Prefs.prototype.fixOldClocks = function(clocks)
{
	var save = false;
	for(x=0;x<clocks.length;x++){
		if(clocks[x] == 1673){
			clocks[x] = "1695";
			save = true;	
		}
	}
	if(save){
		this.s(clocks.join(), "installed_clocks");
	}
	return clocks;
}

Prefs.prototype.currentClocks = function()
{
	if(widget.preferenceForKey("installed_clocks")){
		var clocks = widget.preferenceForKey("installed_clocks").split(",");
		var validatedOrder = Array();
		for(x=0;x<clocks.length;x++){
			var data = Organized.cityDataForID(clocks[x]);
			if(!data)
				continue;
			validatedOrder.push(clocks[x]);
		}
		
		clocks = validatedOrder;
		if(clocks.length > 0){
			clocks = this.fixOldClocks(clocks);
			clocks = this.updateCityIdentifiers(clocks);
			return clocks;
		}
	}
	this.s("1611", "installed_clocks");
	return Array("1611");
}

Prefs.prototype.resetClockSortOrder = function()
{
	this.clockDisplayOrder.length = 0;
	var cities = this.currentClocks();
	if(cities && cities.length > 0){
		for(x=0;x<cities.length;x++)
			this.clockDisplayOrder[x] = cities[x]
	}
}

Prefs.prototype.sortClocks = function()
{
	for(x=0;x<this.clockDisplayOrder.length;x++){
		this.clockObjects[this.clockDisplayOrder[x]].container.style.top = (22 * x) + "px"
	}
}

Prefs.prototype.restoreClocks = function()
{
	var _self = this;
	var cities = this.currentClocks();
	this.clockCount = cities.length;
	for(x=0;x<cities.length;x++){
		var data = Organized.cityDataForID(cities[x]);
		if(!data)
			continue;
		var clock = new PreferenceClock(x, data);
		this.clockObjects[clock.uid] = clock;
		this.clockDisplayOrder[this.clockDisplayOrder.length] = clock.uid;
		document.getElementById("pref-clock-container").appendChild(clock.container);
	}
	document.getElementById("pref-clock-container").style.height = (cities.length * 22) + "px"
	this.clockareaheight = (cities.length * 22)
}

Prefs.prototype.updateUILayout = function()
{
	document.getElementById("prefs-general-tab").style.height = this.generalTabHeight + "px";
	this.clockTabHeight = this.searchareaheight + this.clockareaheight + 125;
	document.getElementById("pref-clock-container").style.top = (30 + this.searchareaheight) + "px";
	document.getElementById("prefs-clock-tab").style.height = this.clockTabHeight + "px";
}

Prefs.prototype.resize = function()
{
	var height = this.currentTabHeight();

	document.getElementById("back-middle").style.height = height + "px";
	document.getElementById("pref-base").style.top = this.tabOffset + height + "px"
	document.getElementById("pref-tab-container").style.height = height + "px";
	
	this.backheight = this.tabOffset + height + this.baseSize;
	this.scrollArea.refresh();

	if(this.active && !this.animator.active)
		window.resizeTo(window.outerWidth, this.tabOffset + height + this.baseSize);
}

Prefs.prototype.currentTabHeight = function()
{
	return this.tabHeight;
}	
	
Prefs.prototype.selectTab = function(tab)
{
	if(this.animator.active || this.selectedTab == tab)
		return;

	var oldTab = this.selectedTab;
	this.selectedTab = tab;

	if(!p.useanimation){
		if(this.selectedTab == 0){
			this.tabHeight = this.generalTabHeight;
			document.getElementById("pref-tab-general").setAttribute("class", "pref-tab pref-tab-selected");
			document.getElementById("pref-tab-clocks").setAttribute("class", "pref-tab pref-tab-unselected");
			document.getElementById("pref-tab-cal").setAttribute("class", "pref-tab pref-tab-unselected");
			document.getElementById("prefs-general-tab").style.display = "block"
			document.getElementById("prefs-general-tab").style.opacity = 1.0
			document.getElementById("prefs-clock-tab").style.display = "none"
			document.getElementById("prefs-cal-tab").style.display = "none"
		} else if(this.selectedTab == 1){
			this.tabHeight = this.clockTabHeight;
			document.getElementById("pref-tab-general").setAttribute("class", "pref-tab pref-tab-unselected");
			document.getElementById("pref-tab-clocks").setAttribute("class", "pref-tab pref-tab-selected");		
			document.getElementById("pref-tab-cal").setAttribute("class", "pref-tab pref-tab-unselected");
			document.getElementById("prefs-clock-tab").style.display = "block"
			document.getElementById("prefs-clock-tab").style.opacity = 1.0
			document.getElementById("prefs-general-tab").style.display = "none"
			document.getElementById("prefs-cal-tab").style.display = "none"
		} else {
			this.tabHeight = this.calTabHeight;
			document.getElementById("pref-tab-cal").setAttribute("class", "pref-tab pref-tab-selected");
			document.getElementById("pref-tab-general").setAttribute("class", "pref-tab pref-tab-unselected");
			document.getElementById("pref-tab-clocks").setAttribute("class", "pref-tab pref-tab-unselected");		
			document.getElementById("prefs-cal-tab").style.display = "block"
			document.getElementById("prefs-cal-tab").style.opacity = 1.0
			document.getElementById("prefs-general-tab").style.display = "none"
			document.getElementById("prefs-clock-tab").style.display = "none"
			this.calScrollArea.refresh();
		}
		this.resize();
		return;
	}
	
	var oldElement;
	var oldTabHeight = 0;
	if(oldTab == 0){
		oldElement = document.getElementById("prefs-general-tab")
		oldTabHeight = this.generalTabHeight;
	} else if(oldTab == 1){
		oldElement = document.getElementById("prefs-clock-tab")
		oldTabHeight = this.clockTabHeight;
	} else {
		oldElement = document.getElementById("prefs-cal-tab")
		oldTabHeight = this.calTabHeight;
	}
	
	if(this.selectedTab == 0){
		document.getElementById("pref-tab-general").setAttribute("class", "pref-tab pref-tab-selected");
		document.getElementById("pref-tab-clocks").setAttribute("class", "pref-tab pref-tab-unselected");
		document.getElementById("pref-tab-cal").setAttribute("class", "pref-tab pref-tab-unselected");
		document.getElementById("prefs-general-tab").style.display = "block";
		document.getElementById("prefs-general-tab").style.opacity = 0;
		
		var fadeIn = new AnimationObject(document.getElementById("prefs-general-tab"));
		fadeIn.setOptions(0, 10);
		fadeIn.pushPhase(kAnimateOpacity, 0, 1, 10, 0, null)

		var fadeOut = new AnimationObject(oldElement);
		fadeOut.setOptions(kAnimateOptionsHide, 10);
		fadeOut.pushPhase(kAnimateOpacity, 1, 0, 10, 0, null)

		var fakeAnimator = new AnimationObject(null);
		fakeAnimator.setOptions(0, 10);
		callback = this.animator.callbackWithOptions(kAnimatorCallBackValue, function(size){ p.tabSwitchTick(size); });
		fakeAnimator.pushPhase(0, oldTabHeight, this.generalTabHeight, 10, 0, callback)

		if(window.outerHeight < this.tabOffset + this.generalTabHeight + this.baseSize)
			window.resizeTo(window.outerWidth, this.tabOffset + this.generalTabHeight + this.baseSize);

		var _self = this;

		this.animator.purge();
		this.animator.purgeCallbacks();
		this.animator.pushCallback(function(){ window.resizeTo(window.outerWidth, _self.tabOffset + _self.generalTabHeight + _self.baseSize); });
		this.animator.pushGroup(Array(fadeIn, fadeOut, fakeAnimator));		
		this.animator.prepare(200, 10);
		this.animator.run();
	} else if(this.selectedTab == 1){
		document.getElementById("pref-tab-general").setAttribute("class", "pref-tab pref-tab-unselected");
		document.getElementById("pref-tab-clocks").setAttribute("class", "pref-tab pref-tab-selected");		
		document.getElementById("pref-tab-cal").setAttribute("class", "pref-tab pref-tab-unselected");
		document.getElementById("prefs-clock-tab").style.opacity = 0;
		document.getElementById("prefs-clock-tab").style.display = "block";

		var fadeIn = new AnimationObject(document.getElementById("prefs-clock-tab"));
		fadeIn.setOptions(0, 10);
		fadeIn.pushPhase(kAnimateOpacity, 0, 1, 10, 0, null)

		var fadeOut = new AnimationObject(oldElement);
		fadeOut.setOptions(kAnimateOptionsHide, 10);
		fadeOut.pushPhase(kAnimateOpacity, 1, 0, 10, 0, null)

		var fakeAnimator = new AnimationObject(null);
		fakeAnimator.setOptions(0, 10);
		callback = this.animator.callbackWithOptions(kAnimatorCallBackValue, function(size){ p.tabSwitchTick(size); });
		fakeAnimator.pushPhase(0, oldTabHeight, this.clockTabHeight, 10, 0, callback)

		if(window.outerHeight < this.tabOffset + this.clockTabHeight + this.baseSize)
			window.resizeTo(window.outerWidth, this.tabOffset + this.clockTabHeight + this.baseSize);

		var _self = this;

		this.animator.purge();
		this.animator.purgeCallbacks();
		this.animator.pushGroup(Array(fadeIn, fadeOut, fakeAnimator));	
		this.animator.pushCallback(function(){ window.resizeTo(window.outerWidth, _self.tabOffset + _self.clockTabHeight + _self.baseSize); });
		this.animator.prepare(200, 10);
		this.animator.run();
	} else {
		document.getElementById("pref-tab-general").setAttribute("class", "pref-tab pref-tab-unselected");
		document.getElementById("pref-tab-clocks").setAttribute("class", "pref-tab pref-tab-unselected");		
		document.getElementById("pref-tab-cal").setAttribute("class", "pref-tab pref-tab-selected");
		document.getElementById("prefs-cal-tab").style.opacity = 0;
		document.getElementById("prefs-cal-tab").style.display = "block";
		
		var calheight = parseInt(document.defaultView.getComputedStyle(document.getElementById("pref-cal-content"),"").getPropertyValue("height"));
		if(calheight > 160){
			document.getElementById("pref-cal-scroller-container").style.height = "160px";
			document.getElementById("pref-cal-scroller").style.height = "160px";
			this.calTabHeight = 172 + 72;
		} else {
			document.getElementById("pref-cal-scroller-container").style.height = calheight + "px";
			document.getElementById("pref-cal-scroller").style.height = calheight + "px";
			this.calTabHeight = calheight + 15 + 72;
		}
		
		this.calScrollArea.refresh();
		this.calScrollArea.verticalScrollTo(0);

		var fadeIn = new AnimationObject(document.getElementById("prefs-cal-tab"));
		fadeIn.setOptions(0, 10);
		fadeIn.pushPhase(kAnimateOpacity, 0, 1, 10, 0, null)

		var fadeOut = new AnimationObject(oldElement);
		fadeOut.setOptions(kAnimateOptionsHide, 10);
		fadeOut.pushPhase(kAnimateOpacity, 1, 0, 10, 0, null)

		var fakeAnimator = new AnimationObject(null);
		fakeAnimator.setOptions(0, 10);
		callback = this.animator.callbackWithOptions(kAnimatorCallBackValue, function(size){ p.tabSwitchTick(size); });
		fakeAnimator.pushPhase(0, oldTabHeight, this.calTabHeight, 10, 0, callback)

		if(window.outerHeight < this.tabOffset + this.calTabHeight + this.baseSize)
			window.resizeTo(window.outerWidth, this.tabOffset + this.calTabHeight + this.baseSize);

		var _self = this;

		this.animator.purge();
		this.animator.purgeCallbacks();
		this.animator.pushGroup(Array(fadeIn, fadeOut, fakeAnimator));	
		this.animator.pushCallback(function(){ window.resizeTo(window.outerWidth, _self.tabOffset + _self.calTabHeight + _self.baseSize); });
		this.animator.prepare(200, 10);
		this.animator.run();
	}
}

Prefs.prototype.tabSwitchTick = function(size)
{
	this.tabHeight = size;
	this.resize();
}

Prefs.prototype.buildSearchResults = function(searchstring)
{	
	var lastElement = null;
	var added = 0;
	var regex = new RegExp("^" + (searchstring).replace("%20", " "), "gi");
	for(x=0;x<this.searchResults.length;x++){
		if(this.searchResults[x].searchdisplay.match(regex)){
			this.searchResults[x].container.style.top = (added * 20) + "px"
			this.searchResults[x].container.style.display = "block";
			lastElement = this.searchResults[x].container;
			added++;
		} else {
			var found = false;
			var searchkeys = this.searchResults[x].searchkeys;
			for(y=0;y<searchkeys.length;y++){
				if(searchkeys[y].match(regex)){
					found = true;
					break;
				}
			}
			if(found){
				this.searchResults[x].container.style.top = (added * 20) + "px"
				this.searchResults[x].container.style.display = "block";
				lastElement = this.searchResults[x].container;
				added++;
			} else {
				this.searchResults[x].container.style.display = "none";
			}
		}
	}
	
	if(added == 0){
		this.noResultsContainer.style.display = "block";
		// show no results
		added++;	
	} else
		this.noResultsContainer.style.display = "none";
		
	
	if(lastElement){
		lastElement.setAttribute ("class", "search-result-item search-result-item-last");
	}
		
	var containerheght;
	if(added < 4){
		containerheight = added * 20;
		scrollmode = 0;
	} else {
		containerheight = 80;
		scrollmode = 1;
	}

	if(this.searchareaheight != (containerheight + 1)){
		if(p.useanimation){
			this.animator.cancelWithoutFinishing();
			var change = (containerheight + 1) - this.searchareaheight;
			
			var fakeAnimator = new AnimationObject(null);
			fakeAnimator.setOptions(0, 5);
			callback = this.animator.callbackWithOptions(kAnimatorCallBackValue, function(size){ p.searchResizeTick(size); });
			fakeAnimator.pushPhase(0, this.searchareaheight,containerheight + 1, 5, 0, callback)

			var fakeAnimator2 = new AnimationObject(document.getElementById("search-results-content"));
			fakeAnimator2.setOptions(0, 5);
			fakeAnimator2.pushPhase(kAnimatorResizeHeight, 0, ((added * 20) - 2) + 1, 1, 4, 0)
	
			this.animator.purge();
			this.animator.purgeCallbacks();
			this.animator.pushGroup(Array(fakeAnimator, fakeAnimator2));		
			this.animator.prepare(150, 5);

		
			if(window.outerHeight < (this.tabOffset + (containerheight + this.clockareaheight + 125) + this.baseSize))
				window.resizeTo(window.outerWidth, this.tabOffset + (containerheight + this.clockareaheight + 125) + this.baseSize);

			if(change > 0)
				document.getElementById("search-results-content").style.height = ((added * 20) - 2) + "px"
			if(scrollmode == 0)
				document.getElementById("pref-search-scroller").style.display = "none";
	
			document.getElementById("search-header").setAttribute("class", "search-header search-header-active");

			if(scrollmode == 1)
				this.animator.pushCallback(function(){ p.showSearchScroller(); });
			
			this.animator.run();
			this.scrollArea.refresh();
		} else {
			this.searchareaheight = containerheight + 1;

			document.getElementById("search-results-content").style.height = ((added * 20) - 2) + "px"
			document.getElementById("search-header").setAttribute("class", "search-header search-header-active");
			document.getElementById("search-results-container").style.height = ((this.searchareaheight - 1) - 2) + "px"
			document.getElementById("pref-search-footer").style.top = (2 + (this.searchareaheight - 1)) + "px"
			document.getElementById("pref-search-container").style.height = ((this.searchareaheight - 1) + 33 + 2) + "px"

			document.getElementById("pref-clock-container").style.top = (30 + this.searchareaheight) + "px";
			this.clockTabHeight = this.searchareaheight + this.clockareaheight + 125;
			this.tabHeight = this.clockTabHeight;
			document.getElementById("prefs-clock-tab").style.height = this.clockTabHeight + "px";
			this.resize();

			if(scrollmode == 0)
				document.getElementById("pref-search-scroller").style.display = "none";
			else
				document.getElementById("pref-search-scroller").style.display = "block";

			this.scrollArea.refresh();
		}
		
		return;
	} else
		document.getElementById("search-results-content").style.height = ((added * 20) - 2) + "px"
			this.scrollArea.refresh();
	this.updateUILayout();
}

Prefs.prototype.endSearchAfterAnimation = function()
{
	document.getElementById("search-results-container").style.height = "0px"
	document.getElementById("pref-search-footer").style.top = "1px"
	document.getElementById("pref-search-footer").style.display = "none";
	document.getElementById("search-results-container").style.display = "none"
	document.getElementById("pref-search-container").style.height = (0 + 33 + 2) + "px"
	document.getElementById("search-header").setAttribute("class", "search-header search-header-inactive");
	this.resize();
}	

Prefs.prototype.showSearchScroller = function()
{
	document.getElementById("pref-search-scroller").style.display = "block";
}	
	
Prefs.prototype.searchResizeTick = function(size)
{
	this.searchareaheight = size;
	document.getElementById("search-results-container").style.height = ((this.searchareaheight - 1) - 2) + "px"
	document.getElementById("pref-search-footer").style.top = (2 + (this.searchareaheight - 1)) + "px"
	document.getElementById("pref-search-container").style.height = ((this.searchareaheight - 1) + 33 + 2) + "px"

	document.getElementById("pref-clock-container").style.top = (30 + this.searchareaheight) + "px";
	this.clockTabHeight = this.searchareaheight + this.clockareaheight + 125;
	this.tabHeight = this.clockTabHeight;
	document.getElementById("prefs-clock-tab").style.height = this.clockTabHeight + "px";
	this.resize();
}

Prefs.prototype.addClock = function(result)
{
	var clocks = Array();
	if(widget.preferenceForKey("installed_clocks"))
		clocks = widget.preferenceForKey("installed_clocks").split(",");
	clocks[clocks.length] = result.uid;
	widget.setPreferenceForKey(clocks.join(), "installed_clocks");
	Organized.updateCityList(p.currentClocks().join());
	clockController.buildDisplay();
	
	var data = Organized.cityDataForID(result.uid);
	var clock = new PreferenceClock(this.clockDisplayOrder.length, data);

	var start = parseInt(result.container.style.top);
	start += (102 - parseInt(document.getElementById("search-results-container").scrollTop))
	
	var final = 81 + parseInt(document.getElementById("pref-clock-container").style.top) + (this.clockDisplayOrder.length * 22);
	
	this.clockObjects[clock.uid] = clock;
	this.clockDisplayOrder[this.clockDisplayOrder.length] = clock.uid;
	
	if(p.useanimation){
		_self = this;
		
		window.resizeTo(window.outerWidth, this.tabOffset + (this.searchareaheight + (this.clockDisplayOrder.length * 22) + 125) + this.baseSize);

		if(this.animator.active)
			this.animator.cancelWithoutFinishing();
		
		var fakeAnimator = new AnimationObject(null);
		fakeAnimator.setOptions(0, 10);
		callback = this.animator.callbackWithOptions(kAnimatorCallBackValue, function(size){ p.addClockAnimationTick(size); });
		fakeAnimator.pushPhase(0, this.clockareaheight, this.clockDisplayOrder.length * 22, 10, 0, callback)

		this.animator.purge();
		this.animator.pushAnimator(fakeAnimator);		
		this.animator.prepare(200, 10);
		this.animator.run();

		document.getElementById("behind").appendChild(clock.container);
		clock.doAddAnimation(start, final, (this.clockDisplayOrder.length - 1) * 22)
	} else {
		document.getElementById("pref-clock-container").appendChild(clock.container);
		clock.container.style.top = ((this.clockDisplayOrder.length - 1) * 22) + "px";
		clock.container.style.left = "0px";
		
		this.clockareaheight += 22;
		document.getElementById("pref-clock-container").style.height = (this.clockareaheight) + "px"
		this.clockTabHeight = this.searchareaheight + this.clockareaheight + 125;
		this.tabHeight = this.clockTabHeight;
		document.getElementById("prefs-clock-tab").style.height = this.clockTabHeight + "px";
			
		this.resize()
	}		
}

Prefs.prototype.addClockAnimationTick = function(size)
{
	this.clockareaheight = size;
	this.clockTabHeight = this.searchareaheight + this.clockareaheight + 125;
	this.tabHeight = this.clockTabHeight;

	document.getElementById("pref-clock-container").style.height = (this.clockareaheight) + "px"
	document.getElementById("prefs-clock-tab").style.height = this.clockTabHeight + "px";
	
	this.resize();
}
	
Prefs.prototype.doAddClockAnimation = function()
{
	this.clockareaheight += this.addClockAnimation.stepChange;
	if(this.addClockAnimation.step == 9)
		this.clockareaheight = this.addClockAnimation.final
	document.getElementById("pref-clock-container").style.height = (this.clockareaheight) + "px"
	this.clockTabHeight = this.searchareaheight + this.clockareaheight + 125;
	document.getElementById("prefs-clock-tab").style.height = this.clockTabHeight + "px";
		
	this.resize();
		
	if(this.addClockAnimation.step == 9){
		clearInterval(this.addClockAnimation.timer);
		this.addClockAnimation.timer = null;
		return;
	}
	this.addClockAnimation.step++;
}

Prefs.prototype.removeClock = function(object)
{
	var found = false;
	var itemindex = -1;
	var followingobjects = Array();
	for(x=0;x<this.clockDisplayOrder.length;x++){
		if(found){
			followingobjects[followingobjects.length] = this.clockObjects[this.clockDisplayOrder[x]];
			continue	
		}
		
		if(this.clockObjects[this.clockDisplayOrder[x]].uid == object.uid){
			itemindex = x;
			found = true;
		}
	}

	var animators = Array();
	
	if(itemindex != -1){
		this.clockObjects[object.uid] = null;
		this.clockDisplayOrder.splice(itemindex, 1);	

		for(x=0;x<followingobjects.length;x++){
			if(p.useanimation){	
				var animator = new AnimationObject(followingobjects[x].container);
				animator.setOptions(0, 10);
				animator.pushPhase(kAnimatorMoveVerticalTop, parseInt(followingobjects[x].container.style.top), (itemindex * 22) + (x * 22), 10, 0, null)
				animators.push(animator);
			} else {
				followingobjects[x].container.style.top = (itemindex * 22) + (x * 22) + "px";
			}
		}
	}

	widget.setPreferenceForKey(this.clockDisplayOrder.join(), "installed_clocks");
	clockController.updateSortOrder();
	clockController.removeClock(object.uid);
	clockController.buildDisplay();
	clockController.sortClocks();

	if(this.clockDisplayOrder.length == 0){
		var data = Organized.cityDataForID("1611");
		var clock = new PreferenceClock(0, data);
		this.clockObjects[clock.uid] = clock;
		this.clockDisplayOrder[this.clockDisplayOrder.length] = clock.uid;
		object.container.parentNode.removeChild(object.container);
		object.shadow.parentNode.removeChild(object.shadow);
		document.getElementById("pref-clock-container").appendChild(clock.container);
		this.resetSearchResults();
		return;
	}		
	
	this.resetSearchResults();
	if(p.useanimation){		
		var animator = new AnimationObject(object.container);
		animator.setOptions(kAnimateOptionsRemoveFromParent, 10);
		animator.pushPhase(kAnimatorResizeHeight, 21, 0, 10, 0, null)
		animators.unshift(animator);

		var fakeAnimator = new AnimationObject(null);
		fakeAnimator.setOptions(0, 10);
		callback = this.animator.callbackWithOptions(kAnimatorCallBackValue, function(size){ p.addClockAnimationTick(size); });
		fakeAnimator.pushPhase(0, this.clockareaheight, this.clockareaheight - 22, 10, 0, callback)
		animators.push(fakeAnimator);
		
		this.animator.purge();
		this.animator.pushGroup(animators);		
		this.animator.prepare(200, 10);
		this.animator.run();
	} else {
		object.container.parentNode.removeChild(object.container);
		this.clockareaheight = this.clockDisplayOrder.length * 22
		document.getElementById("pref-clock-container").style.height = (this.clockareaheight) + "px"
		this.clockTabHeight = this.searchareaheight + this.clockareaheight + 125;
		this.tabHeight = this.clockTabHeight;
		document.getElementById("prefs-clock-tab").style.height = this.clockTabHeight + "px";
			
		this.resize()
	}
}

Prefs.prototype.resetSearchResults = function()
{
	for(x=0;x<this.searchResults.length;x++){
		if(this.clockObjects[this.searchResults[x].uid])
			this.searchResults[x].disable();
		else
			this.searchResults[x].enable();
	}	
}

Prefs.prototype.startClockDrag = function(controller)
{
	if(this.clockDisplayOrder.length == 1)
		return;
	
	for(x=0;x<this.clockDisplayOrder.length;x++){
		if(this.clockObjects[this.clockDisplayOrder[x]].animator.active != false)
			this.clockObjects[this.clockDisplayOrder[x]].animator.cancel();
		this.clockObjects[this.clockDisplayOrder[x]].container.style.top = (x * 22) + "px"
	}

	this.drag.controller = controller;
	this.drag.element = controller.container;
	this.drag.element.setAttribute("class", "pref-current-clock-item pref-current-clock-item-drag");
	this.drag.shadow = controller.shadow;
	this.drag.shadow.style.top = 81 + parseInt(document.getElementById("pref-clock-container").style.top) + parseInt(this.drag.element.style.top) - 4 + "px"
	this.drag.shadow.style.display = "block"
	this.drag.shadow.style.zIndex = 10;
		
	this.drag.origin = parseInt(this.drag.element.style.top);
	this.drag.index = Math.floor(this.drag.origin / 22);
	
	this.drag.active = true;
    document.addEventListener("mousemove", this.doClockDragHandler, true);
    document.addEventListener("mouseup", this.endClockDragHandler, true);
 
    this.drag.offset = parseInt(event.y) - parseInt(document.getElementById("pref-clock-container").style.top);
 	event.stopPropagation();
	event.preventDefault();
}

Prefs.prototype.doClockDrag = function(events)
{
    var raw_position = parseInt(event.y) - parseInt(document.getElementById("pref-clock-container").style.top);
	var newposition =  (raw_position - this.drag.offset) + this.drag.origin;
	if(newposition < 0)
		newposition = 0;
	
	if(newposition > (parseInt(document.getElementById("pref-clock-container").style.height) - 22))
		newposition = (parseInt(document.getElementById("pref-clock-container").style.height) - 22)
		
	var newIndex = this.drag.index;
	newIndex = Math.floor((newposition + 11) / 22);
		
	if(newIndex != this.drag.index){
		var newcontent = Array();
		
		var draggedItem;
		for(x=0;x<this.clockDisplayOrder.length;x++){
			if(this.clockObjects[this.clockDisplayOrder[x]].container == this.drag.element){
				draggedItem = this.clockObjects[this.clockDisplayOrder[x]];
				break;
			}
		}

		for(x=0;x<this.clockDisplayOrder.length;x++){
			if(newIndex < this.drag.index){
				if(x == newIndex)
					newcontent[newcontent.length] = draggedItem.uid;
			}
			if(this.clockObjects[this.clockDisplayOrder[x]].container != this.drag.element){
				newcontent[newcontent.length] = this.clockDisplayOrder[x];
			}
			if(newIndex > this.drag.index){
				if(x == newIndex)
					newcontent[newcontent.length] = draggedItem.uid;
			}
		}

		this.clockDisplayOrder = newcontent;
		for(x=0;x<this.clockDisplayOrder.length;x++){
			if(this.clockObjects[this.clockDisplayOrder[x]].container != this.drag.element){
				var doSlide = false;
				if(parseInt(this.clockObjects[this.clockDisplayOrder[x]].container.style.top) != (22 * x)){
					doSlide = true;	
				}
				
				if(doSlide){
					if(p.useanimation){	
						if(this.clockObjects[this.clockDisplayOrder[x]].animator.active != false){
							if(this.clockObjects[this.clockDisplayOrder[x]].animationObject.properties[0].end == (22 * x)){
								continue;
							}
							this.displayItems[this.clockDisplayOrder[x]].animator.cancel();
						}

						var container = this.clockObjects[this.clockDisplayOrder[x]].container;
						
						this.clockObjects[this.clockDisplayOrder[x]].animationObject.setOptions(0, 10);
						this.clockObjects[this.clockDisplayOrder[x]].animationObject.purgePhases();
						this.clockObjects[this.clockDisplayOrder[x]].animationObject.pushPhase(kAnimatorMoveVerticalTop, parseInt(container.style.top), 22 * x, 10, 0, null)
						
						this.clockObjects[this.clockDisplayOrder[x]].animator.purgeCallbacks();
						controller = this.clockObjects[this.clockDisplayOrder[x]];
						this.drag.controller.animator.pushCallback(function(){ controller.animationFinished(); });
						
						this.clockObjects[this.clockDisplayOrder[x]].animator.purge();
						this.clockObjects[this.clockDisplayOrder[x]].animator.pushAnimator(this.clockObjects[this.clockDisplayOrder[x]].animationObject);
						this.clockObjects[this.clockDisplayOrder[x]].animator.prepare(200, 10);
						this.clockObjects[this.clockDisplayOrder[x]].animator.run();
					} else {
						this.clockObjects[this.clockDisplayOrder[x]].container.style.top = (22 * x) + "px";
					}
				}
			}
		}
		this.drag.index = newIndex;
	}

	this.drag.element.style.top = newposition + "px";
	this.drag.shadow.style.top = 81 + parseInt(document.getElementById("pref-clock-container").style.top) + newposition - 4 + "px";
	
	event.stopPropagation();
	event.preventDefault();
}

Prefs.prototype.endClockDrag = function(events)
{
	widget.setPreferenceForKey(this.clockDisplayOrder.join(), "installed_clocks");
	clockController.updateSortOrder();
	clockController.sortClocks();
	clockController.buildDisplay();

	document.removeEventListener("mousemove", this.doClockDragHandler, true);	
	document.removeEventListener("mouseup", this.endClockDragHandler, true);
	
	if(p.useanimation){	
		this.drag.controller.animationObject.setOptions(0, 10);
		this.drag.controller.animationObjectShadow.setOptions(0, 10);
		
		this.drag.controller.animationObjectShadow.purgePhases();
		this.drag.controller.animationObjectShadow.pushPhase(kAnimatorMoveVerticalTop, 81 + parseInt(document.getElementById("pref-clock-container").style.top) + parseInt(this.drag.element.style.top) - 4, 81 + parseInt(document.getElementById("pref-clock-container").style.top) + (this.drag.index * 22) - 4, 10, 0, null)

		this.drag.controller.animationObject.purgePhases();
		this.drag.controller.animationObject.pushPhase(kAnimatorMoveVerticalTop, parseInt(this.drag.element.style.top), (this.drag.index * 22), 10, 0, null)
		
		var controller = this.drag.controller;
		this.drag.controller.animator.purgeCallbacks();
		this.drag.controller.animator.pushCallback(function(){ controller.animationFinished(); });
		this.drag.controller.animator.purge();
		this.drag.controller.animator.pushGroup(Array(this.drag.controller.animationObject, this.drag.controller.animationObjectShadow));
		this.drag.controller.animator.prepare(200, 10);
		this.drag.controller.animator.run();
	} else {
		this.drag.element.setAttribute("class", "pref-current-clock-item");
		this.drag.element.style.top = (this.drag.index * 22) + "px";
		this.drag.shadow.style.display = "none";
	}
	this.drag.active = false;
}
