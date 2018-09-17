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

var moveTypeDiggingId = 'moveTypeDigging';
var moveTypeWalkingId = 'moveTypeWalking';
var moveTypeCarriedId = 'moveTypeCarried';

var clickTypeAddId       = 'clickTypeAdd';
var clickTypeRemOldId    = 'clickTypeRemOld';
var clickTypeRemNewId    = 'clickTypeRemNew';
var clickTypeMovSelId    = 'clickTypeMovSel';
var clickTypeMovDoId     = 'clickTypeMovDo';
var clickTypeAddSelId    = 'clickTypeAddSel';
var clickTypeNopId       = 'clickTypeNop';

//The location from which the map should be loaded
var imagePath = 'Map.png';

//The image that will be drawn on the canvas
var mapImg = null;

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

//Colors and fuel cost. Fuel costs must be unique because they are used to detect point type
var diggingColor = 'red';
var walkingColor = 'limegreen';
var carriedColor = 'cyan';

var diggingCost = 2;
var walkingCost = 1;
var carriedCost = 0;

//The selected path. Stored as [{x: , y: , f: },...] where x is the horizontal grid position, y the vertical and f the fuel cost
var selectedPath = [];

//index of grid point selected for moving
var selForMove = null;

function setupImg() {
	mapImg = document.createElement('img');
	mapImg.onload = function() {
		mapWidth = mapImg.width;
		mapHeight = mapImg.height;
		
		resetDebug();
		
		showImage();
		
		var lens = document.getElementById(lensId);
		lens.addEventListener("mousemove", pointerPos);
		lens.addEventListener("touchmove", touchPos);
		lens.addEventListener("click", pointerStore);
	}
	mapImg.src=imagePath;
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
	lens.width = lensWidth;
	lens.height = lensHeight;
	
	var context = lens.getContext('2d');
	context.clearRect(0, 0, lensWidth, lensHeight);
	context.drawImage(mapImg,displayMapX,displayMapY,currMapWidth,currMapHeight);
	
	drawPath(context);
	
	resetDebug();
}

function colorForCost(cost) {
	if(cost == carriedCost) {
		return carriedColor;
	} else if (cost == walkingCost) {
		return walkingColor;
	} else if (cost == diggingCost) {
		return diggingColor;
	}
}

function drawPath(context) {
	if(selectedPath.length <= 0)
		return;
	
	var i;
	for(i = 0; i < selectedPath.length; ++i) {
		var currPoint = selectedPath[i];
		
		context.fillStyle = colorForCost(currPoint.f);
		
		context.fillRect(gridXToPosX(currPoint.x)-1, gridYToPosY(currPoint.y)-1, 3, 3);
	}
	
	for(i = 1; i < selectedPath.length; ++i) {
		var currPoint = selectedPath[i];
		var prevPoint = selectedPath[i-1];
		
		context.strokeStyle  = colorForCost(currPoint.f);
		
		context.beginPath();
		context.moveTo(gridXToPosX(prevPoint.x), gridYToPosY(prevPoint.y));
		context.lineTo(gridXToPosX(currPoint.x), gridYToPosY(currPoint.y));
		context.stroke();
	}
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
	updatePointer(pos);
}

function touchPos(e) {
	var pos = getCursorPos({pageX: e.touches[0].clientX, pageY: e.touches[0].clientY});
	updatePointer(pos);
}

function posXToGridX(posX) {
	return Math.trunc(gridXStart+(((posX-displayMapX) * zoomLevel)-pixelXOffset)/gridWidth);
}

function gridXToPosX(posX) {
	return ((posX-gridXStart)*gridWidth + pixelXOffset)/zoomLevel + displayMapX + gridWidth/(2*zoomLevel);
}

function posYToGridY(posY) {
	return Math.trunc(gridYStart+(((posY-displayMapY) * zoomLevel)-pixelYOffset)/gridHeight);
}

