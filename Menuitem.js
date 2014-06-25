function CustomMenuItem(data) {
	var _self = this;
	this.uid = data[1];
	this.container = document.createElement('div');
	this.container.setAttribute("class", "menuitem");
	document.getElementById("todo-calendar-cmenu-inner").appendChild(this.container);

	this.colorbox = document.createElement('div');
	this.colorbox.setAttribute("class", "menuitem-color");
	this.colorbox.style.backgroundColor = "rgba(" + Math.round((data[3][0]) * 255) + ", " + Math.round((data[3][1]) * 255) + ", " + Math.round((data[3][2]) * 255) + ", 1)"
	this.container.appendChild(this.colorbox);

	this.textcontainer = document.createElement('div');
	this.textcontainer.setAttribute("class", "menuitem-text ellipsis");
	this.textcontainer.innerHTML = data[0];
	this.container.appendChild(this.textcontainer);
}

CustomMenuItem.prototype.updateClockModeMenu = function()
{
}
