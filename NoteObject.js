function Note(position, details) {
	var _self = this;
	
	this.uid = details[0];
	this.position = position;

	this.container = document.createElement('div');
	this.container.setAttribute ("class", "note-index-item note-item-text");
	document.getElementById("note-index-content").appendChild(this.container);
	this.container.style.top = (position * 20) + "px"
	this.container.onclick = function(){ _self.selectNote(); };
	this.container.setAttribute("onmousedown", "noteController.noteDown(this)");
	this.container.setAttribute("onmouseup", "noteController.noteUp(this)");

	this.highlight = document.createElement('div');
	this.highlight.setAttribute ("class", "note-index-item-highlight");
	this.container.appendChild(this.highlight);

	this.titlefield = document.createElement('div');
	this.titlefield.setAttribute ("class", "note-item-name ellipsis");
	this.titlefield.onclick = function(){ _self.selectNote(); };
	
	var notename = details[2];
	if(notename && notename.length > 0)
		this.titlefield.innerHTML = details[2].replace(/^\s*|\s*$/g,'').replace("\n", "<br/>");
	else
		this.titlefield.innerHTML = "Untitled Note"
	this.container.appendChild(this.titlefield);

	var today = new Date();
	today.setHours(0);
	today.setMinutes(0);
	today.setSeconds(0);

	var tomorrow = new Date();
	tomorrow.setTime(today.getTime() + 86400000);

	var lastweek = new Date();
	lastweek.setTime(today.getTime() - (86400000 * 6));

	this.edittime = new Date();
	this.edittime.setTime(details[1] * 1000);

	this.date = document.createElement('div');
	this.date.setAttribute ("class", "note-item-date");
	this.container.appendChild(this.date);

	if(this.edittime.getTime() >= today.getTime() && this.edittime.getTime() < tomorrow.getTime())
		this.date.innerHTML = "Today"
	else if(this.edittime.getTime() >= lastweek.getTime() && this.edittime.getTime() < today.getTime())
		this.date.innerHTML = Organized.formattedDate(this.edittime.getTime()/1000, "%a");
	else
		this.date.innerHTML = Organized.formattedDate(this.edittime.getTime()/1000, "%b %e");
	
	this.animationObject = new AnimationObject(this.highlight);
	this.animationObject.setOptions(0, 23);
	
	this.isSelected = false;
}

Note.prototype.setEditTime = function(time)
{
	this.edittime = new Date();
	this.edittime.setTime(time * 1000);
	this.updateDate();
}
	
Note.prototype.updateDate = function()
{
	var today = new Date();
	today.setHours(0);
	today.setMinutes(0);
	today.setSeconds(0);

	var tomorrow = new Date();
	tomorrow.setTime(today.getTime() + 86400000);

	var lastweek = new Date();
	lastweek.setTime(today.getTime() - (86400000 * 6));


	if(this.edittime.getTime() >= today.getTime() && this.edittime.getTime() < tomorrow.getTime())
		this.date.innerHTML = "Today"
	else if(this.edittime.getTime() >= lastweek.getTime() && this.edittime.getTime() < today.getTime())
		this.date.innerHTML = Organized.formattedDate(this.edittime.getTime()/1000, "%a");
	else
		this.date.innerHTML = Organized.formattedDate(this.edittime.getTime()/1000, "%b %e");
}

Note.prototype.resetTextColor = function()
{
	this.titlefield.setAttribute ("class", "note-item-name ellipsis");
}

Note.prototype.selectNote = function()
{
	this.isSelected = true;
	noteController.selectNote(this);	
}

Note.prototype.highlightFromDown = function()
{
	var _self = this;
	this.highlight.style.opacity = 1;
	this.titlefield.setAttribute("class", "note-item-name ellipsis event-item-name-fade-9");
	this.date.setAttribute("class", "note-item-date event-item-name-fade-9");
	
	document.addEventListener("mouseup", function(){_self.unhighlightFromDown()}, false);
}

Note.prototype.unhighlightFromDown = function()
{
	if(this.isSelected)
		return;
	var _self = this;
	this.highlight.style.opacity = 0;
	this.titlefield.setAttribute("class", "note-item-name ellipsis");
	this.date.setAttribute("class", "note-item-date");
	document.removeEventListener("mouseup", function(){_self.unhighlightFromDown()}, false);
}

Note.prototype.highlightEvent = function()
{
	this.titlefield.setAttribute("class", "note-item-name ellipsis event-item-name-fade-9");
	this.date.setAttribute("class", "note-item-date event-item-name-fade-9");
	this.highlight.style.opacity = 1;
}

Note.prototype.unhighlightEvent = function(animate)
{
	if(this.isSelected)
		return;
	
	if(animate && p.useanimation){
		if(this.animator.timer != null){
			clearInterval(this.animator.timer)
			this.animator.timer = null;
		}
		this.animator.timer = setInterval(this.animatorAction, 18);
	} else {
		this.highlight.style.opacity = 0;
		this.date.setAttribute("class", "note-item-date");
		this.titlefield.setAttribute("class", "note-item-name ellipsis");
	}
}

Note.prototype.deleteTodo = function()
{
	noteController.deleteNote(this.uid);
}
