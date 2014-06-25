function Todos(position, city) {
	var _self = this;
	this.isSelected = false;
	this.contentHeight = 0;
	this.currentHeight = 100;
	this.currentItems = new Object();
	this.displayOrder = Array();
	this.resizeOrigin = 0;
	this.inDelete = false;
	this.inAdd = false;
	this.inCalendarAdd = false;
	this.intransition = false;
	this.viewingtodo = false;

	this.doDragHandler = function(){ _self.doResizeDrag(); };
	this.endDragHandler = function(){ _self.endResizeDrag(); };
	
	this.animator = new AnimationController();
	this.deleteAnimator = new AnimationController();
	
	this.selectedCalendar = "ALL"
	
	this.currentScrollTop = 0;
	
	this.selectedTodo = null;
	
	this.menu = new CustomMenu();
}

Todos.prototype.inConfirmation = function()
{
	if(this.inDelete || this.inAdd || this.inCalendarAdd)
		return true;
	return false;
}

Todos.prototype.prepareToShow = function()
{
	this.scrollArea.verticalScrollTo(this.currentScrollTop);
}

Todos.prototype.prepareToHide = function()
{
	this.currentScrollTop = 0;
	this.currentScrollTop = this.scrollArea.content.scrollTop;
}

Todos.prototype.respondToKey = function(key)
{
	if((key == 8 || key == 63272) && (this.inDelete == false && this.inAdd == false && this.inCalendarAdd == false && this.viewingtodo == false)){
		var _self = this;
		setTimeout(function(){_self.deleteSelectedTodo();}, 100);
	}
	
	if(this.inDelete){
		if(key == 27){
			this.cancelDelete();
		}	
		if(key == 3 || key == 13){
			this.doDelete();
		}	
	}

	if(this.inAdd){
		if(key == 27){
			this.cancelTodoAdd();
		}	
		if(key == 3 || key == 13){
			this.doTodoAdd();
		}	
	}

	if(this.inCalendarAdd){
		if(key == 27){
			this.cancelCalAdd();
		}	
		if(key == 3 || key == 13){
			this.doCalAdd();
		}	
	}
}

Todos.prototype.selectFirstTodo = function()
{
	if(this.selectedTodo)
		return;

	for(x=0;x<this.displayOrder.length;x++){
		if(!this.currentItems[this.displayOrder[x]])
			continue;
		this.currentItems[this.displayOrder[x]].selectTodo();
		this.scrollArea.verticalScrollTo(0);
		break;
	}
}

Todos.prototype.rowDown = function()
{
	if(!this.selectedTodo)
		return;
	
	var found = false;
	for(x=0;x<this.displayOrder.length;x++){
		if(this.selectedTodo.uid == this.displayOrder[x]){
			found = true;
			continue;
		}
		
		if(found){
			if(!this.currentItems[this.displayOrder[x]])
				continue;
			if(this.currentItems[this.displayOrder[x]].container.style.display == "none")
				continue;
			this.currentItems[this.displayOrder[x]].selectTodo();
			
			var offset = parseInt(this.currentItems[this.displayOrder[x]].container.style.top);
			var scrollContentTop = this.scrollArea.content.scrollTop;
			var scrollContentHeight = parseInt(document.getElementById("todo-scroller-container").style.height) - 20;
			
			if(!(offset >= scrollContentTop) || !((offset + 15) < (scrollContentTop + scrollContentHeight))){
				if(offset < scrollContentTop)
					this.scrollArea.verticalScrollTo(offset);
				else
					this.scrollArea.verticalScrollTo(offset - scrollContentHeight + 18);
			}
			break;
		}
	}
}
	
Todos.prototype.rowUp = function()
{
	if(!this.selectedTodo)
		return;
	
	var found = false;
	for(x=this.displayOrder.length;x>=0;x--){
		if(this.selectedTodo.uid == this.displayOrder[x]){
			found = true;
			continue;
		}
		
		if(found){
			if(!this.currentItems[this.displayOrder[x]])
				continue;
			if(this.currentItems[this.displayOrder[x]].container.style.display == "none")
				continue;
			this.currentItems[this.displayOrder[x]].selectTodo();
			
			var offset = parseInt(this.currentItems[this.displayOrder[x]].container.style.top);
			var scrollContentTop = this.scrollArea.content.scrollTop;
			var scrollContentHeight = parseInt(document.getElementById("todo-scroller-container").style.height) - 20;
			
			if(!(offset >= scrollContentTop) || !((offset + 15) < (scrollContentTop + scrollContentHeight))){
				if(offset < scrollContentTop)
					this.scrollArea.verticalScrollTo(offset);
				else
					this.scrollArea.verticalScrollTo(offset - scrollContentHeight + 18);
			}
			break;
		}
	}
}

Todos.prototype.deselectTodo = function(todo){
	if(this.selectedTodo && this.selectedTodo.uid == todo.uid)
		this.selectedTodo = null;
}
	
Todos.prototype.deselectExcluding = function(todo)
{
	if(this.selectedTodo){
		this.selectedTodo.saveAndDeselect();
		this.selectedTodo = todo;
		return;
	}
	this.selectedTodo = todo;
	document.getElementById("todo-delete").setAttribute("class", "");
	document.getElementById("todo-info").setAttribute("class", "");
}

Todos.prototype.tabElement = function()
{
	return document.getElementById("tab-todo");	
}

Todos.prototype.deselectTab = function()
{
	document.getElementById("tab-button-todo").setAttribute("class", "tab tab-todos tab-unselected");
}

Todos.prototype.selectTab = function()
{
	document.getElementById("tab-button-todo").setAttribute("class", "tab tab-todos tab-selected");
}

Todos.prototype.onHide = function()
{
	for(x=0;x<this.displayOrder.length;x++){
		if(this.currentItems[this.displayOrder[x]] && this.currentItems[this.displayOrder[x]].isSelected && this.currentItems[this.displayOrder[x]].isEditing)
			this.currentItems[this.displayOrder[x]].save();
	}
}	
	