function gridYToPosY(posY) {
	return ((posY-gridYStart)*gridHeight + pixelYOffset)/zoomLevel + displayMapY + gridHeight/(2*zoomLevel);
}

function updatePointer(pos) {
	mouseX = pos.x;
	mouseY = pos.y;
	gridX = posXToGridX(mouseX);
	gridY = posYToGridY(mouseY);
	measureDistance();
	resetDebug();
}

function pointerStore(e) {
	storedGridX = posXToGridX(mouseX);
	storedGridY = posYToGridY(mouseY);
	measureDistance();
	resetDebug();
	if(document.getElementById(clickTypeAddId).checked) {
		storePath(storedGridX, storedGridY, false);
	}
	else if(document.getElementById(clickTypeRemNewId).checked) {
		removePath(storedGridX, storedGridY, true);
	}
	else if(document.getElementById(clickTypeRemOldId).checked) {
		removePath(storedGridX, storedGridY, false);
	}
	else if(document.getElementById(clickTypeMovSelId).checked) {
		selectPath(storedGridX, storedGridY);
	}
	else if(document.getElementById(clickTypeMovDoId).checked) {
		movePath(storedGridX, storedGridY);
	}
	else if(document.getElementById(clickTypeAddSelId).checked) {
		storePath(storedGridX, storedGridY, true);
	}
	else if(document.getElementById(clickTypeNopId).checked) {
		//Do nothing
	}
}

function storePath(posX, posY, addIndex) {
	var fuelCost = 0;
	if(document.getElementById(moveTypeDiggingId).checked) {
		fuelCost = 2;
	}
	else if(document.getElementById(moveTypeWalkingId).checked) {
		fuelCost = 1;
	}
	else if(document.getElementById(moveTypeCarriedId).checked) {
		fuelCost = 0;
	}
	
	var toAdd = {x: posX, y: posY, f: fuelCost};
	
	if(addIndex && selForMove != null && selForMove < selectedPath.length - 1) {
		selForMove = selForMove + 1;
		selectedPath.splice(selForMove, 0, toAdd);
	} 
	else {
		selForMove = null;
		selectedPath.push(toAdd);
	}
	
	showImage();
}

function getPointIndex(posX, posY, selectNewest) {
	var i;
	for(i = 0; i < selectedPath.length; ++i) {
		var index;
		if(selectNewest) {
			index = selectedPath.length-1-i;
		} 
		else {
			index = i;
		}
		var currPoint = selectedPath[index];
		if(currPoint.x == posX && currPoint.y == posY) {
			return index;
		}
	}
	return null;
}

function removePath(posX, posY, selectNewest) {
	selForMove = null;
	var index = getPointIndex(posX, posY, selectNewest);
	if(index != null) {
		selectedPath.splice(index, 1);
	}
	showImage();
}

function selectPath(posX, posY) {
	selForMove = getPointIndex(posX, posY, true);
	showImage();
}

function movePath(posX, posY) {
	if(selForMove != null && selForMove < selectedPath.length) {
		var currPoint = selectedPath[selForMove];
		currPoint.x = posX;
		currPoint.y = posY;
	}
	showImage();
}

