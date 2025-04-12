import { app, BrowserWindow, dialog, ipcMain, screen } from "electron";
import path from "path";
let closed = false;
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    alwaysOnTop: true,
    frame: false,
    fullscreen: true,
    resizable: false,
    autoHideMenuBar: true,
    titleBarStyle: "hidden",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, "../html/preload.js"),
    },
  });
  win.setSkipTaskbar(true);
  if (!closed) {
    win && !win.isMinimized() && win.restore();
    win && win.focus();
  }
  win.on("blur", () => {
    if (!closed) {
      console.log("Pencere arka planda.");
      setTimeout(() => {
        win && !win.isFocused() && win.close();
      }, 5000);
    }
  });

  win.on("focus", () => {
    if (!closed) {
      win && !win.isMinimized() && win.restore();
      win && win.focus();
    }
  });

  let interval = setInterval(() => {
    if (!closed) {
      win && !win.isMinimized() && win.restore();
      win && win.focus();
    } else {
      win.close();
    }
  }, 1500);
  win.on("close", (event) => {
    console.log("closed bebis");
    clearInterval(interval);
  });
  win.loadFile(path.join(__dirname, "../html/main.html"));
};
ipcMain.on("close-app", (event) => {
  closed = true;
  setTimeout(() => {
    closed = false;
    console.log("tmdır");
  }, 7000);
});
app.on("quit", (event) => {
  event.preventDefault();
  console.log("after-quit event triggered");
});
app.on("before-quit", (e) => {
  e.preventDefault();
  console.log("before-quit event triggered");
});
app.on("window-all-closed", async () => {
  if (closed) await waitForOpen();
  createWindow();
});
function waitForOpen() {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (!closed) {
        clearInterval(interval);
        resolve(true);
      }
    }, 1000);
  });
}
ipcMain.on("init", (event) => {});
app.whenReady().then(() => {
  createWindow();
});
