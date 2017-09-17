process.env.NODE_ENV = 'production'; // To increase performance

const electron        = require("electron");
const path            = require('path');
const os              = require("os");

const rootPath = path.join(__dirname); // root Path

const powerSaveBlocker  = electron.powerSaveBlocker; // To enable save blocker
const BrowserWindow     = electron.BrowserWindow; // Module to control native Browser Window
const nativeImage       = electron.nativeImage;     // Module to control native Image
const app               = electron.app;                     // Module to control app's life

const ConfigManager = require(path.join(rootPath, "/app/src/api/configManager"));

// Global reference of window object,
// To avaoid window being closed automatically when Js object is GCed.
var mainWindow = null;

// Constant to store index HTML file path
htmlFilePath = path.join('file://',rootPath,'/app/index.html');

const shouldQuit = app.makeSingleInstance(() => {
    // If a second instance is initiated, focus our (main) Window
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
    }
});

if (shouldQuit) {
    app.quit();
}

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
})

// Called when Electron has done everything
// initialization and ready for creating browser window
app.on('ready', function() {

    if (os.platform() !== "linux") {
        createToast();
    };

    const configManager          = new ConfigManager(app);
    const useNativeFrame         = configManager.getConfig().useNativeFrame;
    let bounds                   = configManager.getConfig().bounds;

    bounds = checkBounds(bounds);

    mainWindow = new BrowserWindow({
        title                   :  'File Reader',
        x                       :  bounds.x,
        y                       :  bounds.y,
        width                   :  bounds.width,
        height                  :  bounds.height,
        minWidth                :  1000,
        minHeight               :  600,
        titleBarStyle           :  'hidden',
        backgroundColor         :  '#192033',
        scrollBounce            :  true,
        show                    :  false,
        frame                   :  useNativeFrame,
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.loadURL(htmlFilePath);

    let webContents = mainWindow.webContents;

    webContents.on('new-window', function(event, url) {
        event.preventDefault();

    electron.shell.openExternal(url);
    })

    mainWindow.on('closed', function() {
        mainWindow = null;
    });

    // Activate sleep blocker
    powerSaveBlocker.start('prevent-display-sleep');

})

/*
|=============================
| checkBounds function
| ============================
*/

function checkBounds(bounds) {
    // check if the browser window is offscreen
    //const point = { bounds.x bounds.y };
    const display = electron.screen.getDisplayNearestPoint(bounds).workArea;

    const onScreen = bounds.x >= display.x
        && bounds.x + bounds.width <= display.x + display.width
        && bounds.y >= display.y
        && bounds.y + bounds.height <= display.y + display.height;

    if(!onScreen) {
        delete bounds.x;
        delete bounds.y;
        bounds.width = 1000;
        bounds.height = 600;
    }

    return bounds;
}

// Create Toast Notification
function createToast() {
    Notification("File Reader", {
        body: "File Reader is ready!",
        }, () => {
            console.log('Notification was clicked!')
        })
}