Todos.prototype.resize = function()
{
	var newHeight = this.realHeight;
	

	document.getElementById("todo-container").style.height = (newHeight) + "px";
	document.getElementById("todo-item-container").style.height = newHeight + "px";
	document.getElementById("todo-item-scroller-container").style.height = newHeight + "px";
	document.getElementById("todo-item-content").style.height = newHeight + "px";
	
	document.getElementById("tab-todo").style.height = (newHeight) + "px"
	document.getElementById("todo-contents-container").style.height = (newHeight - 23) + "px";
	document.getElementById("todo-scroller-container").style.height = (newHeight - 39) + "px"
	if((this.realHeight - 60) > this.contentHeight)
		document.getElementById("todo-content").style.height = (newHeight - 43) + "px"
	else
		document.getElementById("todo-content").style.height = (this.contentHeight + 20) + "px"

	document.getElementById("todo-scroller").style.height = (newHeight - 43) + "px"


	this.scrollArea.refresh();
	if(this.isSelected == true){
		document.getElementById("tab-container").style.height = (newHeight + 0) + "px"
		document.getElementById("main-background").style.height = (newHeight - 26) + "px"
		document.getElementById("main-base").style.top = (newHeight + 258 - 26) + "px"
		if(!this.intransition)
			resizeFront(newHeight + 258 + 24);
	}
}

Todos.prototype.advancedMenuChange = function(index)
{
	this.displayOrder.length = 0;
	Organized.setTodoSortMode(index);
	var sortOrder = Organized.todoSortOrder();
	for(x=0;x<sortOrder.length;x++){
		this.displayOrder[x] = sortOrder[x];
	}
	p.s(index, "todoSortMode");
	this.animateResize = true;
	this.updateDisplay();
}

Todos.prototype.reSort = function(animate)
{
	this.displayOrder.length = 0;
	var sortOrder = Organized.todoSortOrder();
	for(x=0;x<sortOrder.length;x++){
		this.displayOrder[x] = sortOrder[x];
	}

	this.animateResize = animate;
	this.updateDisplay();
}

Todos.prototype.buildDisplay = function()
{
	Organized.setHidesTodos(p.v("hide completed todos"));
	Organized.setHidesTodosImmediatly(p.v("hide completed todos immediatly"))
    this.scroller = new AppleVerticalScrollbar(document.getElementById("todo-scroller"));
    this.scrollArea = new AppleScrollArea(document.getElementById("todo-scroller-container"));
   	this.scrollArea.addScrollbar(this.scroller);

	if(p.v("todoSortMode") != null){
		Organized.setTodoSortMode(p.v("todoSortMode"));
		if(p.v("todoSortMode") == 1)
			document.getElementById("todo-advanced-menu").selectedIndex = 1;
		else if(p.v("todoSortMode") == 2)
			document.getElementById("todo-advanced-menu").selectedIndex = 2;
		else if(p.v("todoSortMode") == 3)
			document.getElementById("todo-advanced-menu").selectedIndex = 3;
		else if(p.v("todoSortMode") == 4)
			document.getElementById("todo-advanced-menu").selectedIndex = 4;
	}
}

Todos.prototype.todosDidChange = function()
{
	this.fetchTodos();
	this.updateDisplay();
	this.resize();
}

Todos.prototype.todoCompleted = function(todo)
{
	if(p.v("hide completed todos") == "0" || p.v("hide completed todos immediatly") == "0")
		return;
	
	var newItems = new Object();
	var newDisplayOrder = Array();
	var followingItems = Array();
	var found = false;
	
	for(x=0;x<this.displayOrder.length;x++){
		if(this.displayOrder[x] == todo.uid){
			found = true;
			continue;
		}
		if(found){
			item = this.currentItems[this.displayOrder[x]]
			if(item)
				followingItems.push(item);
		}
		
		if(this.currentItems[this.displayOrder[x]]){
			newItems[this.displayOrder[x]] = this.currentItems[this.displayOrder[x]];
			newDisplayOrder.push(this.displayOrder[x]);
		}
	}
		
	this.displayOrder = newDisplayOrder;
	this.currentItems = newItems;

	if(p.useanimation){
		if(this.animator.active)
			this.animator.cancel();

		var scrollOffset = document.getElementById("todo-scroller-container").scrollTop;
		var containerHeight = parseInt(document.getElementById("todo-contents-container").style.height);
		if(isNaN(containerHeight))
			containerHeight = 0;
			
		var containerEnd = scrollOffset + containerHeight;
		
		var animators = Array();
		
		var fakeAnimator = new AnimationObject(todo.container);
		fakeAnimator.setOptions(kAnimateOptionsRemoveFromParent, 10);
		fakeAnimator.pushPhase(kAnimatorResizeHeight, 16, 0, 10, 0, null)
		animators.push(fakeAnimator);

		for(x=0;x<followingItems.length;x++){
			var animate = false;

			var top = parseInt(followingItems[x].container.style.top);
			var bottom = parseInt(followingItems[x].container.style.top) + 15;
			
			var topEnd = top - 15;
			var bottomEnd = bottom - 15;
			
			if(bottom >= scrollOffset && top <= containerEnd)
				animate = true;

			if(bottomEnd >= scrollOffset && topEnd <= containerEnd)
				animate = true;
				
			if(containerHeight == 0)
				animate = true;
			
			if(!animate){
				followingItems[x].container.style.top = (parseInt(followingItems[x].container.style.top) - 15) + "px";
				followingItems[x].container.style.opacity = 1;
				followingItems[x].visible = true;
			} else {
				var fakeAnimator = new AnimationObject(followingItems[x].container);
				fakeAnimator.setOptions(0, 10);
				fakeAnimator.pushPhase(kAnimatorMoveVerticalTop, parseInt(followingItems[x].container.style.top), parseInt(followingItems[x].container.style.top) - 15, 10, 0, null)
				animators.push(fakeAnimator);

				followingItems[x].visible = true;
			}
		}

		this.animator.purge();
		this.animator.purgeCallbacks();
		
		_self = this;
		this.animator.pushCallback(function(){ _self.resize();_self.checkSelected() });
	
		this.animator.pushGroup(animators);
		
		this.animator.prepare(300, 10);
		this.animator.run();
		
		
		this.contentHeight -= 15;
	} else {
		this.checkSelected()
	}
}

Todos.prototype.resetDisplay = function()
{
	while (document.getElementById("todo-content").hasChildNodes())
		document.getElementById("todo-content").removeChild(document.getElementById("todo-content").firstChild);
	

	this.displayOrder.length = 0;
	this.currentItems = new Object();
	
	Organized.setHidesTodos(p.v("hide completed todos"));
	Organized.setHidesTodosImmediatly(p.v("hide completed todos immediatly"))

	this.fetchTodos();
	this.animateResize = false;
	this.updateDisplay();
}	

