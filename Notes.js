function Notes() {
	var _self = this;
	this.doDragHandler = function(){ _self.doResizeDrag(); };
	this.endDragHandler = function(){ _self.endResizeDrag(); };

	this.endTextareaDragHandler = function(){ _self.endTextareaDrag(); };
	this.textareaDragHandler = function(){ _self.textareaDrag(); };
	
	this.isSelected = false;
	this.contentHeight = 0;
	this.indexContentHeight = 0;
	this.currentHeight = 100;
	
	this.currentItems = new Object();
	this.displayOrder = new Array();
	
	this.resizeOrigin = 0;
	this.inDelete = false;
	this.inAdd = false;

	this.selectedNote = null;
	
	this.containerheight = 0;
	this.viewingnote = false;
	
	this.currentScrollTop = 0;

	this.animator = new AnimationController();

	this.hasChanges = false;

	this.textcolors = Array("note-item-name-fade-0", "note-item-name-fade-1", "note-item-name-fade-2", "note-item-name-fade-3", "note-item-name-fade-4", "note-item-name-fade-5", "note-item-name-fade-6", "note-item-name-fade-7", "note-item-name-fade-8", "note-item-name-fade-9");
}

Notes.prototype.inConfirmation = function()
{
	if(this.inDelete || this.inAdd)
		return true;
	return false;
}

Notes.prototype.didCopy = function()
{
	if(document.getElementById("note-item-textarea").selectionStart == document.getElementById("note-item-textarea").selectionEnd)
		return;
	
	if(this.animator.active)
		return;
	
	var fadeOut = new AnimationObject(document.getElementById("note-item-title"));
	fadeOut.setOptions(0, 10);
	fadeOut.pushPhase(kAnimateOpacity, 1, 0, 10, 0, null)

	var fadeIn = new AnimationObject(document.getElementById("note-item-title"));
	fadeIn.setOptions(0, 20);
	fadeIn.pushPhase(kAnimateOpacity, 0, 1, 10, 10, null)

	this.animator.purge();
	this.animator.purgeCallbacks();
	this.animator.pushGroup(Array(fadeOut, fadeIn));		
	this.animator.prepare(150, 20);
	this.animator.run();
}

Notes.prototype.respondToKey = function(key)
{
	if(this.inDelete){
		if(key == 27){
			this.cancelDelete();
		}	
		if(key == 3 || key == 13){
			this.doDelete();
		}	
	}
}

Notes.prototype.tabElement = function()
{
	return document.getElementById("tab-notes");	
}

Notes.prototype.deselectTab = function()
{
	document.getElementById("tab-button-notes").setAttribute("class", "tab tab-notes tab-unselected");
}

Notes.prototype.selectTab = function()
{
	document.getElementById("tab-button-notes").setAttribute("class", "tab tab-notes tab-selected");
}

Notes.prototype.prepareToShow = function()
{
	if(this.selectedNote){
		this.contentScrollArea.verticalScrollTo(this.currentScrollTopContent);
	} else {
		this.indexScrollArea.verticalScrollTo(this.currentScrollTopIndex);
	}
}

Notes.prototype.prepareToHide = function()
{
	this.currentScrollTopContent = 0;
	this.currentScrollTopIndex = 0;
	if(this.selectedNote){
		this.currentScrollTopContent = this.contentScrollArea.content.scrollTop;
	} else {
		this.currentScrollTopIndex = this.indexScrollArea.content.scrollTop;
	}
}

Notes.prototype.resize = function()
{
	document.getElementById("tab-notes").style.height = (this.currentHeight) + "px"
	
	// Index
	document.getElementById("note-index-container").style.height = this.currentHeight + "px"
	document.getElementById("note-index-scroller-container").style.height = (this.currentHeight - 30) + "px"
	if((this.currentHeight - 31) > this.indexContentHeight)
		document.getElementById("note-index-content").style.height = (this.currentHeight - 34) + "px"
	else
		document.getElementById("note-index-content").style.height = (this.indexContentHeight - 2) + "px"
	document.getElementById("note-index-scroller").style.height = (this.currentHeight - 43) + "px"
	this.indexScrollArea.refresh();

	// Content
	document.getElementById("note-content-base").style.top = (this.currentHeight - 33) + "px"
	document.getElementById("note-scroller-container").style.height = (this.currentHeight - 40) + "px"
	document.getElementById("note-scroller").style.height = (this.currentHeight - 43) + "px"
	document.getElementById("note-resizer").style.top = (this.currentHeight - 15) + "px"

	if((this.currentHeight - 23) > this.contentHeight){
		document.getElementById("note-item-bg").style.height = (this.currentHeight - 23) + "px"
	} else {
		document.getElementById("note-item-bg").style.height = (this.contentHeight) + "px"
	}

	document.getElementById("note-item-container").style.height = (this.currentHeight) + "px"
	document.getElementById("note-item-textarea").style.height = (this.currentHeight - 55) + "px"
	this.contentScrollArea.refresh();
	
	if(this.isSelected == true){
		document.getElementById("tab-container").style.height = (this.currentHeight) + "px"	
		document.getElementById("main-background").style.height = (this.currentHeight - 26) + "px"
		document.getElementById("main-base").style.top = (this.currentHeight + 258 - 26) + "px"
		resizeFront(this.currentHeight + 258 + 24);
	}
	this.containerheight = this.currentHeight;
}

