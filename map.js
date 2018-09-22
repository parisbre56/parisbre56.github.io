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
var shareStringId = 'shareString';

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
var minZoom = 1/Math.pow(2,3);
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
var euclideanDistance = Math.sqrt(distanceX*distanceX+distanceY*distanceY);

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

//type of terrain at currently selected position
var posColor = null;
var terrainType = 'Not Recognized';

//Information about terrain
var terrains = [
	["#000000","Unknown"],
	["#750c00","Volcanic - Warm"],
	["#e61800","Volcanic - Hot"],
	["#ff4f04","Volcanic - Scorching"],
	["#565656","Cavern"],
	["#202020","Cold Magma Path"],
	["#9deeff","Damp Cavern"],
	["#14c9ff","Moist Cavern"],
	["#006da1","Wet Cavern"],
	["#000bfa","Lake or River"],
	["#b2b2b2","Manufactured Tunnel"],
	["#ffe920","Messenger Path"],
	["#3c37ff","Tombs and Shrines"]
	["#99005d","Cist entombed tunnels"],
	["#31ee00","Fungal"],
	["#b67800","Bacterial"],
	["#fa00a1","Giant Worm tunnel"],
	["#1a2100","Non-Antediluvian Ruins"],
	["#993400","Fault"],
	["#e0a800","Town/Text"]
];

var terrainMap = new Map(terrains);

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
		window.addEventListener('orientationchange', showImage);
		window.addEventListener("resize", showImage);
		
		var loadString = getParameterByName("path");
		console.log("Loading path [loadString="+loadString+"]");
		if(loadString != null && loadString.length > 1) {
			var splitLoadString = loadString.split(",");
			console.log("Loading split path [splitLoadString.length="+splitLoadString.length+", splitLoadString=["+splitLoadString+"]]");
			for(var loadIndex=0; loadIndex < splitLoadString.length; loadIndex++) {
				var toLoad = splitLoadString[loadIndex];
				console.log("Loading [toLoad="+toLoad+"]");
				var splitToLoad = toLoad.split('!');
				storePath(Number(splitToLoad[0]), Number(splitToLoad[1]), false, Number(splitToLoad[2]));
			}
		}
		loadString = getParameterByName("mapX");
		console.log("Loading mapX [loadString="+loadString+"]");
		if(loadString != null && loadString.length > 0 && !isNaN(Number(loadString))) {
			mapX = Number(loadString);
		}
		loadString = getParameterByName("mapY");
		console.log("Loading mapY [loadString="+loadString+"]");
		if(loadString != null && loadString.length > 0 && !isNaN(Number(loadString))) {
			mapY = Number(loadString);
		}
		loadString = getParameterByName("zoomLevel");
		console.log("Loading zoomLevel [loadString="+loadString+"]");
		if(loadString != null && loadString.length > 0 && !isNaN(Number(loadString))) {
			zoomLevel = Number(loadString);
		}
		
		showImage();
	}
	mapImg.src=imagePath;
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
	console.log("getParameterByName [name="+name+", url="+url+"]");
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function showImage() {
	viewport = document.querySelector("meta[name=viewport]");
	if(window.orientation != null) {
		switch (window.orientation) {
			case 90: 
			case -90: //landscape
				viewport.setAttribute('content', 'width=device-height');
				break;
			case 0: //portrait
			default:
				viewport.setAttribute('content', 'width=device-width');
				break;
		}
	}
	
	currMapWidth = mapWidth/zoomLevel;
	currMapHeight = mapHeight/zoomLevel;
	lensWidth = Math.min(window.innerWidth, maxLensWidth);;
	lensHeight = Math.min(window.innerHeight, maxLensHeight);
	mapXMin = Math.min(0,-(currMapWidth-lensWidth));
	mapYMin = Math.min(0,-(currMapHeight-lensHeight));
	displayMapX = Math.min(0,Math.max(mapX, mapXMin));
	displayMapY = Math.min(0,Math.max(mapY, mapYMin));
	
	var lens = document.getElementById(lensId);
	lens.width = lensWidth;
	lens.height = lensWidth;
	
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
	var nextZoomLevel;
	if(zoomLevel <= 1)
		nextZoomLevel = zoomLevel/2;
	else
		nextZoomLevel = zoomLevel - 1;
	var nextMapWidth = mapWidth/nextZoomLevel;
	var nextMapHeight = mapHeight/nextZoomLevel;
	mapX = (((mapX-Math.min(currMapWidth,lensWidth)/2)*zoomLevel)/nextZoomLevel)+(Math.min(nextMapWidth,lensWidth)/2);
	mapY = (((mapY-Math.min(currMapHeight,lensHeight)/2)*zoomLevel)/nextZoomLevel)+(Math.min(nextMapHeight,lensHeight)/2);
	zoomLevel = nextZoomLevel;
	showImage();
}