Todos.prototype.fetchTodos = function()
{
	var newItems = new Object();
	var oldKeys = Array();
	
	for(key in this.currentItems){
		oldKeys.push(key);
	}

	var todos = Organized.allTodos();
	for(x=0;x<todos.length;x++){
		if(p.v("filter todo calendars") == "1" && !p.isCalendarEnabled(todos[x][4]))
			continue;

		if(this.currentItems[todos[x][0]]){
			newItems[todos[x][0]] = this.currentItems[todos[x][0]];
			this.currentItems[todos[x][0]] = null
			for(y=0;y<oldKeys.length;y++){
				if(oldKeys[y] == todos[x][0]){
					oldKeys.splice(y, 1);
					break;
				}
			}
			newItems[todos[x][0]].updateDetails(todos[x]);
		} else {	
			var todo = new Todo(x, todos[x]);
			newItems[todos[x][0]] = todo;
		}
	}
	
	for(x=0;x<oldKeys.length;x++){
		this.currentItems[oldKeys[x]].container.parentNode.removeChild(this.currentItems[oldKeys[x]].container);
	}
		
	this.currentItems = newItems;
	
	this.displayOrder.length = 0;
	var sortOrder = Organized.todoSortOrder();
	for(x=0;x<sortOrder.length;x++){
		this.displayOrder[x] = sortOrder[x];
	}	
	this.animateResize = false;
}

Todos.prototype.updateDisplay = function()
{
	var fadeIn = Array();
	var fadeOut = Array();
	var slideToPosition = Array();
	var visibleElements = 0;		
			
	for(x=0;x<this.displayOrder.length;x++){
		if(this.selectedCalendar == "ALL"){
			var controller = this.currentItems[this.displayOrder[x]];
			if(!controller)
				continue;

			if(controller.visible == true){
				slideToPosition[slideToPosition.length] = controller;
			} else {
				fadeIn[fadeIn.length] = controller;
			}
			controller.position = visibleElements;
			visibleElements++;
		} else {
			var controller = this.currentItems[this.displayOrder[x]];
			if(!controller)
				continue;
			if(controller.calUid == this.selectedCalendar){
				if(controller.visible == true){
					slideToPosition[slideToPosition.length] = controller;
				} else
					fadeIn[fadeIn.length] = controller;
				controller.position = visibleElements;
				visibleElements++;
			} else {
				if(controller.visible == true)
					fadeOut[fadeOut.length] = controller;
			}
		}
	}

	if(this.animateResize && p.useanimation){
		var currentOffset = 0;
		var visibleElements = fadeIn.length + slideToPosition.length;
		
		var scrollOffset = document.getElementById("todo-scroller-container").scrollTop;
		var containerHeight = parseInt(document.getElementById("todo-contents-container").style.height);
		if(isNaN(containerHeight))
			containerHeight = 0;
			
		var containerEnd = scrollOffset + containerHeight;
		
		var animators = Array();
		
		for(x=0;x<fadeIn.length;x++){
			var animate = false;
			
			var top = (fadeIn[x].position * 15);
			var bottom = (fadeIn[x].position * 15) + 15;
			if(bottom >= scrollOffset && top <= containerEnd)
				animate = true;
			if(containerHeight == 0)
				animate = true;
			
			if(!animate){
				fadeIn[x].container.style.top = (fadeIn[x].position * 15) + "px";
				fadeIn[x].container.style.opacity = 1;
				fadeIn[x].container.style.display = "block"
				fadeIn[x].visible = true;
			} else {
				var fakeAnimator = new AnimationObject(fadeIn[x].container);
				fakeAnimator.setOptions(0, 10);
				fakeAnimator.pushPhase(kAnimateOpacity, 0, 1, 10, 0, null)
				animators.push(fakeAnimator);
	
				fadeIn[x].container.style.opacity = 0;
				fadeIn[x].container.style.top = (fadeIn[x].position * 15) + "px";
				fadeIn[x].container.style.display = "block"
				fadeIn[x].visible = true;
			}
		}

		for(x=0;x<slideToPosition.length;x++){
			var animate = false;

			var top = parseInt(slideToPosition[x].container.style.top);
			var bottom = parseInt(slideToPosition[x].container.style.top) + 15;
			
			var topEnd = (slideToPosition[x].position * 15)
			var bottomEnd = (slideToPosition[x].position * 15) + 15;
			
			if(bottom >= scrollOffset && top <= containerEnd)
				animate = true;

			if(bottomEnd >= scrollOffset && topEnd <= containerEnd)
				animate = true;
				
			if(containerHeight == 0)
				animate = true;
				
			if(parseInt(slideToPosition[x].container.style.top) == (slideToPosition[x].position * 15))
				animate = false;
			
			if(!animate){
				slideToPosition[x].container.style.top = (slideToPosition[x].position * 15) + "px";
				slideToPosition[x].container.style.opacity = 1;
				slideToPosition[x].visible = true;
			} else {
				var fakeAnimator = new AnimationObject(slideToPosition[x].container);
				fakeAnimator.setOptions(0, 10);
				fakeAnimator.pushPhase(kAnimatorMoveVerticalTop, parseInt(slideToPosition[x].container.style.top), (slideToPosition[x].position * 15), 10, 0, null)
				animators.push(fakeAnimator);

				slideToPosition[x].visible = true;
			}
		}

		for(x=0;x<fadeOut.length;x++){
			var animate = false;
			
			var top = parseInt(fadeOut[x].container.style.top);
			var bottom = parseInt(fadeOut[x].container.style.top) + 15;
			if(bottom >= scrollOffset && top <= containerEnd)
				animate = true;
			if(containerHeight == 0)
				animate = true;
			
			if(!animate){
				fadeOut[x].container.style.opacity = 0;
				fadeOut[x].container.style.display = "none";
				fadeOut[x].visible = false;
			} else {
				var fakeAnimator = new AnimationObject(fadeOut[x].container);
				fakeAnimator.setOptions(kAnimateOptionsHide, 10);
				fakeAnimator.pushPhase(kAnimateOpacity, 1, 0, 10, 0, null)
				animators.push(fakeAnimator);

				fadeOut[x].visible = false;
			}
		}
		
		if(this.animator.active)
			this.animator.cancel();

		this.animator.purge();
		this.animator.purgeCallbacks();
		
		_self = this;
		this.animator.pushCallback(function(){ _self.resize(); _self.checkSelected() });
	
		this.animator.pushGroup(animators);
		
		this.animator.prepare(300, 10);
		this.animator.run();
		
		
		if((20 + (fadeIn.length * 15) + (slideToPosition.length * 15)) > this.contentHeight){
			this.contentHeight = (fadeIn.length * 15) + (slideToPosition.length * 15);
			this.resize();
		} else
			this.contentHeight = (fadeIn.length * 15) + (slideToPosition.length * 15);
	} else {
		var currentOffset = 0;
		for(x=0;x<fadeIn.length;x++){
			fadeIn[x].container.style.opacity = 1;
			fadeIn[x].container.style.top = (fadeIn[x].position * 15) + "px";
			fadeIn[x].container.style.display = "block"
			fadeIn[x].visible = true;
		}

		for(x=0;x<slideToPosition.length;x++){
			slideToPosition[x].container.style.opacity = 1;
			slideToPosition[x].container.style.top = (slideToPosition[x].position * 15) + "px";
			slideToPosition[x].visible = true;
		}

		for(x=0;x<fadeOut.length;x++){
			fadeOut[x].container.style.display = "none"
			fadeOut[x].visible = false;
		}
		
		this.contentHeight = (fadeIn.length * 15) + (slideToPosition.length * 15);
		this.resize();
	
		this.checkSelected()
	}
}

