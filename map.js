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

var highlightSelectId = 'highlightSelect';
var highlightSpecialValue = 'Special';
var highlightTerrainValue = 'Terrain';
var highlightTypeValue = 'Type';
var highlightPOIValue = 'POI';

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

//poi text at currently selected position
var poiText = '';
var mousePois = [];

//what to highlight
var highlightText = 'None';
var highlightValue = 'Special';
var doHighlight = true;
var highlightIntervalMs = 2000;

//Information about terrain
var terrains = [
	["#000000","Unknown"],
	["#750c00","Volcanic - Warm"],
	["#e61800","Volcanic - Hot"],
	["#ff4f04","Volcanic - Scorching"],
	["#565656","Cavern"],
	["#202020","Cold Magma Path"],
	["#9deeff","Slightly Wet Cavern"],
	["#14c9ff","Wet Cavern"],
	["#006da1","Very Wet Cavern"],
	["#000bfa","Water Source/Lake or River"],
	["#b2b2b2","Manufactured Tunnel"],
	["#ffe920","Messenger Path"],
	["#3c37ff","Tombs and Shrines"],
	["#99005d","Cist entombed tunnels"],
	["#31ee00","Fungal"],
	["#b67800","Bacterial"],
	["#fa00a1","Giant Worm tunnel"],
	["#182000","Non-Antediluvian Ruins"],
	["#993400","Fault"],
	["#e0a800","Town/Text"]
];
var reverseTerrains = [];
for(var tt = 0; tt < terrains; tt++) {
	reverseTerrains.push([terrains[tt][1], terrains[tt][0]]);
}

var terrainMap = new Map(terrains);
var reverseTerrainMap = new Map(reverseTerrains);

