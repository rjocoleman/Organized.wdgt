var timer = null;var mtimer = null;var editable = false;var backside = false;var flipShown = false;var animation = {duration:0, starttime:0, to:0.5, now:0.0, from:0.0, element:null, timer:null};function limit_3 (a, b, c){    return a < b ? b : (a > c ? c : a);}function computeNextFloat (from, to, ease){    return from + (to - from) * ease;}function animate(){	var T;	var ease;	var time = (new Date).getTime();				T = limit_3(time-animation.starttime, 0, animation.duration);		if (T >= animation.duration)	{		clearInterval (animation.timer);		animation.timer = null;		animation.now = animation.to;	}	else	{		ease = 0.5 - (0.5 * Math.cos(Math.PI * T / animation.duration));
		animation.now = computeNextFloat (animation.from, animation.to, ease);	}		animation.element.style.opacity = animation.now;}function showFlip (event){
	if(backside)
		return;		// fade in the flip widget		if (animation.timer != null)		{			clearInterval (animation.timer);			animation.timer  = null;		}				var starttime = (new Date).getTime() - 13; // set it back one frame				animation.duration = 500;		animation.starttime = starttime;		animation.element = document.getElementById ('flip');		animation.timer = setInterval ("animate();", 13);		animation.from = animation.now;		animation.to = 1.0;		animate();	}function hideFlip (event){		// fade out the flip widget		if (animation.timer != null)		{			clearInterval (animation.timer);			animation.timer  = null;		}				var starttime = (new Date).getTime() - 13; // set it back one frame				animation.duration = 500;		animation.starttime = starttime;		animation.element = document.getElementById ('flip');		animation.timer = setInterval ("animate();", 13);		animation.from = animation.now;		animation.to = 0.0;		animate();	}function doneMouseUp(event){	p.animator.cancel();
	p.animator.purge();
	var front = document.getElementById("front");	var back = document.getElementById("behind");
	
	if(window.outerHeight < (tabController.controllerForTab(tabController.selectedTab).realHeight + 258 + 24)){
		window.resizeTo(246, (tabController.controllerForTab(tabController.selectedTab).realHeight + 258 + 24))
	}

	if (window.widget)		widget.prepareForTransition("ToFront");
			front.style.display="block";	back.style.display="none";
	
	if (window.widget)		setTimeout ('widget.performTransition();', 0);
		
	p.active = false;
	tabController.controllerForTab(tabController.selectedTab).resize();
	window.resizeTo(246, (tabController.controllerForTab(tabController.selectedTab).realHeight + 258 + 24))
}
function showbackside(event){
	hideFlip();
	p.active = true;
	p.updateClockModeMenu();
	p.calScrollArea.verticalScrollTo(0);

	if(window.outerHeight < p.backheight)
		window.resizeTo(window.outerWidth, p.backheight);	
	var front = document.getElementById("front");	var back = document.getElementById("behind");
	if (window.widget)		widget.prepareForTransition("ToBack");		front.style.display="none";	back.style.display="block";	if (window.widget)				setTimeout ('widget.performTransition();', 0);	

	window.resizeTo(window.outerWidth, p.backheight);}