function popPath() {
	selectedPath.pop();
	selForMove = null;
	showImage();
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
	var i;
	var eucledianDistanceTotal = 0;
	var manhattanDistanceTotal = 0;
	var eucledianDistanceDigging = 0;
	var manhattanDistanceDigging = 0;
	var eucledianDistanceWalking = 0;
	var manhattanDistanceWalking = 0;
	var eucledianDistanceCarried = 0;
	var manhattanDistanceCarried = 0;
	var eucledianCostTotal = 0;
	var manhattanCostTotal = 0;
	for(i = 1; i < selectedPath.length; ++i) {
		var prevPoint = selectedPath[i-1];
		var currPoint = selectedPath[i];
		
		distanceX = currPoint.x - prevPoint.x;
		distanceY = currPoint.y - prevPoint.y;
		
		var tempEucledianDistance = Math.sqrt(distanceX*distanceX+distanceY*distanceY);
		var tempManhattanDistance = Math.abs(distanceX)+Math.abs(distanceY);
		
		eucledianDistanceTotal = eucledianDistanceTotal + tempEucledianDistance;
		manhattanDistanceTotal = manhattanDistanceTotal + tempManhattanDistance;
		if(currPoint.f == diggingCost) {
			eucledianDistanceDigging = eucledianDistanceDigging + tempEucledianDistance;
			manhattanDistanceDigging = manhattanDistanceDigging + tempManhattanDistance;
			eucledianCostTotal = eucledianCostTotal + diggingCost * tempEucledianDistance;
			manhattanCostTotal = manhattanCostTotal + diggingCost * tempManhattanDistance;
		}
		else if(currPoint.f == walkingCost) {
			eucledianDistanceWalking = eucledianDistanceWalking + tempEucledianDistance;
			manhattanDistanceWalking = manhattanDistanceWalking + tempManhattanDistance;
			eucledianCostTotal = eucledianCostTotal + walkingCost * tempEucledianDistance;
			manhattanCostTotal = manhattanCostTotal + walkingCost * tempManhattanDistance;
		}
		else if(currPoint.f == carriedCost) {
			eucledianDistanceCarried = eucledianDistanceCarried + tempEucledianDistance;
			manhattanDistanceCarried = manhattanDistanceCarried + tempManhattanDistance;
			eucledianCostTotal = eucledianCostTotal + carriedCost * tempEucledianDistance;
			manhattanCostTotal = manhattanCostTotal + carriedCost * tempManhattanDistance;
		}
	}
	var debugString = 
		"<b>Current: "+gridX+", "+gridY+"</b> (Current grid position)<br>"
		+"<b>Stored: "+storedGridX+", "+storedGridY+"</b> (Click map to store)<br>"
		+"distanceX: "+distanceX+" (Distance in the horizontal axis)<br>"
		+"distanceY: "+distanceY+" (Distance in the vertical axis)<br>"
		+"manhattanDistance: "+manhattanDistance+" (Distance is the sum of horizontal and vertical distance)<br>"
		+"eucledianDistance: "+eucledianDistance.toFixed(2)+" (Distance is measured normally)<br>"
		+"selForMove: "+selForMove+"<br>"
		+"<br>"
		+"eucledianDistanceTotal: "+eucledianDistanceTotal.toFixed(2)+"<br>"
		+"manhattanDistanceTotal: "+manhattanDistanceTotal+"<br>"
		+"<b>eucledianCostTotal:</b> "+eucledianCostTotal.toFixed(2)+"<br>"
		+"<b>manhattanCostTotal:</b> "+manhattanCostTotal+"<br>"
		+"eucledianDistanceDigging: "+eucledianDistanceDigging.toFixed(2)+"<br>"
		+"manhattanDistanceDigging: "+manhattanDistanceDigging+"<br>"
		+"eucledianDistanceWalking: "+eucledianDistanceWalking.toFixed(2)+"<br>"
		+"manhattanDistanceWalking: "+manhattanDistanceWalking+"<br>"
		+"eucledianDistanceCarried: "+eucledianDistanceCarried.toFixed(2)+"<br>"
		+"manhattanDistanceCarried: "+manhattanDistanceCarried+"<br>"
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
		+"displayMapY: "+displayMapY+"<br>"
		+"<br>"
		+"Path (gridX, gridY, fuelCost):<br>";
	for(i = 0; i < selectedPath.length; ++i) {
		var currPoint = selectedPath[i];
		debugString = debugString + i + ": [" + currPoint.x + ", " + currPoint.y + ", " + currPoint.f + "]<br>";
	}
	container.innerHTML = debugString;
}