//Information about POIs
var poiData = [
	["Amber", {types: ['Molemen','Settlement'], coords: [
		{x:184 , y:4 , width:4 , height:3 , terrains: null}
	]}],
	["Anvil", {types: ['Human','Settlement'], coords: [
		{x:168 , y:7 , width:1 , height:1 , terrains: null},
		{x:169 , y:6 , width:2 , height:1 , terrains: null}
	]}],
	["Bythos", {types: ['Shluck','Settlement'], coords: [
		{x:283, y:55, width: 3, height: 1, terrains: null}
	]}],
	["Chamel", {types: ['Ethral','Settlement','The Eastern Archive'], coords: [
		{x:162 , y:25 , width:2 , height:1 , terrains: null},
		{x:163 , y:26 , width:1 , height:1 , terrains: null}
	]}],
	["Chime", {types: ['Corven','Settlement'], coords: [
		{x:264, y:34, width: 3, height: 1, terrains: null},
		{x:264, y:35, width: 1, height: 1, terrains: null}
	]}],
	["Distance", {types: ['Molemen','Settlement'], coords: [
		{x:242 , y:4 , width:4 , height:3 , terrains: null}
	]}],
	["Dobble", {types: ['Shluck','Settlement'], coords: [
		{x:189, y:17, width: 5, height: 1, terrains: null}
	]}],
	["Eclipse", {types: ['Human','Settlement'], coords: [
		{x:193, y:56, width: 4, height: 1, terrains: null}
	]}],
	["Empyrean", {types: ['Human','Settlement'], coords: [
		{x:209, y:31, width: 6, height: 1, terrains: null}
	]}],
	["Flow Overlook", {types: ['Molemen','Settlement'], coords: [
		{x:277 , y:45 , width:4 , height:3 , terrains: null}
	]}],
	["Galway", {types: ['Corven','Settlement'], coords: [
		{x:204, y:7, width: 2, height: 1, terrains: null},
		{x:205, y:8, width: 1, height: 1, terrains: null},
	]}],
	["Goldshore", {types: ['Corven','Settlement'], coords: [
		{x:288, y:39, width: 3, height: 1, terrains: null},
		{x:289, y:38, width: 1, height: 1, terrains: null}
	]}],
	["Hearth", {types: ['Ethral','Settlement'], coords: [
		{x:286 , y:9 , width:2 , height:1 , terrains: null},
		{x:285 , y:10 , width:3 , height:1 , terrains: null}
	]}],
	["Kirk", {types: ['Corven','Settlement'], coords: [
		{x:179, y:34, width: 3, height: 1, terrains: null}
	]}],
	["Knot", {types: ['Ethral','Settlement'], coords: [
		{x:248, y:37, width: 1, height: 1, terrains: null},
		{x:249, y:36, width: 2, height: 1, terrains: null}
	]}],
	["Liri", {types: ['Ethral','Settlement'], coords: [
		{x:212, y:4, width: 2, height: 1, terrains: null},
		{x:213, y:3, width: 1, height: 1, terrains: null}
	]}],
	["Mason", {types: ['Human','Settlement'], coords: [
		{x:168, y:19, width: 1, height: 1, terrains: null},
		{x:170, y:18, width: 2, height: 1, terrains: null}
	]}],
	["Mistcliff", {types: ['Molemen','Settlement'], coords: [
		{x:168 , y:49 , width:4 , height:3 , terrains: null}
	]}],
	["Quiet Grind", {types: ['Molemen','Settlement'], coords: [
		{x:213 , y:21 , width:4 , height:3 , terrains: null}
	]}],
	["Roar", {types: ['Human','Settlement'], coords: [
		{x:276, y:13, width: 2, height: 1, terrains: null}
	]}],
	["Saltslanding", {types: ['Shluck','Settlement'], coords: [
		{x:235, y:65, width: 2, height: 1, terrains: null},
		{x:233, y:66, width: 3, height: 1, terrains: null},
		{x:236, y:67, width: 3, height: 1, terrains: null}
	]}],
	["Twin Falls", {types: ['Human','Settlement'], coords: [
		{x:236, y:26, width: 1, height: 1, terrains: null},
		{x:237, y:27, width: 2, height: 1, terrains: null},
		{x:242, y:27, width: 1, height: 1, terrains: null}
	]}],
	["Undertow", {types: ['Shluck','Settlement'], coords: [
		{x:182, y:37, width: 2, height: 1, terrains: null}
	]}],
	["Providence River", {types: ['River'], coords: [
		{x:136 , y:1 , width:74 , height:101 , terrains: ['Water Source/Lake or River']},
		{x:167 , y:46 , width:1 , height:7 , terrains: null}
	]}],
	["West Twin River", {types: ['River','Twin Rivers'], coords: [
		{x:220, y:1, width:33, height: 103, terrains: ['Water Source/Lake or River']}
	]}],
	["East Twin River", {types: ['River','Twin Rivers'], coords: [
		{x:258, y:1, width:38, height: 60, terrains: ['Water Source/Lake or River']}
	]}],
	["Faith's Needle", {types: ['Messenger Path and Complex'], coords: [
		{x:199 , y:53 , width:21 , height:25 , terrains: ['Messenger Path','Tombs and Shrines','Cist entombed tunnels']}
	]}],
	["Fathomless Falls", {types: ['Waterfalls'], coords: [
		{x:167 , y:46 , width:1 , height:7 , terrains: null}
	]}],
	["Fire's Blessing", {types: ['Messenger Path and Complex'], coords: [
		{x:255 , y:48 , width:23 , height:34 , terrains: ['Messenger Path','Tombs and Shrines','Cist entombed tunnels']}
	]}],
	["God's Breath Caverns", {types: ['Caverns'], coords: [
		{x:186 , y:32 , width:29 , height:22 , terrains: ['Cavern']}
	]}],
	["Molten Heart", {types: ['Magma Source'], coords: [
		{x:193 , y:89 , width:24 , height:9 , terrains: ['Volcanic - Scorching']}
	]}],
	["Spore Wood", {types: ['Fungal Forests'], coords: [
		{x:177 , y:41 , width:13 , height:13 , terrains: ["Fungal"]}
	]}],
	["Sulfurous Maze", {types: ['Bacterial Cave Complex'], coords: [
		{x:223 , y:1 , width:22 , height:22 , terrains: ["Bacterial","Non-Antediluvian Ruins"]}
	]}],
	["Vortex", {types: ['Caverns'], coords: [
		{x:249 , y:19 , width:16 , height:10 , terrains: ["Slightly Wet Cavern","Wet Cavern","Very Wet Cavern"]},
		{x:261 , y:29 , width:4 , height:3 , terrains: ["Slightly Wet Cavern","Wet Cavern","Very Wet Cavern"]}
	]}],
	["1st Expedition Site", {types: ['Ruins', 'Gemstone People'], coords: [
		{x:162, y:19, width:2, height:2, terrains: null}
	]}],
	["God's Breath Giant Ant Nest", {types: ['Monster Lair', 'Giant Ants'], coords: [
		{x:189, y:32, width:1, height:1, terrains: null}	
	]}]
	["God's Breath Pilgrimage Start Point", {types: ['Pilgrimage Path', 'Trade Depot'], coords: [
		{x:187, y:33, width:1, height:1, terrains: null}	
	]}]
]
var poiMap = new Map(poiData);