Notes.prototype.recievedInput = function(area)
{
	this.hasChanges = true;
	this.resizeNoteContent(area)
}

Notes.prototype.resizeNoteContent = function(area)
{
	var newValue = document.getElementById("note-item-textarea").value;
	if(!newValue || newValue.length <= 0)
		newValue = "Untitled Note"

	document.getElementById("note-item-title").innerHTML = newValue.replace(/^\s*|\s*$/g,'').replace("\n", "<br/>");	
	this.currentItems[this.selectedNote.uid].titlefield.innerHTML = newValue.replace(/^\s*|\s*$/g,'').replace("\n", "<br/>");
		
	this.contentHeight = area.scrollHeight + 20;
	this.contentScrollArea.realHeight = area.scrollHeight;
	this.resize();
}

Notes.prototype.buildDisplay = function()
{
    this.indexScroller = new AppleVerticalScrollbar(document.getElementById("note-index-scroller"));
    this.indexScrollArea = new AppleScrollArea(document.getElementById("note-index-scroller-container"));
   	this.indexScrollArea.addScrollbar(this.indexScroller);

    this.contentScroller = new AppleVerticalScrollbar(document.getElementById("note-scroller"));
    this.contentScrollArea = new AppleScrollArea(document.getElementById("note-scroller-container"));
   	this.contentScrollArea.setAdditionalContent(document.getElementById("note-item-textarea"));
   	this.contentScrollArea.setMousewheelContent(document.getElementById("note-item-textarea"));
   	this.contentScrollArea.addScrollbar(this.contentScroller);
}

Notes.prototype.updateDisplay = function()
{
	var notes = Organized.allNotes();
	var _self = this;
	this.displayOrder.length = 0;
	this.currentItems = new Object();
	
	while (document.getElementById("note-index-content").hasChildNodes())
		document.getElementById("note-index-content").removeChild(document.getElementById("note-index-content").firstChild);
	
	for(x=0;x<notes.length;x++){
		var note = new Note(x, notes[x]);
		this.currentItems[note.uid] = note;
		this.displayOrder[this.displayOrder.length] = note.uid;
	}
	
	document.getElementById("note-index-count").innerText = notes.length;
	
	this.indexContentHeight = (x * 20) + 8;
	this.resize();
}

Notes.prototype.didSelect = function()
{
	this.isSelected = true;
	this.resize();
}

Notes.prototype.willSelect = function()
{
}

Notes.prototype.didUnselect = function()
{
}

Notes.prototype.willUnselect = function()
{
	this.isSelected = false;
}

Notes.prototype.restoreDisplayFromPrefs = function()
{
	this.currentHeight = 200;
	if(widget.preferenceForKey("notesSectionHeight"))
		this.currentHeight = widget.preferenceForKey("notesSectionHeight")
	
	this.realHeight = this.currentHeight
	//this.currentItems = Organized.allNotes();
}	


Notes.prototype.addItem = function()
{
	showNewNotesection();
}
	
Notes.prototype.beginResizeDrag = function()
{
	document.addEventListener("mousemove", this.doDragHandler, false);	document.addEventListener("mouseup", this.endDragHandler, false);
	this.resizeOrigin = this.currentHeight - (event.y - 215);
			event.stopPropagation();
	event.preventDefault();
}

Notes.prototype.doResizeDrag = function()
{
	event.stopPropagation();
	event.preventDefault();

	y = event.y - this.resizeOrigin;

	this.currentHeight = this.resizeOrigin + (event.y - 215);
	if(this.currentHeight < 100)
		this.currentHeight = 100;

	if(this.currentHeight > 1000)
		this.currentHeight = 1000;

	this.realHeight = this.currentHeight
	this.resize();
}
	
