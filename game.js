window.onload = launch();

/** Length of square's side */
var dimensions = 20;
var playImage = document.getElementById("playImage");
var patternArea = document.getElementById("pattern");
var createImage = document.getElementById("image");

/**
 * Object containig details of current image and tiles displayed on it.
 * Used to generate a legend (list of tlies left on image) and to save/restore pattern.
 * @type {Legend}
 */
var legendObj = {
	lastNum: 0,
	elements: [],
	dimensions: [],
	filePath: ""
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

/**
 * Returns dimensions of given SVG element using it's viewBox parameter
 * @param {SVGSVGElement} elem SVG element which dimensions will be calculated
 * @returns {number[]} calculated `[width, height]`
 */
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
	return [parseInt(width), parseInt(height)];
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
		while(filledSquares[0] && filledSquares[0].firstChild){ //remove title elements when clearing
			filledSquares[0].removeChild(filledSquares[0].firstChild);
		}
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
	let numbers = createImage.querySelectorAll("text");
	for(let a = 0; a < numbers.length; a++){
		numbers[a].remove();
	}
	legendObj = {
		lastNum: 0,
		elements: [],
		filePath: "",
		dimensions: []
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
	let [imgWidth, imgHeight] = dim;
	for(let x = 0; x < imgWidth; x += width + dimensions){
		for(let y = 0; y < imgHeight; y += height + dimensions){
			fillSelected([y, ((x + width) <= imgWidth) ? (x + width) : imgWidth, ((y + height) <= imgHeight) ? (y + height) : imgHeight, x]);
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

/**
 * Calcultes and returns width and height of `<text>` element's content with applied font and font-size
 * @param {SVGTextElement} textElement Text element (with set font and size) which dimensions will be calculated
 * @returns {number[]} `[width, height]`
 */
function svgTextDimensions(textElement){
	let bbox = textElement.getBBox();
	return [bbox.width, bbox.height];
}

function addElementNumber([top, right, bottom, left], num, color){
	let textElem = document.createElementNS("http://www.w3.org/2000/svg", "text");
	textElem.setAttribute("fill", getContrastYIQ(color));
	textElem.setAttribute("font-size", "30");
	textElem.setAttribute("name", num);
	textElem.appendChild(document.createTextNode(num));
	createImage.firstChild.appendChild(textElem);
	let [tWidth, tHeight] = svgTextDimensions(textElem);
	let imgBottom = getDimensions(createImage.firstChild)[1];
	textElem.setAttribute("x", left + (right - left + dimensions - tWidth) / 2);
	textElem.setAttribute("y", ((top + (bottom - top + dimensions + tHeight / 2) / 2) <= imgBottom) ? (top + (bottom - top + dimensions + tHeight / 2) / 2) : imgBottom);
}

/**
 * Fills empty fields within borders with random colour and adds details about it to `Legend` object
 * @param {number[]} borders borders of a rectangle that will be drawn `[top, right, bottom, left]`
 * @param {string} [colour] HEX colour of rectangle which will be created (random, unless specified)
 * @param {number} [elId] rectangle's ID (number). Unless specified, it will be `legendObj.lastNum`.
 */
function fillSelected(borders, colour, elId){
	if(!colour)
		colour = createColor();
	if(!elId)
		elId = legendObj.lastNum;
	legendObj.elements[elId] = {
		id: elId,
		color: colour,
		borders: borders
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
		addElementNumber(borders, elId, colour);
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
	while(list.firstChild){
		list.removeChild(list.firstChild);
	}
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

/**
 * Removes element, it's number and it's legend entry after double click
 * @param {MouseEvent} event Double click mouse event
 */
function removeElem(event){
	var elem = event.target;
	let title;
	if(elem instanceof HTMLLIElement || elem instanceof SVGTextElement)
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
	let otherElems = document.getElementsByName(title);
	for(let a = otherElems.length - 1; a >= 0; a--){
		if(otherElems[a].parentElement.parentElement != createImage)
			otherElems[a].remove();
	}
}

/**
 * Adds SVG elements with "empty" squares to image containers. Should be run on image change
 * @param {number} width width of image
 * @param {number} height height of image
 * @param {string} path path to loaded file
 */
function reset(width, height, path){
	addSVGArea(appendEmptySquares(createSVGArea(width, height), width, height));
	let list = document.getElementById("legend");
	while(list.firstChild){
		list.removeChild(list.firstChild);
	}
	legendObj = {
		lastNum: 0,
		elements: [],
		dimensions: [width, height],
		filePath: path
	};
}

/**
 * Fills
 * @param {Legend} legend `Legend` object read form `.wzp` file
 */
function fillFromFile(legend){
	if(getDimensions(createImage.firstChild)[0] != legend.dimensions[0] || getDimensions(createImage.firstChild)[1] != legend.dimensions[1]){
		alert("Wymiary obrazka i wzoru są niezgodne", "Błąd!");
		throw new Error("Dimensions of SVG element inside `createImage` are different than specified in `.wzp` file");
	}
	for(let n = 0; n < legend.elements.length; n++){
		fillSelected(legend.elements[n].borders, legend.elements[n].color, legend.elements[n].id);
	}
}

/**
 * Adds all necessary event listeners to document
 */
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

function exportLegend(){
	//return JSON.stringify(legendObj);
	return legendObj;
}

module.exports.on = reset;
module.exports.startGame = prepareGame;
module.exports.legend = exportLegend;
module.exports.loadLegend = fillFromFile;

/**
 * @typedef {Object} Tile
 * @property {number} id Element ID - big number displayed on it
 * @property {string} color HEX colour code (`#rrggbb`)
 * @property {number[]} borders array containing tile borders in format `[top, right, bottom, left]`
 */

/**
 * Object storing image details and and tiles properties
 * @typedef {Object} Legend
 * @property {number} lastNum number of elements
 * @property {string} [filePath] path to image (optional)
 * @property {number[]} dimensions contains `[width, height]` of displayed image (not real dimensions of image)
 * @property {Tile[]} elements array of Tile elements to draw on the iimage
 */