//Information about types of POIs
var typeMap = new Map([]);
for(var tt = 0; tt < poiData.length; tt++) {
	var tPoiData = poiData[tt][1];
	var tTypes = tPoiData.types;
	var tCoords = tPoiData.coords;
	for(var typeIndex = 0; typeIndex < tTypes.length; ++typeIndex) {
		var tType = tTypes[typeIndex];
		var tTypeData = typeMap.get(tType);
		if(tTypeData == null) {
			tTypeData = [];
			typeMap.set(tType, tTypeData);
		}
		for(var coordIndex = 0; coordIndex < tCoords.length; ++coordIndex) {
			tTypeData.push(tCoords[coordIndex]);
		}
	}
}
var typesData = Array.from(typeMap.keys());

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
		loadString = getParameterByName("highlightValue");
		console.log("Loading highlightValue [loadString="+loadString+"]");
		if(loadString != null && loadString.length > 0) {
			highlightValue = loadString;
		}
		loadString = getParameterByName("highlightText");
		console.log("Loading highlightText [loadString="+loadString+"]");
		if(loadString != null && loadString.length > 0) {
			highlightText = loadString;
		}
		
		for(var i = 0; i < terrains.length; ++i) {
			var selElement = document.getElementById(highlightTerrainValue);
			var optionElement = document.createElement('option');
			optionElement.text = terrains[i][1];
			optionElement.value = highlightTerrainValue;
			optionElement.label = optionElement.value+": "+optionElement.text;
			selElement.appendChild(optionElement);
		}
		for(var i = 0; i < typesData.length; ++i) {
			var selElement = document.getElementById(highlightTypeValue);
			var optionElement = document.createElement('option');
			optionElement.text = typesData[i];
			optionElement.value = highlightTypeValue;
			optionElement.label = optionElement.value+": "+optionElement.text;
			selElement.appendChild(optionElement);
		}
		for(var i = 0; i < poiData.length; ++i) {
			var selElement = document.getElementById(highlightPOIValue);
			var optionElement = document.createElement('option');
			optionElement.text = poiData[i][0];
			optionElement.value = highlightPOIValue;
			optionElement.label = optionElement.value+": "+optionElement.text;
			selElement.appendChild(optionElement);
		}
		
		setInterval(highlightIntervalFun,highlightIntervalMs);
		
		showImage();
	}
	mapImg.src=imagePath;
}

function highlightIntervalFun() {
	doHighlight = !doHighlight;
	showImage();
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
	lensWidth = Math.min(window.innerWidth, maxLensWidth);
	lensHeight = Math.min(window.innerHeight, maxLensHeight);
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
	
	if(doHighlight)
		highlightImage(lens,highlightText,highlightValue);
	
	drawPath(context);
	
	resetDebug();
}

function highlightImage(lens,selText,selValue) {
	var context = lens.getContext('2d');
	
	if(selText == 'None')
		return;
	
	if(selValue == highlightTerrainValue) {
		var selTerrain = null;
		if(selText != 'Not Recognized')
			selTerrain = selText;
		
		var imageData = context.getImageData(0, 0, lens.width, lens.height);
		var p = imageData.data;
		for(var i=0; i < p.length; i=i+4) {
			var hex = "#" + ("000000" + rgbToHex(p[i], p[i+1], p[i+2])).slice(-6);
			var tempTerrain = terrainMap.get(hex);
			if(selTerrain == tempTerrain) {
				highlightPoint(p,i);
			}
		}
		context.putImageData(imageData,0,0);
	}
	else if(selValue == highlightTypeValue || selValue == highlightPOIValue) {
		var selCoords;
		if(selValue == highlightTypeValue) {
			selCoords = typeMap.get(selText);
		} else {
			selCoords = poiMap.get(selText).coords;
		}
		for(var cIndex = 0; cIndex < selCoords.length ; ++cIndex) {
			var currCoord = selCoords[cIndex];
			
			var translatedX = gridXToPosXLeft(currCoord.x);
			var translatedY = gridYToPosYTop(currCoord.y);
			
			//Do not show if out of bounds
			if(translatedX > lens.width || translatedY > lens.height)
				continue;
			
			var translatedWidth = (currCoord.width*gridWidth)/zoomLevel;
			var translatedHeight = (currCoord.height*gridHeight)/zoomLevel;
			
			//Do not show if out of bounds
			if(translatedX+translatedWidth < 0 || translatedY+translatedHeight < 0)
				continue;
			
			//Limit area to improve performance
			translatedX = Math.max(translatedX,0);
			translatedY = Math.max(translatedY,0);
			translatedWidth = Math.min(translatedX+translatedWidth,lensWidth)-translatedX;
			translatedHeight = Math.min(translatedY+translatedHeight,lensHeight)-translatedY;
			
			var imageData = context.getImageData(translatedX, translatedY, translatedWidth, translatedHeight);
			var p = imageData.data;
			for(var i=0; i < p.length; i=i+4) {
				var hex = "#" + ("000000" + rgbToHex(p[i], p[i+1], p[i+2])).slice(-6);
				var tempTerrain = terrainMap.get(hex);
				if(currCoord.terrains == null || currCoord.terrains.includes(tempTerrain)) {
					highlightPoint(p,i);
				}
			}
			context.putImageData(imageData, translatedX, translatedY);
		}
	}
}

