function Todo(position, details) {
	var _self = this;
	
	this.uid = details[0];
	this.calUid = details[4];
	this.visible = false;
	this.position = position;
	this.completed = details[1]
	this.name = details[2];
	this.priority = details[3];
	this.address = details[5];
	this.notes = details[6];
	this.duedate = details[7];
	
	this.isSelected = false;
	this.isEditing = false;

	this.container = document.createElement('div');
	this.container.setAttribute ("class", "todo-item");
	this.container.style.opacity = 0;
	document.getElementById("todo-content").appendChild(this.container);

	this.highlight = document.createElement('div');
	this.highlight.setAttribute ("class", "todo-highlight");
	this.highlight.style.opacity = 0;
	this.container.appendChild(this.highlight);

	this.statusCheckbox = document.createElement('div');
	if(details[1] == 1)
		this.statusCheckbox.setAttribute ("class", "todo-checkbox todo-checkbox-on");
	else
		this.statusCheckbox.setAttribute ("class", "todo-checkbox");
	this.statusCheckbox.onclick = function(){ _self.toggleCompletion(); };
	this.container.appendChild(this.statusCheckbox);
	
	this.nameItem = document.createElement('div');
	this.nameItem.setAttribute ("class", "todo-name ellipsis");
	this.nameItem.innerHTML = details[2]
	this.container.appendChild(this.nameItem);
	var uid = details[0]

	var nameform = document.createElement('form');
	nameform.onsubmit = function(){ _self.isEditing=false;_self.save();_self.nameEditor.blur();_self.nameEditor.style.opacity = 0;_self.nameItem.style.opacity = 1;return false;}
	this.container.appendChild(nameform);

	this.nameEditor = document.createElement('input');
	this.nameEditor.setAttribute("type", "text");
	this.nameEditor.setAttribute ("class", "todo-name-editor");
	this.nameEditor.value = details[2]
	this.nameEditor.onchange = function(){ _self.save();_self.nameEditor.blur();_self.nameEditor.style.opacity = 0;_self.nameItem.style.opacity = 1; };
	this.nameEditor.onclick = function(event) {_self.selectTodo();};
	nameform.appendChild(this.nameEditor);

	this.duedateField = document.createElement('div');
	this.duedateField.setAttribute ("class", "todo-duedate");
	this.duedateField.innerHTML = details[7];
	this.container.appendChild(this.duedateField);
	
	var priorityclass = "";
	if(details[3] == 0)
		priorityclass = " todo-priority-nopriority";

	this.priorityChanger = document.createElement('div');
	switch (details[3]){
		case 1:
			this.priorityChanger.setAttribute ("class", "todo-priority todo-priority-low" + priorityclass);
		break;
		case 2:
			this.priorityChanger.setAttribute ("class", "todo-priority todo-priority-medium" + priorityclass);
		break;
		case 3:
			this.priorityChanger.setAttribute ("class", "todo-priority todo-priority-high" + priorityclass);
		break;
		default:
			this.priorityChanger.setAttribute ("class", "todo-priority todo-priority-none" + priorityclass);
		break;
	}
	
	this.container.appendChild(this.priorityChanger);

	this.priorityChangerSelect = document.createElement('select');
	this.priorityChangerSelect.setAttribute ("class", "todo-priority-select");
	this.priorityChangerSelect.onchange = function(){ _self.changePriority(_self.priorityChangerSelect.selectedIndex, true, false); };
	this.container.appendChild(this.priorityChangerSelect);
	
	this.priorityChangerSelect.options[0] = new Option("None", 1);
	this.priorityChangerSelect.options[1] = new Option("Low", 1);
	this.priorityChangerSelect.options[2] = new Option("Medium", 1);
	this.priorityChangerSelect.options[3] = new Option("High", 1);

	switch (details[3]){
		case 1:
			this.priorityChangerSelect.selectedIndex = 1;
		break;
		case 2:
			this.priorityChangerSelect.selectedIndex = 2;
		break;
		case 3:
			this.priorityChangerSelect.selectedIndex = 3;
		break;
		default:
			this.priorityChangerSelect.selectedIndex = 0;
		break;
	}
	
	if(p.v("show due date in todos") == "1" && details[7].length > 0)
		this.container.setAttribute("class", "todo-item todo-showduedate");
	else
		this.container.setAttribute("class", "todo-item todo-dontshowduedate");
	
	if(details[3] == 0){
		this.duedateField.setAttribute ("class", "todo-duedate todo-duedate-nopriority");
		this.nameEditor.setAttribute ("class", "todo-name-editor todo-name-editor-nopriority");
		this.nameItem.setAttribute ("class", "todo-name todo-name-nopriority ellipsis");
	} else {
		this.duedateField.setAttribute ("class", "todo-duedate");
		this.nameEditor.setAttribute ("class", "todo-name-editor todo-name-editor-priority");
		this.nameItem.setAttribute ("class", "todo-name todo-name-priority ellipsis");
	}

}

