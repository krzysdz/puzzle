// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const remote = require("electron").remote;
const fs = require("fs");
const path = require("path");
const gameScr = require("./game");
const {dialog} = remote;
const {BrowserWindow} = remote;
const {app} = remote;
/** @type {string[]} arguments passed from command line */
const {argv} = remote.process;

var imgHolder = document.getElementById("image");

/**
 * Run when app is loaded
 */
(function () {
	/**
	 * Add eventListeners to window state buttons (minimize, maximize, close, fullscreen)
	 */
	function init() {
		document.getElementById("min-btn").addEventListener("click", function () {
			var window = BrowserWindow.getFocusedWindow();
			window.minimize();
		});
		document.getElementById("max-btn").addEventListener("click", function () {
			var window = BrowserWindow.getFocusedWindow();
			if (window.isFullScreen()){
				exitFullscreen();
			}
			if (!window.isMaximized()) {
				window.maximize();
				document.getElementById("max-btn").getElementsByTagName("path")[0].setAttribute("d", "m 2,1e-5 0,2 -2,0 0,8 8,0 0,-2 2,0 0,-8 z m 1,1 6,0 0,6 -1,0 0,-5 -5,0 z m -2,2 6,0 0,6 -6,0 z");
			} else {
				window.unmaximize();
				document.getElementById("max-btn").getElementsByTagName("path")[0].setAttribute("d", "M 0,0 0,10 10,10 10,0 Z M 1,1 9,1 9,9 1,9 Z");
			}
		});
		document.getElementById("close-btn").addEventListener("click", function () {
			var window = BrowserWindow.getFocusedWindow();
			window.close();
		});
		document.getElementById("fullscreen-btn").addEventListener("click", function () {
			var window = BrowserWindow.getFocusedWindow();
			var fullIco = document.getElementById("fullIco");
			var noFullIco = document.getElementById("noFullIco");
			if (!window.isFullScreen()){
				window.setFullScreen(true);
				fullIco.style.display = "none";
				noFullIco.style.display = "";
			} else {
				exitFullscreen();
			}
		});
	}
	document.onreadystatechange = function () {
		if (document.readyState == "complete") {
			init();
			showVersion();
			checkArgs();
		}
	};
})();

/**
 * Returns true if file can be read/write or false if not
 * @param {string} path path to file
 */
function fileExists(path){
	try {
		fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK);
		return true;
	} catch (err) {
		return false;
	}
}

/**
 * Checks arguments passed to this electron process and loads file if specified as one of arguments.
 * Should be run after init.
 */
function checkArgs(){
	/**	@type {string[]} list of arguments passed from command line (or open file) */
	let args;
	if(argv[1] === "." || argv[1] === "./" || argv[1] === ".\\"){ // if run from CLI (`electron .` or `electron ./`)
		args = argv.slice(2);
	} else {
		args = argv.slice(1);
	}
	if(args.length != 0){
		for(let a = args.length - 1; a >= 0; a--){
			if(!((args[a].toLowerCase().endsWith(".jpg") || args[a].toLowerCase().endsWith(".jpeg") || args[a].toLowerCase().endsWith(".png")) && fileExists(args[a]))){
				args = args.splice[a];
			}
		}
		if(args.length > 0){
			if(args.length > 1)
				alert("More than one file selected. Only the first one will be loaded: " + args.join("\n"));
			loadFile(args);
		}
	}
}

/**
 * Replaces Windows backslashes `\` with slashes `/`, uses encodeURI and then escapes remaining `!'()*` characters with their character code
 * @param {string} str String to encode
 * @returns {string} encoded string
 */
function fixedEncodeURI(str) {
	return encodeURI(str.replace(/\\/g, "/")).replace(/[!'()*]/g, function(c) {
		return "%" + c.charCodeAt(0).toString(16);
	});
}

/**
 * Exits fullscreen and sets proper icon
 */
function exitFullscreen(){
	var window = BrowserWindow.getFocusedWindow();
	var fullIco = document.getElementById("fullIco");
	var noFullIco = document.getElementById("noFullIco");
	window.setFullScreen(false);
	fullIco.style.display = "";
	noFullIco.style.display = "none";
}

/**
 * Function executed on select file button - shows open file dialog, load file as background of `imgHolder` and sets its dimensions - rounded to 10 (check comments in code)
 */
function selectFile() {
	var bg = dialog.showOpenDialog({
		title: "Wybierz zdjęcie",
		buttonLabel: "Wybierz",
		filters: [
			{name: "Obrazy", extensions: ["jpg", "jpeg", "png"]}
		],
		properties: ["openFile"]
	});
	if (bg != undefined){
		loadFile(bg);
	} else {
		alert("No file selected");
	}
}
document.getElementById("fileBTN").addEventListener("click", selectFile);

/**
 * Load image as background and set div's dimensions
 * @param {string[]} paths array of strings with path to file (relative or absolute), only the first element is used
 */
function loadFile([bg]){
	if(!path.isAbsolute(bg)) // if path is relative prepend it with current (base) path
		bg = path.join(__dirname, bg);
	var img = new Image();
	img.onload = function () {
		let elHeight, elWidth;
		if (this.width >= Math.floor((document.body.clientWidth - 20) / 10) * 10) { // if image isn't too small
			elWidth = Math.floor((document.body.clientWidth - 20) / 10) * 10; //set image width to body - 2*10px margin, rounded down to 10
			elHeight = Math.round(elWidth * this.height / this.width / 10) * 10; //height - elWidth * proportions of image, rounded to the nearest 10
			imgHolder.style.marginLeft = 0;
		}
		else {
			elWidth = Math.round(this.width / 10) * 10;
			elHeight = Math.round(this.height / 10) * 10;
			imgHolder.style.marginLeft = "auto";
		}
		imgHolder.style.width = elWidth + "px";
		imgHolder.style.height = elHeight + "px";
		gameScr.on(elWidth, elHeight);
	};
	img.src = "file://" + bg;
	bg = fixedEncodeURI(bg);
	imgHolder.style.backgroundImage = "url(file://" + bg + ")";
}

/**
 * Change tab to one pointed by event
 * @param {MouseEvent} event received event
 */
function changeTab(event){
	var translObj = {
		"menu-creator": "creator-container",
		"menu-play": "play-container",
		"menu-about": "about-contaier"
	};
	if(event.target.id == "menu-play") gameScr.startGame();
	var containers = document.getElementsByClassName("container");
	if (!event.target.classList.contains("menu-active")){
		for(let a = 0; a < document.getElementById("top-menu").childElementCount; a++){
			if(document.getElementById("top-menu").children[a] != event.target){
				document.getElementById("top-menu").children[a].classList.remove("menu-active");
			}
		}
		event.target.classList.add("menu-active");
		for(let a = 0; a < containers.length; a++){
			if(containers[a].id != translObj[event.target.id]){
				containers[a].classList.add("hidden");
			}
		}
		document.getElementById(translObj[event.target.id]).classList.remove("hidden");
	}
}
for(let a = 0; a < document.getElementById("top-menu").childElementCount; a++){
	document.getElementById("top-menu").children[a].addEventListener("click", changeTab);
}

/**
 * Display app version in "about" tab in `#appVer` span
 */
function showVersion(){
	var appVersion = app.getVersion();
	document.getElementById("appVer").appendChild(document.createTextNode(appVersion));
}