Todos.prototype.checkSelected = function()
{
	if(this.selectedTodo && this.selectedTodo.container.style.display != "block"){
		this.selectedTodo.saveAndDeselect();
		this.selectedTodo = null;
		document.getElementById("todo-delete").setAttribute("class", "disabled");
		document.getElementById("todo-info").setAttribute("class", "disabled");
	}
}

Todos.prototype.didSelect = function()
{
	this.isSelected = true;
	this.resize();
}

Todos.prototype.willSelect = function()
{
}

Todos.prototype.didUnselect = function()
{
}

Todos.prototype.willUnselect = function()
{
	this.isSelected = false;
}

Todos.prototype.restoreDisplayFromPrefs = function()
{
	this.currentHeight = 200;
	this.indexHeight = 200;
	if(widget.preferenceForKey("todoSectionHeight"))
		this.indexHeight = widget.preferenceForKey("todoSectionHeight")
	
	this.realHeight = this.indexHeight;
	this.fetchTodos();
}	

Todos.prototype.beginResizeDrag = function()
{
	var _self = this;
	document.addEventListener("mousemove", this.doDragHandler, false);	document.addEventListener("mouseup", this.endDragHandler, false);
	this.resizeOrigin = this.indexHeight - (event.y - 215);
			event.stopPropagation();
	event.preventDefault();
}

Todos.prototype.doResizeDrag = function()
{
	event.stopPropagation();
	event.preventDefault();

	y = event.y - this.resizeOrigin;

	this.indexHeight = this.resizeOrigin + (event.y - 215);
	if(this.indexHeight < 167)
		this.indexHeight = 167;

	if(this.indexHeight > 1000)
		this.indexHeight = 1000;

	this.realHeight = this.indexHeight
	this.resize();
}
	
Todos.prototype.endResizeDrag = function()
{
	document.removeEventListener("mousemove", this.doDragHandler, false);	document.removeEventListener("mouseup", this.endDragHandler, false);
	widget.setPreferenceForKey(this.indexHeight, "todoSectionHeight");
}

Todos.prototype.selectDisplayCalendar = function(newCal)
{
	if(newCal == "ALL")
		this.currentItems = Organized.allTodos()
	else
		this.currentItems = Organized.todosForCalendar(newCal)
	this.updateDisplay();
}

Todos.prototype.calculateOffsetWithElement = function(element)
{
	var offset = parseInt(document.getElementById("todo-confirmation-windows").style.height) - parseInt(element.style.height);
	offset = offset / 2;
	if(offset < 0)
		offset = 0;
	element.style.top = offset + "px"
}

Todos.prototype.deleteTodo = function(uid)
{
	this.inDelete = true;
	this.deleteUid = uid;

	if(p.v("disable delete confirmations") == 1){
		this.processDelete();
		return;
	}
	
	this.clearConfirmationWindow();
	
	document.getElementById("todo-confirmation-windows").style.height = parseInt(document.getElementById("todo-contents-container").style.height) + 23 + "px"
	this.calculateOffsetWithElement(document.getElementById("delete-todo-window"));
	
	document.getElementById("todo-confirmation-windows").style.opacity = 1.0
	document.getElementById("todo-confirmation-windows").style.display = "block"
	document.getElementById("delete-todo-window").style.display = "block"
}

Todos.prototype.doDelete = function()
{
	if(p.useanimation){	
		this.startAnimation();
	} else {
		document.getElementById("todo-confirmation-windows").style.display = "none";
	}
	this.processDelete();
}

Todos.prototype.processDelete = function()
{
	this.inDelete = false;
	var found = false;
	var followingItems = Array();
	for(x=0;x<this.displayOrder.length;x++){
		if(found){
			if(this.currentItems[this.displayOrder[x]]){
				var item = {container:this.currentItems[this.displayOrder[x]].container, position:this.currentItems[this.displayOrder[x]].position};
				followingItems[followingItems.length] = item;
			}
		}
		
		if(this.displayOrder[x] == this.deleteUid)
			found = true;
	}

	if(p.useanimation){	
		this.startDeleteAnimation(this.currentItems[this.deleteUid], followingItems);
		Organized.deleteTodo(this.deleteUid)
	} else {
		Organized.deleteTodo(this.deleteUid)
		for(x=0;x<followingItems.length;x++){
			followingItems[x].container.style.top = ((item.position * 15) - 15) + "px";
		}
		this.selectedTodo.saveAndDeselect();
		this.selectedTodo = null;
		document.getElementById("todo-delete").setAttribute("class", "disabled");
		document.getElementById("todo-info").setAttribute("class", "disabled");
		this.fetchTodos();
		this.updateDisplay();
	}	
}

Todos.prototype.cancelDelete = function()
{
	this.inDelete = false;
	this.startAnimation();
}

