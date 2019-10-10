'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol, installVueDevtools } from 'vue-cli-plugin-electron-builder/lib'
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';

log.transports.console.level = 'info';
log.transports.file.level = 'info';
log.transports.rendererConsole = null;
log.transports.mainConsole = null;
autoUpdater.logger = log;
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

const isDevelopment = process.env.NODE_ENV !== 'production'

if (isDevelopment && !process.env.IS_TEST) {
  require('electron-context-menu')({
    showInspectElement: true
  });
}


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ 
    width: 800,
    height: 600,
    minHeight: 600,
    minWidth: 800,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: !process.env.WEBPACK_DEV_SERVER_URL
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  win.webContents.on('will-navigate', handleRedirect)
  win.webContents.on('new-window', handleRedirect)

  win.on('closed', () => {
    win = null
  })
}

var handleRedirect = (e: Electron.Event, url: string ) => {
  if(url.startsWith("http")) {
    e.preventDefault()
    require('electron').shell.openExternal(url)
  }
}


// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    try {
      await installVueDevtools()
    } catch (e) {
      log.error('Vue Devtools failed to install:', e.toString())
    }
  }

  createWindow()
  autoUpdater.checkForUpdates();
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}


// autoupdater
autoUpdater.on('checking-for-update', () => {
  log.info("updater", "checking for update");
  win?.webContents.send('checking-for-update');
})
autoUpdater.on('update-available', (info) => {
  log.info("updater", "update available", info );
  win?.webContents.send('update-available', info );
})
ipcMain.on("download-update", (event) => {
  log.info("download-update", event );
  autoUpdater.downloadUpdate();
})
autoUpdater.on('update-not-available', (info) => {
  log.info("updater", "no update available", info);
  win?.webContents.send('update-not-available', info );
})
autoUpdater.on('error', (err) => {
  log.error("updater", err);
  win?.webContents.send('update-error', err );
})
autoUpdater.on('download-progress', (progress) => {
  log.info("updater", "progress", progress);
  win?.webContents.send('download-progress', progress );
})
autoUpdater.on('update-downloaded', (info) => {
  log.info("updater", "update downloaded", info );
  win?.webContents.send('update-downloaded', info );
})
ipcMain.on('install-update', (event, args) => {
  log.info("updater", "install-update", {event, args});
  autoUpdater.quitAndInstall();
})