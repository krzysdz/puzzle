const {app, BrowserWindow} = require("electron");
const path = require("path");
const url = require("url");
const {autoUpdater} = require("electron-updater");

// AppUserModelId has to be set to appId (from build in package.json) in order to
// display notifications on Windows 10 and 8/8.1 used eg. by autoUpdater.
app.setAppUserModelId("pl.dziembala-mazur.szkola-puzzle");

// If the window doesn't exist yet add the filename to argv
function firstOpenListener(e, p) {
	e.preventDefault();
	process.argv.push(p);
}
app.on("open-file", firstOpenListener);

/**
 * Keep a global reference of the window object, if you don't, the window will
 * be closed automatically when the JavaScript object is garbage collected.
 * @type {Electron.BrowserWindow}
 */
let win;

function createWindow () {
	// Window icon should be .ico on windows and .png on other systems
	let icon;
	if (process.platform === "win32"){
		icon = path.join(__dirname, "build", "icon.ico");
	} else {
		icon = path.join(__dirname, "build", "icon.png");
	}

	// Create the browser window. (hidden)
	win = new BrowserWindow({width: 800, height: 600, frame: false, icon: icon, show: false});

	// and load the index.html of the app.
	win.loadURL(url.format({
		pathname: path.join(__dirname, "index.html"),
		protocol: "file:",
		slashes: true
	}));

	// when the index.html is loaded
	win.webContents.once("dom-ready", () => {
		// display the window to users
		win.show();
		// and maximize it
		win.maximize();
	});

	// Check for updates and notify user if a new version is available
	autoUpdater.checkForUpdatesAndNotify();

	// Emitted when the window is closed.
	win.on("closed", () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = null;
	});

	// Remove all open file event listeners
	app.removeAllListeners("open-file");
	// Now the window exists, so message can be sent to the renderer
	app.on("open-file", (e, p) => {
		e.preventDefault();
		win.webContents.send("openFile", p);
	});
}

/**
 * Listen to open-file events while all windows are closed on macOS
 * @param {Electron.Event} e "open-file" event
 * @param {string} p path to file
 */
function windowClosedOpenFile(e, p){
	e.preventDefault();
	if(process.argv[1] === "." || process.argv[1] === "./" || process.argv[1] === ".\\"){ // if run from CLI (`electron .` or `electron ./`)
		process.argv.splice(2);
		process.argv[2] = p;
	} else {
		process.argv.splice(1);
		process.argv[1] = p;
	}
	createWindow();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== "darwin") {
		app.quit();
	} else {
		// If on macOS remove open-file event listeners
		app.removeAllListeners("open-file");
		app.addListener("open-file", windowClosedOpenFile);
	}
});

app.on("activate", () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (win === null) {
		createWindow();
	}
});
