window.onload = launch();

/** Length of square's side */
var dimensions = 20;
var playImage = document.getElementById("playImage");
var patternArea = document.getElementById("pattern");
var createImage = document.getElementById("image");
var legendObj = {
	lastNum: 0,
	elements: []
};
var gameReady = 0;

/**
 * Creates and returns HTML `svg` tag with proper viewBox set
 * @param {number} [width=500] width of svg area
 * @param {number} [height=200] height of svg area
 * @returns {SVGSVGElement} `svg` HTML element
 */
function createSVGArea(width = 500, height = 200){
	let svgElem = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svgElem.setAttribute("viewBox", "0 0 " + width + " " + height);
	svgElem.setAttribute("width", width + "px");
	svgElem.setAttribute("height", height + "px");
	return svgElem;
}

/**
 * Add SVG element passed as param to `playImage` and `createImage` divs (also clears them before inserting)
 * @param {SVGSVGElement} svgElem SVG element to be added in both pictures
 */
function addSVGArea(svgElem){
	while(playImage.firstChild){
		playImage.removeChild(playImage.firstChild);
	}
	while(createImage.firstChild){
		createImage.removeChild(createImage.firstChild);
	}
	createImage.appendChild(svgElem);
}

function getDimensions(elem){
	let width, height;
	if(elem.hasAttribute("viewBox")){
		let dim = elem.getAttribute("viewBox").split(" ");
		if(dim.length == 4){
			width = dim[2];
			height = dim[3];
		} else {
			throw new Error("viewBox attribute of svg element has wrong number of properties: " + dim.length);
		}
	} else {
		throw new Error("width or height were not passed to function and viewBox attribute is absent");
	}
	return [width, height];
}

/**
 * Appends squares (size defined in `dimensions` constant) to svgElem
 * @param {SVGSVGElement} svgElem `svg` HTML element returned by `createSVGArea()`
 * @param {number} [width] if ommited will be read from viewBox attribute of `svgElem`
 * @param {number} [height] if ommited will be read from viewBox attribute of `svgElem`
 * @returns `svgElem` with added squares
 */
function appendEmptySquares(svgElem, width, height){
	if(!(width && height)){ // if height OR/AND width were not defined
		let dim = getDimensions(svgElem);
		width = dim[0];
		height = dim[1];
	}
	for(let x = 0; x < width; x += dimensions){
		for(let y = 0; y < height; y += dimensions){
			let newRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
			newRect.setAttribute("x", x);
			newRect.setAttribute("y", y);
			newRect.setAttribute("class", "a");
			newRect.setAttribute("width", dimensions);
			newRect.setAttribute("height", dimensions);
			newRect.setAttribute("fill", "transparent");
			svgElem.appendChild(newRect);
		}
	}
	return svgElem;
}

function resetColour(){
	let filledSquares = createImage.getElementsByClassName("b");
	while(filledSquares.length > 0){
		filledSquares[0].setAttribute("fill", "transparent");
		filledSquares[0].classList.add("a");
		filledSquares[0].classList.remove("b");
	}
	let markedSquares = createImage.querySelectorAll("rect[fill=\"purple\"]");
	for(let a = 0; a < markedSquares.length; a++){
		markedSquares[a].classList.add("a");
		markedSquares[a].classList.remove("b");
		markedSquares[a].setAttribute("fill", "transparent");
		while(markedSquares[a].firstChild){ //remove title elements when clearing
			markedSquares[a].removeChild(markedSquares[a].firstChild);
		}
	}
	legendObj = {
		lastNum: 0,
		elements: []
	};
	let list = document.getElementById("legend");
	while(list.firstChild){
		list.removeChild(list.firstChild);
	}
	preparePattern();
}

function fillPattern(){
	let borders = findBorders(patternArea.firstChild);
	let width = borders[1] - borders[3];
	let height = borders[2] - borders[0];
	let dim = getDimensions(createImage.firstChild);
	let imgWidth = dim[0];
	let imgHeight = dim[1];
	for(let x = 0; x < imgWidth; x += width + dimensions){
		for(let y = 0; y < imgHeight; y += height + dimensions){
			fillSelected([y, x + width, y + height, x]);
		}
	}
}

function getContrastYIQ(hexcolor){
	var r = parseInt(hexcolor.substr(1,2),16);
	var g = parseInt(hexcolor.substr(3,2),16);
	var b = parseInt(hexcolor.substr(5,2),16);
	var yiq = ((r*299)+(g*587)+(b*114))/1000;
	return (yiq >= 128) ? "black" : "white";
}

/**
 * Creates random 6 character long HEX colour value preceeded by `#`
 * @returns {string}  random HEX coulour eg. `#53F76A`
 */
function createColor(){
	var rand = Math.random();
	while(rand < 0.1){
		rand = Math.random();
	}
	return "#" + (rand*0xFFFFFF<<0).toString(16);
}

/**
 * Draws purple squares when user hovers them with mouse
 * @param {MouseEvent} event Event passed by "mouseover"
 */
function draw(event){
	var status = event.target.parentNode.parentNode.getAttribute("data-click-status");
	if(status == "1" && event.target.classList.contains("a"))
		event.target.setAttribute("fill", "purple");
}

/**
 * Find max and min values of purple `<rect>` squares in given element
 * @param {HTMLElement} elem element containing purple squares
 * @returns {string[]} `["top", "right", "bottom", "left"]`
 */