function zoomOut() {
	if(zoomLevel >= maxZoom)
		return;
	var nextZoomLevel;
	if(zoomLevel < 1)
		nextZoomLevel = zoomLevel * 2;
	else
		nextZoomLevel = zoomLevel + 1;
	var nextMapWidth = mapWidth/nextZoomLevel;
	var nextMapHeight = mapHeight/nextZoomLevel;
	mapX = (((mapX-Math.min(currMapWidth,lensWidth)/2)*zoomLevel)/nextZoomLevel)+(Math.min(nextMapWidth,lensWidth)/2);
	mapY = (((mapY-Math.min(currMapHeight,lensHeight)/2)*zoomLevel)/nextZoomLevel)+(Math.min(nextMapHeight,lensHeight)/2);
	zoomLevel = nextZoomLevel;
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
	if(mapY <= mapYMin)
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
	terrainType = getTerrain(mouseX,mouseY);
	if(terrainType == null)
		terrainType = "Not Recognized";
	resetDebug();
}

function getTerrain(tPosX, tPosY) {
	posColor = getColorAtPos(tPosX, tPosY);
	return terrainMap.get(posColor);
}

function getColorAtPos(tPosX, tPosY) {
	var lens = document.getElementById(lensId);
	var c = lens.getContext('2d');
	var p = c.getImageData(tPosX, tPosY, 1, 1).data; 
    	var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
	return hex;
}

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

function pointerStore(e) {
	storedGridX = posXToGridX(mouseX);
	storedGridY = posYToGridY(mouseY);
	measureDistance();
	resetDebug();
	
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
	
	if(document.getElementById(clickTypeAddId).checked) {
		storePath(storedGridX, storedGridY, false, fuelCost);
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
		storePath(storedGridX, storedGridY, true, fuelCost);
	}
	else if(document.getElementById(clickTypeNopId).checked) {
		//Do nothing
	}
}