Todo.prototype.updateDetails = function (details)
{
	this.calUid = details[4];
	this.completed = details[1]
	this.name = details[2];
	this.priority = details[3];
	this.address = details[5];
	this.notes = details[6];
	this.duedate = details[7];

	if(details[1] == 1)
		this.statusCheckbox.setAttribute ("class", "todo-checkbox todo-checkbox-on");
	else
		this.statusCheckbox.setAttribute ("class", "todo-checkbox");
	this.nameItem.innerHTML = details[2]
	this.nameEditor.value = details[2]
	switch (details[3]){
		case 1:
			this.priorityChanger.setAttribute ("class", "todo-priority todo-priority-low");
		break;
		case 2:
			this.priorityChanger.setAttribute ("class", "todo-priority todo-priority-medium");
		break;
		case 3:
			this.priorityChanger.setAttribute ("class", "todo-priority todo-priority-high");
		break;
		default:
			this.priorityChanger.setAttribute ("class", "todo-priority todo-priority-none");
		break;
	}
}
	
Todo.prototype.toggleCompletion = function ()
{
	if(this.completed == 0)
		this.completed = 1;
	else
		this.completed = 0;
		
	if(this.completed == 1){
		Organized.markToDoAsCompleted(this.uid);
		todoController.todoCompleted(this);
	} else
		Organized.markToDoAsUncompleted(this.uid);
	
	if(this.completed == 1)
		this.statusCheckbox.setAttribute ("class", "todo-checkbox todo-checkbox-on");
	else
		this.statusCheckbox.setAttribute ("class", "todo-checkbox");
}

Todo.prototype.deleteTodo = function()
{
	todoController.deleteTodo(this.uid);
}

Todo.prototype.changePriority = function(newPriority, animate, updatemenu)
{
	Organized.setPriorityForTodo(this.uid, newPriority);
	switch (newPriority){
		case 1:
			this.priorityChanger.setAttribute ("class", "todo-priority todo-priority-low");
		break;
		case 2:
			this.priorityChanger.setAttribute ("class", "todo-priority todo-priority-medium");
		break;
		case 3:
			this.priorityChanger.setAttribute ("class", "todo-priority todo-priority-high");
		break;
		default:
			this.priorityChanger.setAttribute ("class", "todo-priority todo-priority-none");
		break;
	}
	this.priority = newPriority;
	todoController.reSort(animate);
	
	if(p.v("show due date in todos") == "1" && this.duedate.length > 0)
		this.container.setAttribute("class", "todo-item todo-showduedate");
	else
		this.container.setAttribute("class", "todo-item todo-dontshowduedate");

	if(this.priority == 0){
		this.duedateField.setAttribute ("class", "todo-duedate todo-duedate-nopriority");
		this.nameEditor.setAttribute ("class", "todo-name-editor todo-name-editor-nopriority");
		this.nameItem.setAttribute ("class", "todo-name todo-name-nopriority ellipsis");
	} else {
		this.duedateField.setAttribute ("class", "todo-duedate");
		this.nameEditor.setAttribute ("class", "todo-name-editor todo-name-editor-priority");
		this.nameItem.setAttribute ("class", "todo-name todo-name-priority ellipsis");
	}

	if(updatemenu){
		this.priorityChangerSelect.selectedIndex = newPriority;
	}
}

Todo.prototype.showDelete = function()
{
	this.deleteButton.style.display = "block";	
}

Todo.prototype.hideDelete = function()
{
	this.deleteButton.style.display = "none";	
}

Todo.prototype.saveAndDeselect = function()
{
	this.name = this.nameEditor.value;
	this.isSelected = false;
	this.nameItem.innerHTML = this.nameEditor.value;
	this.nameEditor.style.opacity = 0;
	this.nameItem.style.opacity = 1;
	if(this.isEditing)
		Organized.setTitleForTodo(this.uid, this.nameEditor.value);
	this.nameEditor.blur();
	this.highlight.style.opacity = 0;
	todoController.deselectTodo(this);

	var priorityclass = "";
	if(this.priority == 0)
		priorityclass = " todo-name-nopriority";
	else
		priorityclass = " todo-name-priority";

	this.nameItem.setAttribute ("class", "todo-name ellipsis" + priorityclass);

	this.isEditing = false;
}

Todo.prototype.save = function()
{
	this.name = this.nameEditor.value;
	this.nameItem.innerHTML = this.nameEditor.value;
	Organized.setTitleForTodo(this.uid, this.nameEditor.value);
}

Todo.prototype.selectTodo = function()
{
	if(!this.isSelected){
		todoController.checkSelected();
		this.isSelected = true;
		this.highlight.style.opacity = 1;
		todoController.deselectExcluding(this);

		var priorityclass = "";
		if(this.priority == 0)
			priorityclass = " todo-name-nopriority";
		else
			priorityclass = " todo-name-priority";

		this.nameItem.setAttribute ("class", "todo-name ellipsis selected-text" + priorityclass);
		this.isEditing = false;
		return;
	}
	
	if(this.isEditing)
		return;
		
	this.nameItem.style.opacity = 0;
	this.nameEditor.style.opacity = 1;
	this.nameEditor.select();
	this.isEditing = true;
}

Todo.prototype.toggleDueDate = function()
{
	if(p.v("show due date in todos") == "1" && this.duedate.length > 0)
		this.container.setAttribute("class", "todo-item todo-showduedate");
	else
		this.container.setAttribute("class", "todo-item todo-dontshowduedate");
}