function findBorders(elem){
	var borders = []; // ["top", "right", "bottom", "left"]
	var purpleSquares = elem.querySelectorAll("rect[fill=\"purple\"]");
	if(purpleSquares && purpleSquares.length > 0){
		borders[0] = parseInt(purpleSquares[0].getAttribute("y"));
		borders[1] = parseInt(purpleSquares[0].getAttribute("x"));
		borders[2] = parseInt(purpleSquares[0].getAttribute("y"));
		borders[3] = parseInt(purpleSquares[0].getAttribute("x"));
		for(let a = 1; a < purpleSquares.length; a++){
			if(parseInt(purpleSquares[a].getAttribute("y")) < borders[0]) borders[0] = parseInt(purpleSquares[a].getAttribute("y"));
			if(parseInt(purpleSquares[a].getAttribute("x")) > borders[1]) borders[1] = parseInt(purpleSquares[a].getAttribute("x"));
			if(parseInt(purpleSquares[a].getAttribute("y")) > borders[2]) borders[2] = parseInt(purpleSquares[a].getAttribute("y"));
			if(parseInt(purpleSquares[a].getAttribute("x")) < borders[3]) borders[3] = parseInt(purpleSquares[a].getAttribute("x"));
		}
	}
	return borders;
}

function imageEvent(){
	var borders = findBorders(createImage);
	fillSelected(borders);
}

function fillSelected(borders){
	var colour = createColor();
	var elId = legendObj.lastNum;
	legendObj.elements[elId] = {
		id: elId,
		color: colour
	};
	let modified = 0;
	for(let a = borders[3]; a <= borders[1]; a+=dimensions){
		for(let b = borders[0]; b <= borders[2]; b+=dimensions){
			/** @type {SVGRectElement} */
			let oneSquare = createImage.querySelector("rect[x=\"" + a + "\"][y=\"" + b + "\"");
			let title = document.createElementNS("http://www.w3.org/2000/svg", "title");
			title.appendChild(document.createTextNode(elId));
			if(oneSquare && oneSquare.classList.contains("a")){
				oneSquare.setAttribute("fill", colour);
				oneSquare.setAttribute("title", elId);
				oneSquare.classList.remove("a");
				oneSquare.classList.add("b");
				oneSquare.appendChild(title.cloneNode(true));
				modified++;
			}
		}
	}
	if(modified){
		legendObj.lastNum++;
		gameReady = 1;
	}
}

function preparePattern(){
	while(patternArea.firstChild){
		patternArea.removeChild(patternArea.firstChild);
	}
	let patternSVG = appendEmptySquares(createSVGArea(300, 160), 300, 160);
	patternArea.style.width = "300px";
	patternArea.style.height = "160px";
	patternArea.appendChild(patternSVG);
	patternArea.setAttribute("data-click-status", "0");
}

function createList(){
	let list = document.getElementById("legend");
	let {elements} = legendObj;
	for(let a = 0; a < elements.length; a++){
		let elId = elements[a].id;
		let listElem = document.createElement("li");
		let colour = elements[a].color;
		let span = document.createElement("span");
		span.style = "background-color: " + colour + "; color: " + getContrastYIQ(colour);
		let txt = document.createTextNode("Element nr " + elId);
		span.appendChild(txt);
		listElem.appendChild(span);
		listElem.setAttribute("name", elId);
		list.appendChild(listElem);
	}
}

function prepareGame(){
	if(!gameReady) return true;
	playImage.setAttribute("style", createImage.getAttribute("style"));
	while(playImage.firstChild){
		playImage.removeChild(playImage.firstChild);
	}
	let svgElem = createImage.firstChild;
	playImage.appendChild(svgElem.cloneNode(true));
	gameReady = 0;
	createList();
}

function removeElem(event){
	var elem = event.target;
	let title;
	if(elem instanceof HTMLLIElement)
		title = elem.getAttribute("name");
	else if(elem instanceof SVGRectElement)
		title = elem.getAttribute("title");
	else if(elem instanceof HTMLSpanElement)
		title = elem.parentElement.getAttribute("name");
	else if(elem instanceof SVGSVGElement)
		return false; //clicked on already removed square - just return
	else
		throw new Error("Unknown element clicked: " + event + "\n" + event.target);
	let elements = playImage.querySelectorAll("rect[title=\"" + title + "\"]");
	for(let a = 0; a < elements.length; a++){
		elements[a].remove();
	}
	document.getElementsByName(title)[0].remove();
}

/**
 * Adds SVG elements with "empty" squares to image containers. Should be run on image change
 * @param {number} width width of image
 * @param {number} height height of image
 */
function reset(width, height){
	addSVGArea(appendEmptySquares(createSVGArea(width, height), width, height));
	let list = document.getElementById("legend");
	while(list.firstChild){
		list.removeChild(list.firstChild);
	}
	legendObj = {
		lastNum: 0,
		elements: []
	};
}

function launch(){
	dimensions = 20;
	playImage = document.getElementById("playImage");
	patternArea = document.getElementById("pattern");
	createImage = document.getElementById("image");
	patternArea.addEventListener("mousedown", function(){
		this.setAttribute("data-click-status", "1");
	});
	patternArea.addEventListener("mouseup", function(){
		this.setAttribute("data-click-status", "0");
	});
	patternArea.addEventListener("mouseover", draw);
	createImage.addEventListener("mousedown", function(){
		this.setAttribute("data-click-status", "1");
	});
	createImage.addEventListener("mouseup", function(){
		this.setAttribute("data-click-status", "0");
		imageEvent();
	});
	createImage.addEventListener("mouseover", draw);
	document.getElementById("res").addEventListener("click", resetColour);
	preparePattern();
	document.getElementById("clear").addEventListener("click", preparePattern);
	document.getElementById("wzor").addEventListener("click", fillPattern);
	playImage.addEventListener("dblclick", removeElem);
	document.getElementById("legend").addEventListener("dblclick", removeElem);
}

module.exports.on = reset;
module.exports.startGame = prepareGame;
