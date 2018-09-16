//All coordinates start from 0,0
//0,0 is at the top left corner
//1,0 is one grid square to the right of 0,0
//0,1 is one grid square below 0,0

//How wide a grid square is in pixels
var gridWidth = 32;
//How high a grid square is in pixels
var gridHeight = 32;

//How many pixels to the start of the map from the left
var pixelXOffset = 0;
//How many pixels to the start of the map from the top
var pixelYOffset = 0;

//The X coordinate of the first grid square on the left.
var gridXStart = 126;
//The Y coordinate of the first grid square in the top.
var gridYStart = 0;

//How wide the image the user sees is in pixels
var maxLensWidth = 800;
var lensWidth = 800;
//How high the image the user sees is in pixels
var maxLensHeight = 600;
var lensHeight = 600;


var lensId = 'mapImg';
var debugContainerId = 'debugContainer';

//The location from which the map should be loaded
var imagePath = 'Map.png';

//How wide the loaded image is in pixels
var mapWidth = null;
var currMapWidth = null;
//How high the loaded image is in pixels
var mapHeight = null;
var currMapHeight = null;

//How zoomed out the map currently is
var zoomLevel = 8;
var minZoom = 1;
var maxZoom = 8;

//The current position of the map
var mapX = 0;
var mapXMin = 0;
var mapY = 0;
var mapYMin = 0;

//The position that will be used to display the map
var displayMapX = 0;
var displayMapY = 0;

//The current position of the mouse
var mouseX = 0;
var mouseY = 0;

//The current position of the mouse on the grid
var gridX = gridXStart;
var gridY = gridYStart;

//The position of the last click on the grid
var storedGridX = gridXStart;
var storedGridY = gridYStart;

//Distance between click and mouse
var distanceX = storedGridX - gridX;
var distanceY = storedGridY - gridY;
var manhattanDistance = Math.abs(gridX-storedGridX)+Math.abs(gridY-storedGridY);
var eucledianDistance = Math.sqrt(distanceX*distanceX+distanceY*distanceY);

function setupImg() {
	var tempImg = document.createElement('img');
	tempImg.onload = function() {
		mapWidth = tempImg.width;
		mapHeight = tempImg.height;
		resetDebug();
		showImage();
	}
	tempImg.src=imagePath;
}

function showImage() {
	currMapWidth = mapWidth/zoomLevel;
	currMapHeight = mapHeight/zoomLevel;
	//lensWidth = Math.min(maxLensWidth,currMapWidth);
	//lensHeight = Math.min(maxLensHeight,currMapHeight);
	lensWidth = maxLensWidth;
	lensHeight = maxLensHeight;
	mapXMin = Math.min(0,-(currMapWidth-lensWidth));
	mapYMin = Math.min(0,-(currMapHeight-lensHeight));
	displayMapX = Math.min(0,Math.max(mapX, mapXMin));
	displayMapY = Math.min(0,Math.max(mapY, mapYMin));
	
	var lens = document.getElementById(lensId);
	lens.style.width = lensWidth+'px';
	lens.style.height = lensHeight+'px';
	lens.style.backgroundImage = 'url('+imagePath+')';
	lens.style.backgroundRepeat = 'no-repeat';
	lens.style.backgroundSize = currMapWidth+'px '+currMapHeight+'px';
	lens.style.backgroundPosition = displayMapX+'px '+displayMapY+'px';
	
	lens.addEventListener("mousemove", pointerPos);
	lens.addEventListener("touchmove", pointerPos);
	lens.addEventListener("click", pointerStore);
	
	resetDebug();
}

function zoomIn() {
	if(zoomLevel <= minZoom)
		return;
	var nextMapWidth = mapWidth/(zoomLevel-1);
	var nextMapHeight = mapHeight/(zoomLevel-1);
	mapX = (((mapX-Math.min(currMapWidth,lensWidth)/2)*zoomLevel)/(zoomLevel-1))+(Math.min(nextMapWidth,lensWidth)/2);
	mapY = (((mapY-Math.min(currMapHeight,lensHeight)/2)*zoomLevel)/(zoomLevel-1))+(Math.min(nextMapHeight,lensHeight)/2);
	zoomLevel = Math.max(minZoom, zoomLevel - 1);
	showImage();
}

