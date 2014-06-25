function CustomMenu() {
	var _self = this;
	this.menuitems = Array();
}

CustomMenu.prototype.removeItems = function()
{
	for(x=0;x<this.menuitems.length;x++){
		document.getElementById("todo-calendar-cmenu-inner").removeChild(this.menuitems[x].container);
	}
	this.menuitems.length = 0;
}

CustomMenu.prototype.addItem = function(item)
{
	this.menuitems.push(item);
}
