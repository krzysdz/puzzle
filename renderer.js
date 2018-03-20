// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const remote = require("electron").remote;
const {dialog} = remote;
const {BrowserWindow} = remote;
/**
 * Add eventListeners to window state buttons (minimize, maximize, close)
 */
(function () {
	function init() {
		document.getElementById("min-btn").addEventListener("click", function () {
			var window = BrowserWindow.getFocusedWindow();
			window.minimize();
		});
		document.getElementById("max-btn").addEventListener("click", function () {
			var window = BrowserWindow.getFocusedWindow();
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
	}
	document.onreadystatechange = function () {
		if (document.readyState == "complete") {
			init();
		}
	};
})();
var imgHolder = document.getElementById("image");
function selectFile() {
	var img = new Image();
	img.onload = function() {
		//width defined as 100vw - 20px in styleshhet
		imgHolder.style.width = document.body.clientWidth - 20 + "px";
		imgHolder.style.height = "calc((100vw - 20px) * " + this.height/this.width + ")";
	};
	var bg = dialog.showOpenDialog({
		title: "Wybierz zdjęcie",
		buttonLabel: "Wybierz",
		filters: [
			{name: "Obrazy", extensions: ["jpg", "jpeg", "png"]}
		],
		properties: ["openFile"]
	});
	if (bg != undefined){
		img.src = "file://" + bg[0];
		bg[0] = escape(bg[0].replace(/[\\]/g, "/"));
		imgHolder.style.backgroundImage = "url(file://" + bg[0] + ")";
	} else {
		alert("No file selected");
	}
}
document.getElementById("fileBTN").addEventListener("click", selectFile);
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
