// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { remote, ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");
const gameScr = require("./game");
const { dialog } = remote;
const { BrowserWindow } = remote;
const { app } = remote;
/** @type {string[]} arguments passed from command line */
const { argv } = remote.process;
const supportedFileTypes = [".png", ".jpg", ".jpeg", ".bmp", ".wzp"];

var imgHolder = document.getElementById("image");
var dropZone = document.getElementById("droparea");

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
			if (window.isFullScreen()) {
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
			if (!window.isFullScreen()) {
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
function fileExists(path) {
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
function checkArgs() {
	/**	@type {string[]} list of arguments passed from command line (or open file) */
	let args;
	if (argv[1] === "." || argv[1] === "./" || argv[1] === ".\\") { // if run from CLI (`electron .` or `electron ./`)
		args = argv.slice(2);
	} else {
		args = argv.slice(1);
	}
	if (args.length != 0) {
		for (let a = args.length - 1; a >= 0; a--) {
			if (!((supportedFileTypes.includes(path.extname(args[a]).toLowerCase())) && fileExists(args[a]))) {
				args.splice(a, 1);
			}
		}
		if (args.length > 0) {
			if (args.length > 1)
				alert("More than one file selected. Only the first one will be loaded: " + args.join("\n"), "Warning!");
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
	return encodeURI(str.replace(/\\/g, "/")).replace(/[!'()*]/g, function (c) {
		return "%" + c.charCodeAt(0).toString(16);
	});
}

/**
 * Exits fullscreen and sets proper icon
 */
function exitFullscreen() {
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
	dialog.showOpenDialog({
		title: "Wybierz zdjęcie",
		buttonLabel: "Wybierz",
		filters: [
			{ name: "Obsługiwane pliki", extensions: ["jpg", "jpeg", "png", "bmp", "wzp"] },
			{ name: "Obrazy", extensions: ["jpg", "jpeg", "png", "bmp"] },
			{ name: "Wzór", extensions: ["wzp"] }
		],
		properties: ["openFile"]
	}).then(optionDialog => {
		if (optionDialog.canceled) return;
		if (optionDialog.filePaths != undefined) {
			loadFile(optionDialog.filePaths);
		} else {
			dialog.showErrorBox("Błąd!", "Nie wybrano pliku!");
			//alert("No file selected", "Błąd");
		}
	});
}
document.getElementById("fileBTN").addEventListener("click", selectFile);

/**
 * Load image as background and set div's dimensions
 * @param {string[]} paths array of strings with path to file (relative or absolute), only the first element is used
 * @param {boolean} [URIencoded=false] whether file path is already URI encoded
 * @param {Function} [callback] callback to execute, cbarg passed as an argument
 * @param {*} [cbarg] parameter to pass to callback
 */
function loadFile([bg], URIencoded = false, callback, cbarg) {
	if (!path.isAbsolute(bg)) // if path is relative prepend it with current (base) path
		bg = path.join(__dirname, bg);
	if (path.extname(bg) === ".wzp") {
		fs.readFile(bg, "utf-8", (err, data) => {
			if (err) {
				dialog.showErrorBox("Błąd odczytu wzoru", "Nie udało odczytać się pliku. Komunikat błędu:\n" + err);
				return;
			}
			/** @type {Legend} */
			let legend;
			try {
				legend = JSON.parse(data);
				if (!(legend.dimensions && legend.elements && legend.lastNum)) {
					throw new Error("Plik nie zawiera niezbędnych danych.");
				}
			} catch (error) {
				dialog.showErrorBox("Błąd odczytu wzoru", "Nie udało odczytać się pliku - prawdopodobnie jest on uszkodzony. Komunikat błędu:\n" + error);
				return;
			}
			try {
				if (legend.filePath) { // if file path is specified in `.wzp` load image from it (and don't encode it twice)
					loadFile([legend.filePath], true, gameScr.loadLegend, legend);
				} else { // if no file specified - just load pattern, ./game.js checks whether current image has proper dimensions
					gameScr.loadLegend(legend);
				}
			} catch (e) {
				dialog.showErrorBox("Something went wrong", e);
			}
		});
		// abort further loading of file so not to load background twice
		return;
	}
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
		gameScr.on(elWidth, elHeight, bg);
		if (callback) {
			setImmediate(() => {
				try {
					callback(cbarg);
				} catch (error) {
					dialog.showErrorBox("Something went wrong", error);
				}
			});
		}
	};
	img.src = "file://" + bg;
	if (!URIencoded)
		bg = fixedEncodeURI(bg);
	imgHolder.style.backgroundImage = "url(file://" + bg + ")";
}

/**
 * Shows save dialog and saves `legend` to selected file with .wzp extension
 * @param {MouseEvent} e
 */
function savePattern(e) {
	/** @type {Legend} */
	let legend = gameScr.legend();
	if (e.target.id === "savePatternOnly") {
		delete legend.filePath;
	}
	legend = JSON.stringify(legend);
	dialog.showSaveDialog({
		title: "Zapisz wzór",
		filters: [
			{ name: "Wzór", extensions: ["wzp"] }
		]
	}, saveFile => {
		fs.writeFile(saveFile, legend, "utf-8", err => {
			if (err) {
				dialog.showErrorBox("Błąd zapisu", "Nie udało zapisać się wzoru. Komunkiat błędu:\n" + err);
			} else {
				alert("Wzór zapisany do pliku: " + saveFile, "Zapisano");
			}
		});
	});
}
document.getElementById("savePattern").addEventListener("click", savePattern);
document.getElementById("savePatternOnly").addEventListener("click", savePattern);

/**
 * Prevent opening loading image if dropped outside `dropZone`
 * @param {DragEvent} e
 */
function preventDrop(e) {
	e.stopPropagation();
	e.preventDefault();
	e.dataTransfer.dropEffect = "none";
}
document.body.addEventListener("dragenter", preventDrop);
document.body.addEventListener("dragover", preventDrop);
document.body.addEventListener("dragleave", preventDrop);
document.body.addEventListener("dragend", preventDrop);
document.body.addEventListener("drop", preventDrop);

/**
 * Show the copy icon when dragging over. Shows dropzone
 * @param {DragEvent} e
 */
function fileDragOver(e) {
	e.stopPropagation();
	e.preventDefault();
	e.dataTransfer.dropEffect = "copy";
	dropZone.style.display = "block";
}
document.getElementById("creator-container").addEventListener("dragenter", fileDragOver);
dropZone.addEventListener("dragenter", fileDragOver);
dropZone.addEventListener("dragover", fileDragOver);

/**
 * Hides (`display: none`) dropzone
 * @param {DragEvent} e
 */
function fileDragLeave(e) {
	e.stopPropagation();
	e.preventDefault();
	dropZone.style.display = "none";
}
dropZone.addEventListener("dragleave", fileDragLeave);
dropZone.addEventListener("dragend", fileDragLeave);

/**
 * Loads (first) dropped file
 * @param {DragEvent} e event fired on file drop
 */
function dropHandler(e) {
	e.stopPropagation();
	e.preventDefault();
	var files = e.dataTransfer.files; // Array of all files
	let anyFile = false;
	for (let a = 0; a < files.length; a++) {
		if (supportedFileTypes.includes(path.extname(files[a].path).toLowerCase())) {
			if (files.length > 1)
				alert("Wybrano wiele plików. Załadowany zostanie pierwszy z nich", "Uwaga!");
			files = files[a];
			anyFile = true;
			break;
		}
	}
	if (!anyFile)
		files = [];
	if (files.length == 0) {
		alert("Upewnij się, że plik ma rozszerzenie .jpg, .jpeg, .png, .bmp lub .wzp", "Nie można otworzyć pliku");
	} else {
		loadFile([files.path]);
	}
	dropZone.style.display = "none";
}
dropZone.addEventListener("drop", dropHandler);

/**
 * Change tab to one pointed by event
 * @param {MouseEvent} event received event
 */
function changeTab(event) {
	var translObj = {
		"menu-creator": "creator-container",
		"menu-play": "play-container",
		"menu-about": "about-contaier"
	};
	if (event.target.id == "menu-play") gameScr.startGame();
	var containers = document.getElementsByClassName("container");
	if (!event.target.classList.contains("menu-active")) {
		for (let a = 0; a < document.getElementById("top-menu").childElementCount; a++) {
			if (document.getElementById("top-menu").children[a] != event.target) {
				document.getElementById("top-menu").children[a].classList.remove("menu-active");
			}
		}
		event.target.classList.add("menu-active");
		for (let a = 0; a < containers.length; a++) {
			if (containers[a].id != translObj[event.target.id]) {
				containers[a].classList.add("hidden");
			}
		}
		document.getElementById(translObj[event.target.id]).classList.remove("hidden");
	}
}
for (let a = 0; a < document.getElementById("top-menu").childElementCount; a++) {
	document.getElementById("top-menu").children[a].addEventListener("click", changeTab);
}

/**
 * Display app version in "about" tab in `#appVer` span
 */
function showVersion() {
	var appVersion = app.getVersion();
	document.getElementById("appVer").appendChild(document.createTextNode(appVersion));
}

// Listen to openFile messages from main
ipcRenderer.on("openFile", (_event, filePath) => {
	// Check if the file has supported extension
	if (supportedFileTypes.includes(path.extname(filePath).toLowerCase())) {
		loadFile([filePath]);
	}
});

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