Todos.prototype.startDeleteAnimation = function(controller, followingItems)
{
	var _self = this;

	var outElement = new AnimationObject(controller.container);
	outElement.setOptions(kAnimateOptionsHide, 12);
	outElement.pushPhase(kAnimateOpacity, 1, 0, 10, 2, null)

	animators = new Array();
	for(x=0;x<followingItems.length;x++){
		var fakeAnimator = new AnimationObject(followingItems[x].container);
		fakeAnimator.setOptions(0, 35);
		fakeAnimator.pushPhase(kAnimatorMoveVerticalTop, followingItems[x].position * 15, (followingItems[x].position * 15) - 15, 3, 12, null)
		animators.push(fakeAnimator);
	}

	this.deleteAnimator.purge();
	this.deleteAnimator.purgeCallbacks();

	this.deleteAnimator.pushGroup(animators);
	this.deleteAnimator.pushAnimator(outElement);
	
	this.deleteAnimator.pushCallback(function(){ _self.deleteAnimationComplete(); });
	
	this.deleteAnimator.prepare(45 * 15, 15);
	this.deleteAnimator.run();
}

Todos.prototype.deleteAnimationComplete = function()
{
	this.fetchTodos();
	this.animateResize = false;
	this.updateDisplay()
	this.resize();
}


Todos.prototype.startAnimation = function()
{
	var fadeOut = new AnimationObject(document.getElementById("todo-confirmation-windows"));
	fadeOut.setOptions(kAnimateOptionsHide, 10);
	fadeOut.pushPhase(kAnimateOpacity, 1, 0, 10, 0, null)

	var fakeAnimator = new AnimationObject(document.getElementById("delete-todo-window"));
	fakeAnimator.setOptions(kAnimateOptionsHide, 10);
	fakeAnimator.pushPhase(0, 0, 0, 1, 9, null)

	this.animator.purge();
	this.animator.purgeCallbacks();

	this.animator.pushAnimator(fadeOut);
	this.animator.pushAnimator(fakeAnimator);
	
	this.animator.prepare(150, 10);
	this.animator.run();
}

Todos.prototype.changeNewTodoCalendar = function(option)
{
	document.getElementById("todo-newtodo-calendar-title").innerHTML = option.text;
}

Todos.prototype.clearConfirmationWindow = function()
{
	document.getElementById("todo-add-new-calendar-window").style.display = "none"
	document.getElementById("delete-todo-window").style.display = "none"
	document.getElementById("add-todo-calendar-selector-window").style.display = "none"
}

Todos.prototype.addCalendar = function()
{
	this.clearConfirmationWindow();
	this.inCalendarAdd = true;
	document.getElementById("todo-new-cal-name").value = "";
	
	document.getElementById("todo-confirmation-windows").style.height = parseInt(document.getElementById("todo-contents-container").style.height) + 23 + "px"
	this.calculateOffsetWithElement(document.getElementById("todo-add-new-calendar-window"));
	
	document.getElementById("todo-confirmation-windows").style.opacity = 1.0
	document.getElementById("todo-confirmation-windows").style.display = "block"
	document.getElementById("todo-add-new-calendar-window").style.display = "block"
}

Todos.prototype.doCalAdd = function()
{
	var title = document.getElementById("todo-new-cal-name").value;

	if(title == null || title.length == 0 || !Organized.canCreateCalendarWithTitle(title)){
		this.doShake();
	} else {
		this.inCalendarAdd = false;
		var status = Organized.addCalendarWithTitle(title);
		if(status != 1){
			this.doShake();
			return;	
		} 
		updateCalendarList();
		if(p.useanimation){	
			this.startAnimation();
		} else {
			document.getElementById("todo-confirmation-windows").style.display = "none";
		}
	}
}

Todos.prototype.doShake = function()
{
	Organized.beep();

	var lastOffset = 21;
	var animators = Array();
	
	for(x=0;x<10;x++){
		var movementsize = 10;
		var wobbles = 12.5;

		offset = Math.sin((x * 0.1) * wobbles) * (1 - (x * 0.1))
		offset = offset * movementsize

		var fakeAnimator = new AnimationObject(document.getElementById("todo-new-cal-name"));
		fakeAnimator.setOptions(0, 1 + x);
		fakeAnimator.pushPhase(kAnimatorMoveHorizontalLeft, lastOffset, 21 + offset, 1, x, null)
		animators.push(fakeAnimator);
		
		lastOffset = 21 + offset;
	}

	if(this.animator.active)
		this.animator.cancel();

	this.animator.purge();
	this.animator.purgeCallbacks();

	this.animator.pushGroup(animators);
	
	this.animator.prepare(150, 10);
	this.animator.run();
}

Todos.prototype.cancelCalAdd = function()
{
	this.inCalendarAdd = false;
	if(p.useanimation){	
		this.startAnimation();
	} else {
		document.getElementById("todo-confirmation-windows").style.display = "none";
	}
}

Todos.prototype.addTodo = function()
{
	this.clearConfirmationWindow();
	this.inAdd = true;
	
	document.getElementById("todo-confirmation-windows").style.height = parseInt(document.getElementById("todo-contents-container").style.height) + 23 + "px"
	this.calculateOffsetWithElement(document.getElementById("add-todo-calendar-selector-window"));
	
	document.getElementById("todo-confirmation-windows").style.opacity = 1.0
	document.getElementById("todo-confirmation-windows").style.display = "block"
	document.getElementById("add-todo-calendar-selector-window").style.display = "block"
}

Todos.prototype.doTodoAdd = function()
{
	this.inAdd = false;
	
	var option = document.getElementById("todo-newtodo-calendars").options[document.getElementById("todo-newtodo-calendars").selectedIndex];

	
	var uid = Organized.addTodoWithCalendar(option.value);
	var todo = new Todo(this.displayOrder.length, Array(uid, 0, "New To Do", "", option.value, "", "", ""));
	this.currentItems[uid] = todo;
	this.displayOrder.push(uid);
	if(p.useanimation){	
		this.startAnimation();
	} else {
		document.getElementById("todo-confirmation-windows").style.display = "none";
	}
	todo.selectTodo();
	
	this.animateResize = false;
	this.reSort(false);

	this.updateDisplay();
	this.resize();

	var offset = parseInt(todo.container.style.top);
	this.scrollArea.verticalScrollTo(offset);
}

Todos.prototype.cancelTodoAdd = function()
{
	this.inAdd = false;
	if(p.useanimation){	
		this.startAnimation();
	} else {
		document.getElementById("todo-confirmation-windows").style.display = "none";
	}
}