function storePath(posX, posY, addIndex, fuelCost) {	
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
	euclideanDistance = Math.sqrt(distanceX*distanceX+distanceY*distanceY);
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
	setElementInner("gridX", gridX);
	setElementInner("gridY", gridY);
	setElementInner("terrainType", terrainType);
	setElementInner("storedGridX", storedGridX);
	setElementInner("storedGridY", storedGridY);
	setElementInner("distanceX", distanceX);
	setElementInner("distanceY", distanceY);
	setElementInner("manhattanDistance", manhattanDistance);
	setElementInner("euclideanDistance", euclideanDistance.toFixed(2));
	setElementInner("selForMove", selForMove == null ? "None" : selForMove);
	
	var i;
	var euclideanDistanceTotal = 0;
	var manhattanDistanceTotal = 0;
	var euclideanDistanceDigging = 0;
	var manhattanDistanceDigging = 0;
	var euclideanDistanceWalking = 0;
	var manhattanDistanceWalking = 0;
	var euclideanDistanceCarried = 0;
	var manhattanDistanceCarried = 0;
	var euclideanCostTotal = 0;
	var manhattanCostTotal = 0;
	for(i = 1; i < selectedPath.length; ++i) {
		var prevPoint = selectedPath[i-1];
		var currPoint = selectedPath[i];
		
		var tempDistanceX = currPoint.x - prevPoint.x;
		var tempDistanceY = currPoint.y - prevPoint.y;
		
		var tempEuclideanDistance = Math.sqrt(tempDistanceX*tempDistanceX + tempDistanceY*tempDistanceY);
		var tempManhattanDistance = Math.abs(tempDistanceX) + Math.abs(tempDistanceY);
		
		euclideanDistanceTotal = euclideanDistanceTotal + tempEuclideanDistance;
		manhattanDistanceTotal = manhattanDistanceTotal + tempManhattanDistance;
		if(currPoint.f == diggingCost) {
			euclideanDistanceDigging = euclideanDistanceDigging + tempEuclideanDistance;
			manhattanDistanceDigging = manhattanDistanceDigging + tempManhattanDistance;
			euclideanCostTotal = euclideanCostTotal + diggingCost * tempEuclideanDistance;
			manhattanCostTotal = manhattanCostTotal + diggingCost * tempManhattanDistance;
		}
		else if(currPoint.f == walkingCost) {
			euclideanDistanceWalking = euclideanDistanceWalking + tempEuclideanDistance;
			manhattanDistanceWalking = manhattanDistanceWalking + tempManhattanDistance;
			euclideanCostTotal = euclideanCostTotal + walkingCost * tempEuclideanDistance;
			manhattanCostTotal = manhattanCostTotal + walkingCost * tempManhattanDistance;
		}
		else if(currPoint.f == carriedCost) {
			euclideanDistanceCarried = euclideanDistanceCarried + tempEuclideanDistance;
			manhattanDistanceCarried = manhattanDistanceCarried + tempManhattanDistance;
			euclideanCostTotal = euclideanCostTotal + carriedCost * tempEuclideanDistance;
			manhattanCostTotal = manhattanCostTotal + carriedCost * tempManhattanDistance;
		}
	}
	
	setElementInner("euclideanDistanceTotal", euclideanDistanceTotal.toFixed(2));
	setElementInner("manhattanDistanceTotal", manhattanDistanceTotal);
	setElementInner("euclideanCostTotal", euclideanCostTotal.toFixed(2));
	setElementInner("manhattanCostTotal", manhattanCostTotal);
	setElementInner("euclideanDistanceDigging", euclideanDistanceDigging.toFixed(2));
	setElementInner("manhattanDistanceDigging", manhattanDistanceDigging);
	setElementInner("euclideanDistanceWalking", euclideanDistanceWalking.toFixed(2));
	setElementInner("manhattanDistanceWalking", manhattanDistanceWalking);
	setElementInner("euclideanDistanceCarried", euclideanDistanceCarried.toFixed(2));
	setElementInner("manhattanDistanceCarried", manhattanDistanceCarried);
	
	var container = document.getElementById(debugContainerId);
	var debugString = 
		"mouseX: "+mouseX+"<br>"
		+"mouseY: "+mouseY+"<br>"
		+"posColor: "+posColor+"<br>"
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
	
	var currUrl = window.location.href.substring(0, window.location.href.length-window.location.search.length);
	console.log("currUrl="+currUrl);
	var currPathString = '';
	if(selectedPath.length > 0) {
		currPathString = currPathString + selectedPath[0].x + "!" + selectedPath[0].y + "!" + selectedPath[0].f;
		for(i = 1; i < selectedPath.length; ++i) {
			var currPoint = selectedPath[i];
			currPathString = currPathString + ", " + currPoint.x + "!" + currPoint.y + "!" + currPoint.f;
		}
	}
	var shareString = currUrl+"?mapX="+mapX+"&mapY="+mapY+"&zoomLevel="+zoomLevel+"&path="+currPathString;
	document.getElementById(shareStringId).innerHTML = shareString;
	document.getElementById(shareStringId).href = shareString;
}

function setElementInner(elementName, elementValue) {
	document.getElementById(elementName).innerHTML = elementValue;
}