Notes.prototype.endResizeDrag = function()
{
	document.removeEventListener("mousemove", this.doDragHandler, false);	document.removeEventListener("mouseup", this.endDragHandler, false);
	widget.setPreferenceForKey(this.currentHeight, "notesSectionHeight");
}

Notes.prototype.monitorForTextareaDrag = function(newCal)
{
	if(this.textareatimer != null){
		clearInterval(this.textareatimer);
		this.textareatimer = null
	}
	
	this.textareatimer = setInterval(this.textareaDragHandler, 50);
	document.addEventListener("mouseup", this.endTextareaDragHandler, false);
}
	
Notes.prototype.textareaDrag = function()
{
	document.getElementById("note-scroller-container").scrollTop = document.getElementById("note-item-textarea").scrollTop;
	this.contentScrollArea.verticalScrollTo(document.getElementById("note-scroller-container").scrollTop);
}
	
Notes.prototype.endTextareaDrag = function()
{
	clearInterval(this.textareatimer);
	this.textareatimer = null
	document.removeEventListener("mouseup", this.endTextareaDragHandler, false);
}

Notes.prototype.noteDown = function(note)
{
	for(x=0;x<this.displayOrder.length;x++){
		if(this.currentItems[this.displayOrder[x]].container == note){
			this.currentItems[this.displayOrder[x]].highlightFromDown();
			break;	
		}
	}
}

Notes.prototype.noteUp = function(note)
{
	document.removeEventListener("mouseup", this.endDragHandler, false);
	for(x=0;x<this.displayOrder.length;x++){
		if(this.currentItems[this.displayOrder[x]].container == note){
			this.currentItems[this.displayOrder[x]].unhighlightEvent(false);
			break;	
		}
	}
}

Notes.prototype.selectNote = function(note)
{
	if(this.animator.active)
		return;
	
	if(this.selectedNote != null){
		this.selectedNote.isSelected = false;
		this.selectedNote.unhighlightEvent(false);
	}
	
	this.selectedNote = note;
	note.highlightEvent();

	document.getElementById("note-item-textarea").value = Organized.contentsForNote(note.uid);
	document.getElementById("note-item-textarea").select();
    document.getElementById("note-item-textarea").setSelectionRange(document.getElementById("note-item-textarea").selectionEnd, document.getElementById("note-item-textarea").selectionEnd); 

	document.getElementById("note-item-title").innerHTML = document.getElementById("note-item-textarea").value.replace(/^\s*|\s*$/g,'').replace("\n", "<br/>");
	if(!this.viewingnote){
		document.getElementById("note-item-container").style.display = "block"
		document.getElementById("note-item-container").style.left = "196px";

		if(p.useanimation){	
			var slideOut = new AnimationObject(document.getElementById("note-index-container"));
			slideOut.setOptions(0, 10);
			slideOut.pushPhase(kAnimatorMoveHorizontalLeft, 0, -196, 10, 0, null)

			document.getElementById("note-item-container").style.display = "block";
			var slideIn = new AnimationObject(document.getElementById("note-item-container"));
			slideIn.setOptions(0, 10);
			slideIn.pushPhase(kAnimatorMoveHorizontalLeft, 196, 0, 10, 0, null)
	
			this.animator.purge();
			this.animator.purgeCallbacks();
			this.animator.pushGroup(Array(slideOut, slideIn));		
			this.animator.prepare(225, 10);
			this.animator.run();
		} else {
			document.getElementById("note-index-container").style.left = "-196px";
			document.getElementById("note-item-container").style.left = "0px";	
		}
	}
	this.resizeNoteContent(document.getElementById("note-item-textarea"))
	this.viewingnote = true;
	this.updateNoteNavigation();
}
	