Todos.prototype.switchCalendar = function(name, uid)
{
	document.getElementById("todo-calendar-title").innerHTML = name;
	this.selectedCalendar = uid;
	this.animateResize = true;
	this.updateDisplay();
}

Todos.prototype.deleteSelectedTodo = function()
{
	if(this.selectedTodo)
		this.deleteTodo(this.selectedTodo.uid)
}

Todos.prototype.transitionHeightChange = function(size)
{
	this.realHeight = size;
	this.resize();
}

Todos.prototype.selectIndex = function()
{	
	this.viewingtodo = false;

	if(p.useanimation){	
		var slideOut = new AnimationObject(document.getElementById("todo-item-container"));
		slideOut.setOptions(0, 13);
		slideOut.pushPhase(kAnimatorMoveHorizontalLeft, 0, 196, 13, 0, null)

		document.getElementById("todo-container").style.display = "block";
		var slideIn = new AnimationObject(document.getElementById("todo-container"));
		slideIn.setOptions(0, 13);
		slideIn.pushPhase(kAnimatorMoveHorizontalLeft, -196, 0, 13, 0, null)

		var fakeAnimator = new AnimationObject(null);
		fakeAnimator.setOptions(0, 10);
		var _self = this;
		callback = this.animator.callbackWithOptions(kAnimatorCallBackValue, function(size){ _self.transitionHeightChange(size); });
		fakeAnimator.pushPhase(0, this.realHeight, this.indexHeight, 10, 0, callback);
		if(window.outerHeight < (this.indexHeight + 258 + 24))
			window.resizeTo(246, this.indexHeight + 258 + 24);

		this.animator.purge();
		this.animator.purgeCallbacks();

		var _self = this;
		this.animator.pushGroup(Array(slideOut, slideIn, fakeAnimator));
		this.animator.pushCallback(function(){ _self.finishedTransition(); });
		this.animator.prepare(660, 33);
	
		this.intransition = true;
		this.animator.run();
	} else {
		this.realHeight = this.indexHeight;
		document.getElementById("todo-container").style.left = 0 + "px";
		document.getElementById("todo-item-container").style.left = 196 + "px";
		
		
		this.resize();
	}
}

Todos.prototype.viewDetails = function(todo)
{
	if(this.animator.active)
		return;
	if(!this.selectedTodo)
		return;
	
	document.getElementById("todo-item-container").style.display = "block"
	document.getElementById("todo-item-container").style.left = "196px";

	var height = this.updateTodoDetails(this.selectedTodo, true);
	
	document.getElementById("todo-item-content").style.height = (height) + "px"
	document.getElementById("todo-item-container").style.height = (height + 23) + "px"

	if(p.useanimation){	
		var slideOut = new AnimationObject(document.getElementById("todo-container"));
		slideOut.setOptions(0, 10);
		slideOut.pushPhase(kAnimatorMoveHorizontalLeft, 0, -196, 10, 0, null)

		document.getElementById("todo-item-container").style.display = "block";
		var slideIn = new AnimationObject(document.getElementById("todo-item-container"));
		slideIn.setOptions(0, 10);
		slideIn.pushPhase(kAnimatorMoveHorizontalLeft, 196, 0, 10, 0, null)

		var fakeAnimator = new AnimationObject(null);
		fakeAnimator.setOptions(0, 10);
		var _self = this;
		callback = this.animator.callbackWithOptions(kAnimatorCallBackValue, function(size){ _self.transitionHeightChange(size); });
		fakeAnimator.pushPhase(0, this.realHeight, this.selectedTodoHeight, 10, 0, callback)

		this.animator.purge();
		this.animator.purgeCallbacks();
		this.animator.pushGroup(Array(slideOut, slideIn, fakeAnimator));		
		this.animator.pushCallback(function(){ _self.finishedTransition(); });
		this.animator.prepare(200, 10);
		this.intransition = true;

		if(window.outerHeight < (height + 258 + 24))
			window.resizeTo(246, height + 258 + 24);

		this.animator.run();
	} else {
		this.realHeight = height;
		document.getElementById("todo-container").style.left = "-196px";
		document.getElementById("todo-item-container").style.left = 0 + "px";
		this.resize();	
	}
}

Todos.prototype.finishedTransition = function()
{
	this.intransition = false;
	this.resize();
}

Todos.prototype.kpFromNotes = function()
{
	var titleheight = parseInt(document.defaultView.getComputedStyle(document.getElementById("todo-item-notes"),"").getPropertyValue("height"));
	if(titleheight != this.selectTodoNotesHeight){
		var height = this.updateTodoDetails(this.selectedTodo, false);
		this.selectTodoNotesHeight = titleheight;
	
		document.getElementById("todo-item-content").style.height = (height) + "px"
		document.getElementById("todo-item-container").style.height = (height + 23) + "px"
		this.realHeight = this.selectedTodoHeight;
		this.resize();
	}
}

Todos.prototype.kpFromTitle = function()
{
	var titleheight = parseInt(document.defaultView.getComputedStyle(document.getElementById("todo-item-title"),"").getPropertyValue("height"));
	if(titleheight != this.selectTodoTitleHeight){
		this.selectedTodo.name = document.getElementById("todo-item-title").innerText;
		this.selectTodoTitleHeight = titleheight;

		var height = this.updateTodoDetails(this.selectedTodo, false);
		Organized.setTitleForTodo(this.selectedTodo.uid, document.getElementById("todo-item-title").innerText);
		document.getElementById("todo-item-title").focus();
	
		document.getElementById("todo-item-content").style.height = (height) + "px"
		document.getElementById("todo-item-container").style.height = (height + 23) + "px"
		this.realHeight = this.selectedTodoHeight;
		this.resize();
	}
}

Todos.prototype.openURL = function(url){
	if(url.match("mailitem")){
		Organized.openMailitem(url.replace("/", ""));
		widget.openURL("");
		return;
	}
	
	if(!url.match("http"))
		url = "http://" + url;
	widget.openURL(url);
}

Todos.prototype.beginEditingURL = function()
{
	document.getElementById("todo-item-url-label").style.opacity = 0;
	document.getElementById("todo-item-url-editor").style.opacity = 1;
	document.getElementById("todo-item-url-editor").select();
	document.getElementById("todo-url-goto-container").style.display = "none";
}

