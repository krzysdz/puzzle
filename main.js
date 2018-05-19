const {app, BrowserWindow} = require("electron");
const path = require("path");
const url = require("url");
const {autoUpdater} = require("electron-updater");

// AppUserModelId has to be set to appId (from build in package.json) in order to
// display notifications on Windows 10 and 8/8.1 used eg. by autoUpdater.
app.setAppUserModelId("pl.dziembala-mazur.szkola-puzzle");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow () {
	// Window icon should be .ico on windows and .png on other systems
	let icon;
	if (process.platform === "win32"){
		icon = path.join(__dirname, "build", "icon.ico");
	} else {
		icon = path.join(__dirname, "build", "icon.png");
	}

	// Create the browser window.
	win = new BrowserWindow({width: 800, height: 600, frame: false, icon: icon});

	// maximize the window
	win.maximize();

	// and load the index.html of the app.
	win.loadURL(url.format({
		pathname: path.join(__dirname, "index.html"),
		protocol: "file:",
		slashes: true
	}));

	// Check for updates and notify user if a new version is available
	autoUpdater.checkForUpdatesAndNotify();

	// Emitted when the window is closed.
	win.on("closed", () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = null;
	});
}

app.on("open-file", (e, p) => {
	e.preventDefault();
	process.argv.push(p);
});

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
	}
});

app.on("activate", () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (win === null) {
		createWindow();
	}
});