Notes.prototype.selectIndex = function()
{
	if(this.selectedNote)
		this.selectedNote.isSelected = false;
		
	if(p.useanimation){	
		var slideOut = new AnimationObject(document.getElementById("note-item-container"));
		slideOut.setOptions(0, 13);
		slideOut.pushPhase(kAnimatorMoveHorizontalLeft, 0, 196, 13, 0, null)

		document.getElementById("note-index-container").style.display = "block";
		var slideIn = new AnimationObject(document.getElementById("note-index-container"));
		slideIn.setOptions(0, 13);
		slideIn.pushPhase(kAnimatorMoveHorizontalLeft, -196, 0, 13, 0, null)

		this.animator.purge();
		this.animator.purgeCallbacks();

		if(this.selectedNote){
			this.selectedNote.animationObject.purgePhases();
			this.selectedNote.animationObject.pushPhase(kAnimateOpacity, 1, 0, 13, 10, null)
			this.animator.pushAnimator(this.selectedNote.animationObject);		

			var animator = new AnimationObject(this.selectedNote.titlefield);
			animator.setOptions(0, 22);
			callback = this.animator.callbackWithOptions(kAnimatorCallBackStep, function(cell, step){ _self.fadeCellText(cell, step); });
			animator.pushPhase(0, 0, 0, 9, 13, callback)
			this.animator.pushAnimator(animator);

			var animator = new AnimationObject(this.selectedNote.date);
			animator.setOptions(0, 22);
			callback = this.animator.callbackWithOptions(kAnimatorCallBackStep, function(cell, step){ _self.fadeCellTextDate(cell, step); });
			animator.pushPhase(0, 0, 0, 9, 13, callback)
			this.animator.pushAnimator(animator);
		}
		
		var _self = this;
		
		this.animator.pushCallback(function(){ _self.didSelectedIndex(); });
		this.animator.pushGroup(Array(slideOut, slideIn));		
		this.animator.prepare(450, 23);
		this.animator.run();
	} else {
		if(this.selectedNote)
			this.selectedNote.unhighlightEvent(false);
		this.selectedNote = null		
		document.getElementById("note-index-container").style.display = "block";
		document.getElementById("note-index-container").style.left = 0 + "px";
		document.getElementById("note-item-container").style.left = "0px";	
		document.getElementById("note-item-container").style.display = "none";
	}
	this.viewingnote = false;
}

Notes.prototype.didSelectedIndex = function()
{
	if(this.selectedNote)
		this.selectedNote.resetTextColor();
	this.selectedNote = null		
}
	
Notes.prototype.fadeCellText = function(cell, step)
{
	cell.setAttribute("class", "note-item-name ellipsis " + this.textcolors[9 - step]);
}

Notes.prototype.fadeCellTextDate = function(cell, step)
{
	cell.setAttribute("class", "note-item-date " + this.textcolors[9 - step]);
}
	
Notes.prototype.onHide = function()
{
	if(this.selectedNote == null || !this.hasChanges)
		return;
		
	this.hasChanges = false;
	this.saveNote();
}

Notes.prototype.noteDidChange = function()
{
	if(this.selectedNote == null || !this.hasChanges)
		return;
		
	this.hasChanges = false;
	this.saveNote();
}

Notes.prototype.saveNote = function()
{
	if(this.selectedNote == null)
		return;
		
	Organized.setContentsForNote(this.selectedNote.uid, (document.getElementById("note-item-textarea").value));
	this.updateSortorder();
}

Notes.prototype.updateSortorder = function()
{
	var notes = Organized.allNotes();
	
	this.displayOrder.length = 0;
	
	for(x=0;x<notes.length;x++){
		this.displayOrder.push(notes[x][0]);
		this.currentItems[notes[x][0]].container.style.top = (x * 20) + "px";
		this.currentItems[notes[x][0]].setEditTime(notes[x][1]);
	}
	this.indexScrollArea.verticalScrollTo(0);
}

Notes.prototype.dateChange = function()
{
	for(x=0;x<this.displayOrder.length;x++){
		this.currentItems[this.displayOrder[x]].updateDate();
	}
}

Notes.prototype.calculateOffsetWithElement = function(element)
{
	var offset = parseInt(document.getElementById("note-confirmation-windows").style.height) - parseInt(element.style.height);
	offset = offset / 2;
	if(offset < 0)
		offset = 0;
	element.style.top = offset + "px"
}

Notes.prototype.deleteNote = function()
{
	this.inDelete = true;

	if(p.v("disable delete confirmations") == 1){
		this.processDelete();
		this.selectIndex();
		return;
	}

	document.getElementById("note-confirmation-windows").style.height = this.currentHeight + "px"
	this.calculateOffsetWithElement(document.getElementById("delete-note-window"));
	
	document.getElementById("note-confirmation-windows").style.opacity = 1.0
	document.getElementById("note-confirmation-windows").style.display = "block"
	document.getElementById("delete-note-window").style.display = "block"
}

Notes.prototype.processDelete = function()
{
	for(x=0;x<this.displayOrder.length;x++){
		if(this.displayOrder[x] == this.selectedNote.uid){
			this.displayOrder.splice(x, 1);
			break;	
		}
	}

	document.getElementById("note-index-count").innerText = this.displayOrder.length;	
	this.indexContentHeight = (this.displayOrder.length * 20) + 8;
	
	Organized.deleteNote(this.selectedNote.uid);
	this.currentItems[this.selectedNote.uid].container.parentNode.removeChild(this.currentItems[this.selectedNote.uid].container);
	this.currentItems[this.selectedNote.uid] = null;
	this.updateLayout();
	this.selectedNote = null;
}