Todos.prototype.finishedEditingURL = function(){
	if(!this.selectedTodo)
		return;

	var address = document.getElementById("todo-item-url-editor").value;
	if(address.length == 0){
		document.getElementById("todo-item-url-label").innerText = "none";
		this.selectedTodo.address = "";
		document.getElementById("todo-goto-url").setAttribute("onclick", "");
		document.getElementById("todo-goto-url").style.display = "none";
		document.getElementById("todo-item-url-label").setAttribute("class", "ellipsis todo-item-label-placeholder");
		Organized.setURLForTodo(this.selectedTodo.uid, "");
	} else {
		this.selectedTodo.address = address;
		var displayAddress = address;
		displayAddress = displayAddress.replace("http://", "");
		displayAddress = displayAddress.replace("https://", "");

		document.getElementById("todo-item-url-label").innerText = displayAddress;
		document.getElementById("todo-goto-url").setAttribute("onclick", "event.stopPropagation();event.preventDefault();todoController.openURL('" + address + "')");
		document.getElementById("todo-goto-url").style.display = "block";
		document.getElementById("todo-item-url-label").setAttribute("class", "ellipsis todo-item-label");
		Organized.setURLForTodo(this.selectedTodo.uid, address);
	}
	document.getElementById("todo-item-url-label").style.opacity = 1;
	document.getElementById("todo-item-url-editor").style.opacity = 0;
	document.getElementById("todo-item-url-editor").blur();
	document.getElementById("todo-url-goto-container").style.display = "block";
}

Todos.prototype.finishedEditingTitle = function(){
	if(!this.selectedTodo)
		return;

	var title = document.getElementById("todo-item-title").innerText;
	title = title.replace("\n", "");
	if(title.length == 0){
		document.getElementById("todo-item-title").innerText = this.selectedTodo.nameEditor.value;

		var height = this.updateTodoDetails(this.selectedTodo, false);
	
		document.getElementById("todo-item-content").style.height = (height) + "px"
		document.getElementById("todo-item-container").style.height = (height + 23) + "px"
		this.realHeight = this.selectedTodoHeight;
		this.resize();
	} else {
		this.selectedTodo.nameEditor.value = document.getElementById("todo-item-title").innerText;
		this.selectedTodo.nameItem.innerText = document.getElementById("todo-item-title").innerText
		Organized.setTitleForTodo(this.selectedTodo.uid, title);
	}
}

Todos.prototype.startedEditingNotes = function(){
	document.getElementById("todo-item-notes-placeholder").style.display = "none";
}

Todos.prototype.finishedEditingNotes = function(){
	if(!this.selectedTodo)
		return;

	var title = document.getElementById("todo-item-notes").innerText;
	if(title.length >= 1){
		var titleSub = title.substr(title.length - 2,2)
		if(titleSub == "\n"){
			title = title.substr(0, title.length - 2);
		}
	}
	
	if(title.length == 0){
		Organized.setNotesForTodo(this.selectedTodo.uid, "");
		this.selectedTodo.notes = "";

		var height = this.updateTodoDetails(this.selectedTodo, false);
	
		document.getElementById("todo-item-content").style.height = (height) + "px"
		document.getElementById("todo-item-container").style.height = (height + 23) + "px"
		this.realHeight = this.selectedTodoHeight;
		this.resize();
		if(this.selectedTodo.notes.length > 0){
			document.getElementById("todo-item-notes-placeholder").style.display = "none";
		} else {
			document.getElementById("todo-item-notes-placeholder").style.display = "block";
		}
	} else {
		this.selectedTodo.notes = title;
		Organized.setNotesForTodo(this.selectedTodo.uid, title);
		if(this.selectedTodo.notes.length > 0){
			document.getElementById("todo-item-notes-placeholder").style.display = "none";
		} else {
			document.getElementById("todo-item-notes-placeholder").style.display = "block";
		}
	}
}

Todos.prototype.setCalendar = function(index)
{
	if(!this.selectedTodo)
		return;

	if(document.getElementById("todo-item-calendars").options.length > index){
	
		this.selectedTodo.calUid = document.getElementById("todo-item-calendars").options[index].value;
		Organized.setCalendarForTodo(this.selectedTodo.uid, document.getElementById("todo-item-calendars").options[index].value);
		this.animateResize = false;
		this.updateDisplay();
	}
}

Todos.prototype.setCalendar2 = function(name, uid)
{
	alert("setCalendar2");
	if(!this.selectedTodo)
		return;

	var nodes = document.getElementById("todo-item-calendar-label").childNodes;
	for (i=0;i<nodes.length;i++){
	 	if(nodes[i].nodeType == 3)
	 		document.getElementById("todo-item-calendar-label").removeChild(nodes[i]);
	}
	 document.getElementById("todo-item-calendar-label").innerHTML += name;

	this.selectedTodo.calUid = uid;
	Organized.setCalendarForTodo(this.selectedTodo.uid, uid);
	this.animateResize = false;
	this.updateDisplay();
}

Todos.prototype.setPriority = function(index)
{
	if(!this.selectedTodo)
		return;
		
	if(index == this.selectedTodo.priotity)
		return;
		
	switch (index){
		case 1:
			document.getElementById("todo-item-priority-label").innerText = "Low";
		break;
		case 2:
			document.getElementById("todo-item-priority-label").innerText = "Medium";
		break;
		case 3:
			document.getElementById("todo-item-priority-label").innerText = "High";
		break;
		default:
			document.getElementById("todo-item-priority-label").innerText = "None";
		break;
	}

	this.selectedTodo.changePriority(index, false, true);
}