function highlightPoint(p,i) {
	//Set alpha to 254 as an indicator that this has already been highlighted
	if(p[i+3] == 254)
		return;
	p[i+3] = 254;
	
	if(p[i] > 127)
		p[i] = p[i] - 128;
	else
		p[i] = p[i] + 128;
	if(p[i+1] > 127)
		p[i+1] = p[i+1] - 128;
	else
		p[i+1] = p[i+1] + 128;
	if(p[i+2] > 127)
		p[i+2] = p[i+2] - 128;
	else
		p[i+2] = p[i+2] + 128;
}

function undoHighlightPoint(p,i) {
	//Set alpha to 255 as an indicator that this has not been highlighted
	if(p[i+3] != 254)
		return;
	p[i+3] = 255;
	
	if(p[i] > 127)
		p[i] = p[i] - 128;
	else
		p[i] = p[i] + 128;
	if(p[i+1] > 127)
		p[i+1] = p[i+1] - 128;
	else
		p[i+1] = p[i+1] + 128;
	if(p[i+2] > 127)
		p[i+2] = p[i+2] - 128;
	else
		p[i+2] = p[i+2] + 128;
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

function offsetForPos(posIndex) {
	var tSelPoint = selectedPath[posIndex];
	
	var pointsInSameGridPos = 0;
	for(var i = 0; i < posIndex; ++i) {
		var currPoint = selectedPath[i];
		if(currPoint.x == tSelPoint.x && currPoint.y == tSelPoint.y) {
			pointsInSameGridPos = pointsInSameGridPos + 1;
		}
	}
	var selPos = pointsInSameGridPos % 9;
	if(selPos == 0)
		return {x: 0, y: 0};
	if(selPos == 1)
		return {x: -1, y: +1};
	if(selPos == 2)
		return {x: +1, y: -1};
	if(selPos == 3)
		return {x: -1, y: -1};
	if(selPos == 4)
		return {x: +1, y: +1};
	if(selPos == 5)
		return {x: -1, y: 0};
	if(selPos == 6)
		return {x: 0, y: -1};
	if(selPos == 7)
		return {x: +1, y: 0};
	if(selPos == 8)
		return {x: 0, y: +1};
}

function drawPath(context) {
	if(selectedPath.length <= 0)
		return;
	
	var i;
	for(i = 0; i < selectedPath.length; ++i) {
		var currPoint = selectedPath[i];
		
		context.fillStyle = colorForCost(currPoint.f);
		
		var offset = offsetForPos(i);
		context.fillRect(gridXToPosX(currPoint.x)-1+offset.x, gridYToPosY(currPoint.y)-1+offset.y, 3, 3);
	}
	
	for(i = 1; i < selectedPath.length; ++i) {
		var currPoint = selectedPath[i];
		var prevPoint = selectedPath[i-1];
		
		context.strokeStyle  = colorForCost(currPoint.f);
		
		var currOffset = offsetForPos(i);
		var prevOffset = offsetForPos(i-1);
		
		context.beginPath();
		context.moveTo(gridXToPosX(prevPoint.x)+prevOffset.x, gridYToPosY(prevPoint.y)+prevOffset.y);
		context.lineTo(gridXToPosX(currPoint.x)+currOffset.x, gridYToPosY(currPoint.y)+currOffset.y);
		context.stroke();
	}
}

function setHighlight() {
	var selElement = document.getElementById(highlightSelectId);
	var tempHighlightElement = selElement.options[selElement.selectedIndex];
	highlightText = tempHighlightElement.text;
	highlightValue = tempHighlightElement.value;
	showImage();
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
	
	if(mapX-100 >= 0)
		mapX = -100;
	else
		mapX = mapX-100;
	
	showImage();
}

function left() {
	if(mapX >= 0)
		return;
	
	if(mapX+100 <= mapXMin)
		mapX = mapXMin+100;
	else
		mapX = mapX+100;
	
	showImage();
}

function up() {
	if(mapY >= 0)
		return;
	
	if(mapY+100 <= mapYMin)
		mapY = mapYMin+100;
	else
		mapY = mapY+100;
	
	showImage();
}

function down() {
	if(mapY <= mapYMin)
		return;
	
	if(mapY-100 >= 0)
		mapY = -100;
	else
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

function gridXToPosXLeft(posX) {
	return ((posX-gridXStart)*gridWidth + pixelXOffset)/zoomLevel + displayMapX;
}

function gridXToPosXRight(posX) {
	return ((posX-gridXStart)*gridWidth + pixelXOffset)/zoomLevel + displayMapX + gridWidth/zoomLevel;
}

function posYToGridY(posY) {
	return Math.trunc(gridYStart+(((posY-displayMapY) * zoomLevel)-pixelYOffset)/gridHeight);
}

function gridYToPosY(posY) {
	return ((posY-gridYStart)*gridHeight + pixelYOffset)/zoomLevel + displayMapY + gridHeight/(2*zoomLevel);
}

function gridYToPosYTop(posY) {
	return ((posY-gridYStart)*gridHeight + pixelYOffset)/zoomLevel + displayMapY;
}

function gridYToPosYBottom(posY) {
	return ((posY-gridYStart)*gridHeight + pixelYOffset)/zoomLevel + displayMapY + gridHeight/zoomLevel;
}

function updatePointer(pos) {
	mouseX = pos.x;
	mouseY = pos.y;
	gridX = posXToGridX(mouseX);
	gridY = posYToGridY(mouseY);
	measureDistance();
	
	terrainType = getTerrain(mouseX,mouseY);
	
	mousePois = getPOIs(gridX, gridY, terrainType);
	
	if(terrainType == null)
		terrainType = "Not Recognized";
	
	poiText = '';
	for(var i = 0; i < mousePois.length; ++i) {
		var tPoi = mousePois[i];
		var tTypes = tPoi[1].types;
		if(i > 0) {
			poiText = poiText + ", ";
		}
		poiText = poiText+tPoi[0];
		if(tTypes != null && tTypes.length > 0) {
			poiText = poiText + " ("+tTypes[0];
			for(var j = 1; j < tTypes.length; ++j) {
				poiText = poiText + ", " + tTypes[j];
			}
			poiText = poiText + ")";
		}
	}
	resetDebug();
}

function getPOIs(tGridX, tGridY, tTerrainType) {
	var retVal = [];
	for(var i = 0; i < poiData.length; ++i) {
		var tPoi = poiData[i];
		var tCoords = tPoi[1].coords;
		for(var j = 0; j < tCoords.length; ++j) {
			var tCoord = tCoords[j];
			if(tGridX >= tCoord.x 
				&& tGridX < tCoord.x+tCoord.width
				&& tGridY >= tCoord.y
				&& tGridY < tCoord.y+tCoord.height
				&& (tCoord.terrains == null 
					|| (tTerrainType != null 
						&& tCoord.terrains.includes(tTerrainType)))) {
				retVal.push(tPoi);
				break;
			}
		}
	}
	return retVal;
}

function getTerrain(tPosX, tPosY) {
	posColor = getColorAtPos(tPosX, tPosY);
	return terrainMap.get(posColor);
}

function getColorAtPos(tPosX, tPosY) {
	var lens = document.getElementById(lensId);
	var c = lens.getContext('2d');
	var p = c.getImageData(tPosX, tPosY, 1, 1).data; 
	undoHighlightPoint(p,0);
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

function resetPath() {
	selectedPath.length = 0; //Clears the array
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
	setElementInner("poiText", poiText);
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
		+"highlightText: "+highlightText+"<br>"
		+"highlightValue: "+highlightValue+"<br>"
		+"doHighlight: "+doHighlight+"<br>"
		+"mousePois: "+JSON.stringify(mousePois)+"<br>"
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
	var shareString = currUrl
		+"?mapX="+mapX
		+"&mapY="+mapY
		+"&zoomLevel="+zoomLevel
		+"&highlightValue="+highlightValue
		+"&highlightText="+highlightText
		+"&path="+currPathString;
	document.getElementById(shareStringId).innerHTML = shareString;
	document.getElementById(shareStringId).href = shareString;
}

function setElementInner(elementName, elementValue) {
	document.getElementById(elementName).innerHTML = elementValue;
}