function zoomOut() {
	if(zoomLevel >= maxZoom)
		return;
	var nextMapWidth = mapWidth/(zoomLevel+1);
	var nextMapHeight = mapHeight/(zoomLevel+1);
	mapX = (((mapX-Math.min(currMapWidth,lensWidth)/2)*zoomLevel)/(zoomLevel+1))+(Math.min(nextMapWidth,lensWidth)/2);
	mapY = (((mapY-Math.min(currMapHeight,lensHeight)/2)*zoomLevel)/(zoomLevel+1))+(Math.min(nextMapHeight,lensHeight)/2);
	zoomLevel = Math.min(maxZoom, zoomLevel + 1);
	showImage();
}

function right() {
	if(mapX <= mapXMin)
		return;
	mapX = mapX-100;
	showImage();
}

function left() {
	if(mapX >= 0)
		return;
	mapX = mapX+100;
	showImage();
}

function up() {
	if(mapY >= 0)
		return;
	mapY = mapY+100;
	showImage();
}

function down() {
	if(mapX <= 0)
		return;
	mapY = mapY-100;
	showImage();
}


function pointerPos(e) {
	e.preventDefault();
	var pos = getCursorPos(e);
	mouseX = pos.x;
	mouseY = pos.y;
	gridX = Math.trunc(gridXStart+(((mouseX-displayMapX) * zoomLevel)-pixelXOffset)/gridWidth);
	gridY = Math.trunc(gridYStart+(((mouseY-displayMapY) * zoomLevel)-pixelYOffset)/gridHeight);
	measureDistance();
	resetDebug();
}

function pointerStore(e) {
	storedGridX = Math.trunc(gridXStart+(((mouseX-displayMapX) * zoomLevel)-pixelXOffset)/gridWidth);
	storedGridY = Math.trunc(gridYStart+(((mouseY-displayMapY) * zoomLevel)-pixelYOffset)/gridHeight);
	measureDistance();
	resetDebug();
}

function measureDistance() {
	distanceX = gridX - storedGridX;
	distanceY = gridY - storedGridY;
	manhattanDistance = Math.abs(distanceX)+Math.abs(distanceY);
	eucledianDistance = Math.sqrt(distanceX*distanceX+distanceY*distanceY);
}

function getCursorPos(e) {
    var a, x = 0, y = 0;
    e = e || window.event;
    /*get the x and y positions of the image:*/
    a = document.getElementById(lensId).getBoundingClientRect();
    /*calculate the cursor's x and y coordinates, relative to the image:*/
    x = e.pageX - a.left;
    y = e.pageY - a.top;
    /*consider any page scrolling:*/
    x = x - window.pageXOffset;
    y = y - window.pageYOffset;
    return {x : x, y : y};
}

function resetDebug() {
	var container = document.getElementById(debugContainerId);
	container.innerHTML = 
		"<b>Current: "+gridX+", "+gridY+"</b> (Current grid position)<br>"
		+"<b>Stored: "+storedGridX+", "+storedGridY+"</b> (Click map to store)<br>"
		+"distanceX: "+distanceX+" (Distance in the horizontal axis)<br>"
		+"distanceY: "+distanceY+" (Distance in the vertical axis)<br>"
		+"manhattanDistance: "+manhattanDistance+" (Distance is the sum of horizontal and vertical distance)<br>"
		+"eucledianDistance: "+eucledianDistance.toFixed(2)+" (Distance is measured normally)<br>"
		+"<br>"
		+"mouseX: "+mouseX+"<br>"
		+"mouseY: "+mouseY+"<br>"
		+"gridWidth: "+gridWidth+"<br>"
		+"gridHeight: "+gridHeight+"<br>"
		+"pixelXOffset: "+pixelXOffset+"<br>"
		+"pixelYOffset: "+pixelYOffset+"<br>"
		+"gridXStart: "+gridXStart+"<br>"
		+"gridYStart: "+gridYStart+"<br>"
		+"lensWidth: "+lensWidth+"<br>"
		+"lensHeight: "+lensHeight+"<br>"
		+"mapWidth: "+mapWidth+"<br>"
		+"mapHeight: "+mapHeight+"<br>"
		+"zoomLevel: "+zoomLevel+"<br>"
		+"currMapWidth: "+currMapWidth+"<br>"
		+"currMapHeight: "+currMapHeight+"<br>"
		+"mapXMin: "+mapXMin+"<br>"
		+"mapYMin: "+mapYMin+"<br>"
		+"mapX: "+mapX+"<br>"
		+"mapY: "+mapY+"<br>"
		+"displayMapX: "+displayMapX+"<br>"
		+"displayMapY: "+displayMapY+"<br>";
}