Notes.prototype.doDelete = function()
{
	this.inDelete = false;
	this.viewingnote = false;
	if(p.useanimation){	
		this.startAnimation(true);
	} else {
		document.getElementById("note-confirmation-windows").style.display = "none";
		document.getElementById("note-index-container").style.left = "0px";
		document.getElementById("note-item-container").style.left = "196px";
	}
	this.processDelete();
}

Notes.prototype.cancelDelete = function()
{
	this.inDelete = false;
	if(p.useanimation){	
		this.startAnimation(false);
	} else {
		document.getElementById("note-confirmation-windows").style.display = "none";
	}
}

Notes.prototype.startAnimation = function(toIndex)
{
	var _self = this;

	var fadeOut = new AnimationObject(document.getElementById("note-confirmation-windows"));
	fadeOut.setOptions(kAnimateOptionsHide, 10);
	fadeOut.pushPhase(kAnimateOpacity, 1, 0, 10, 0, null)

	var fakeAnimator = new AnimationObject(document.getElementById("delete-note-window"));
	fakeAnimator.setOptions(kAnimateOptionsHide, 10);
	fakeAnimator.pushPhase(0, 0, 0, 1, 9, null)

	this.animator.purge();
	this.animator.purgeCallbacks();

	this.animator.pushAnimator(fadeOut);
	this.animator.pushAnimator(fakeAnimator);
	
	if(toIndex)
		this.animator.pushCallback(function(){ _self.selectIndex(); });
	
	this.animator.prepare(150, 10);
	this.animator.run();
}

Notes.prototype.addNote = function()
{
	var newNote = Organized.addNote();
	
	var note = new Note(0, newNote);
	this.currentItems[note.uid] = note;
	this.displayOrder.unshift(note.uid);
	this.updateLayout();
	
	this.selectNote(note);
	document.getElementById("note-item-title").innerHTML = "Untitled Note"
	document.getElementById("note-item-textarea").value = ""
	
	document.getElementById("note-index-count").innerText = this.displayOrder.length;	
	this.indexContentHeight = (this.displayOrder.length * 20) + 8;
	
	this.resize();
}

Notes.prototype.updateLayout = function()
{
	for(x=0;x<this.displayOrder.length;x++){
		this.currentItems[this.displayOrder[x]].container.style.top = (x * 20) + "px";
	}
	this.resize();
}

Notes.prototype.selectPrevious = function()
{
	this.selectedNote.isSelected = false;
	for(x=0;x<this.displayOrder.length;x++){
		if(this.displayOrder[x] == this.selectedNote.uid){
			if(x == 0)
				return;
			this.selectNote(this.currentItems[this.displayOrder[x - 1]]);
			this.revealNote(this.selectedNote);
			return;	
		}	
	}
}

Notes.prototype.selectNext = function()
{
	this.selectedNote.isSelected = false;
	for(x=0;x<this.displayOrder.length;x++){
		if(this.displayOrder[x] == this.selectedNote.uid){
			if(x == this.displayOrder.length - 1)
				return;
			this.selectNote(this.currentItems[this.displayOrder[x + 1]]);
			this.revealNote(this.selectedNote);
			return;	
		}	
	}
}

Notes.prototype.updateNoteNavigation = function()
{
	for(x=0;x<this.displayOrder.length;x++){
		if(this.displayOrder[x] == this.selectedNote.uid){
			if(x == 0){
				this.disableControl("note-item-back");	
			} else {
				this.enableControl("note-item-back");	
			}
			
			if(x == this.displayOrder.length - 1){
				this.disableControl("note-item-forward");	
			} else {
				this.enableControl("note-item-forward");	
			}
			return;	
		}	
	}
}

Notes.prototype.disableControl = function(control)
{
	document.getElementById(control).setAttribute("class", "note-item-control note-item-control-disabled");
}

Notes.prototype.enableControl = function(control)
{
	document.getElementById(control).setAttribute("class", "note-item-control note-item-control-enabled");
}

Notes.prototype.revealNote = function(note)
{
	var notePos = parseInt(note.container.style.top);
	var scrollTop = this.indexScrollArea.content.scrollTop;
	var height = parseInt(this.indexScrollArea.content.style.height);
	
	if(notePos >= scrollTop && (notePos + 20) < (scrollTop + height)){
	} else {
		if((notePos + 20) < (scrollTop + height))
			this.indexScrollArea.verticalScrollTo(notePos);
		else
			this.indexScrollArea.verticalScrollTo(notePos - height + 35);
	}
}