Todos.prototype.updateTodoDetails = function(todo, updateContent)
{
	var offset = 6;

	if(updateContent)
		document.getElementById("todo-item-title").innerHTML = todo.name;
	this.selectTodoTitleHeight = parseInt(document.defaultView.getComputedStyle(document.getElementById("todo-item-title"),"").getPropertyValue("height"));
	if(!isNaN(this.selectTodoTitleHeight))
		offset += this.selectTodoTitleHeight + 6;
	
	document.getElementById("todo-item-calendar-container").style.top = offset + "px";
	offset += 14;
	
	var nodes = document.getElementById("todo-item-calendar-label").childNodes;
 	for (i=0;i<nodes.length;i++){
  		if(nodes[i].nodeType == 3)
  			document.getElementById("todo-item-calendar-label").removeChild(nodes[i]);
 	}
	
	var cals = Organized.allCalendars();
	for(x=0;x<cals.length;x++){
		if(cals[x][1] == todo.calUid){
			document.getElementById("todo-item-calendar-label").innerHTML += cals[x][0];
			break;
		}
	}

	document.getElementById("todo-item-priority-container").style.top = offset + "px";
	offset += 25;

	document.getElementById("todo-item-url-container").style.top = offset + "px";
	offset += 20;


	var nodes = document.getElementById("todo-item-priority-label").childNodes;
 	for (i=0;i<nodes.length;i++){
  		if(nodes[i].nodeType == 3)
  			document.getElementById("todo-item-priority-label").removeChild(nodes[i]);
 	}

	switch (todo.priority){
		case 1:
			document.getElementById("todo-item-priority-label").innerHTML += "Low";
			document.getElementById("todo-item-priority").selectedIndex = 1;
		break;
		case 2:
			document.getElementById("todo-item-priority-label").innerHTML += "Medium";
			document.getElementById("todo-item-priority").selectedIndex = 2;
		break;
		case 3:
			document.getElementById("todo-item-priority-label").innerHTML += "High";
			document.getElementById("todo-item-priority").selectedIndex = 3;
		break;
		default:
			document.getElementById("todo-item-priority-label").innerHTML += "None";
			document.getElementById("todo-item-priority").selectedIndex = 0;
		break;
	}
	
	var labelwidth = parseInt(document.defaultView.getComputedStyle(document.getElementById("todo-details-priority-label"),"").getPropertyValue("width"));
	var containerwidth = parseInt(document.defaultView.getComputedStyle(document.getElementById("todo-item-priority-label"),"").getPropertyValue("width"));
	document.getElementById("todo-item-priority").style.left = labelwidth + "px";
	document.getElementById("todo-item-priority").style.width = ((containerwidth - labelwidth) + 15) + "px";

	if(todo.address.length > 0 && !todo.address.match("mailitem")){
		var displayAddress = todo.address;
		displayAddress = displayAddress.replace("http://", "");
		displayAddress = displayAddress.replace("https://", "");
		
		document.getElementById("todo-item-url-label").innerText = displayAddress;
		document.getElementById("todo-item-url-label").setAttribute("class", "ellipsis todo-item-label");
		document.getElementById("todo-goto-url").setAttribute("onclick", "event.stopPropagation();event.preventDefault();todoController.openURL('" + todo.address + "')");
		document.getElementById("todo-goto-url").style.display = "block";
		document.getElementById("todo-item-url-editor").value = displayAddress;
	} else {
		document.getElementById("todo-item-url-label").innerText = "none";
		document.getElementById("todo-item-url-label").setAttribute("class", "ellipsis todo-item-label-placeholder");
		document.getElementById("todo-goto-url").setAttribute("onclick", "");
		document.getElementById("todo-goto-url").style.display = "none";
		document.getElementById("todo-item-url-editor").value = "";
	}

	var labelwidth = parseInt(document.defaultView.getComputedStyle(document.getElementById("todo-details-url-label"),"").getPropertyValue("width"));
	document.getElementById("todo-item-url-editor").style.left = labelwidth + "px";
	document.getElementById("todo-item-url-editor").style.width = (185 - labelwidth) + "px";
	document.getElementById("todo-url-goto-container").style.left = labelwidth + 2 + "px";
	document.getElementById("todo-url-goto-container").style.width = (185 - labelwidth) + "px";
	document.getElementById("todo-item-url-label").setAttribute("style", "max-width:" + (170 - labelwidth) + "px");

	document.getElementById("todo-item-notes-container").style.top = offset + "px";
	offset += 20;
	
	if(todo.notes.length > 0){
		if(updateContent){
			document.getElementById("todo-item-notes").innerText = todo.notes;
			document.getElementById("todo-item-notes-placeholder").style.display = "none";
		}
	} else {
		if(updateContent){
			document.getElementById("todo-item-notes").innerText = "";
			document.getElementById("todo-item-notes-placeholder").style.display = "block";
		}
	}

	document.getElementById("todo-item-notes").style.top = offset + "px";
	document.getElementById("todo-item-notes-placeholder").style.top = offset + "px";
	this.selectTodoNotesHeight = parseInt(document.defaultView.getComputedStyle(document.getElementById("todo-item-notes"),"").getPropertyValue("height"));
	if(!isNaN(this.selectTodoNotesHeight))
		offset += this.selectTodoNotesHeight + 6;

	offset += 15; // bottom spacing

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
	
	this.selectedTodoHeight = offset + 23;
	return offset;
}

Todos.prototype.toggleDueDates = function()
{
	for(key in this.currentItems){
		this.currentItems[key].toggleDueDate();	
	}
}

Todos.prototype.showCalendarMenuIndex = function(event)
{	
	var filter = "";
	if(p.v("filter todo calendars") == "1")
		filter = p.hiddenCalendars.join();

	Organized.showCalendarMenuTodoIndex(0, 0, filter, this.selectedCalendar, getLocalizedString("All Calendars"));
}

Todos.prototype.showCalendarMenu = function(event)
{	
	var labelEnd = parseInt(document.defaultView.getComputedStyle(document.getElementById("todo-details-calendar-label"),"").getPropertyValue("width"))
	if(event.layerX < labelEnd)
		return;

	var filter = "";
	if(p.v("filter todo calendars") == "1")
		filter = p.hiddenCalendars.join();

	Organized.showCalendarMenuTodoDetails(0, 0, filter, this.selectedTodo.calUid, getLocalizedString("All Calendars"));
return;
	document.getElementById("todo-calendar-cmenu").style.opacity = 0;
	document.getElementById("todo-calendar-cmenu").style.display = "block";

	var menuOffset = event.y - event.layerY;
	var menuHeight = parseInt(document.defaultView.getComputedStyle(document.getElementById("todo-calendar-cmenu"),"").getPropertyValue("height"));
	var windowHeight = parseInt(window.outerHeight);
	alert(menuOffset);
	alert(menuHeight);
	alert(windowHeight);
	
	if((menuOffset + menuHeight) > (windowHeight - 25))
		menuOffset = windowHeight - menuHeight - 25;
		
	document.getElementById("todo-calendar-cmenu").style.opacity = 1;
	document.getElementById("todo-calendar-cmenu").style.top = menuOffset + "px";	
	document.getElementById("todo-calendar-cmenu").style.left = labelEnd + 15 + "px";	
}