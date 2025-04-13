import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  Notification,
  Tray,
} from "electron";
import path from "path";
import fs from "fs";
import config from "./config";
import Database from "./utils/database";
import ms from "@sencinion/ms";
try {
  fs.statSync(config.databasePath);
  console.log("Config dizini mevcut.");
} catch (err) {
  fs.mkdirSync(config.databasePath, { recursive: true });
  console.log("Klasör oluşturuldu.");
}
const database = new Database("serverdata");
let UpdateInterval = undefined;
let UpdateInterval2 = undefined;
let win: BrowserWindow = null;
ipcMain.on("init", async (event) => {});
app.whenReady().then(() => {
  createWindow();
  createTray();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
  }
});
const createTray = () => {
  const tray = new Tray(path.join(__dirname, "../../assets/icon.png"));
  tray.setToolTip("Akıllı tahta kilit");
  tray.on("click", () => {
    createWindow();
  });
  tray.on("right-click", () => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Exit",
        click: () => {
          app.quit();
        },
      },
    ]);
    tray.popUpContextMenu(contextMenu);
  });
};
const createWindow = () => {
  if (!win || win.isDestroyed()) {
    win = new BrowserWindow({
      width: 800,
      autoHideMenuBar: true,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        preload: path.join(__dirname, "../html/preload.js"),
      },
    });
    win.loadFile(path.join(__dirname, "../html/main.html"));
    win.maximize();
  } else {
    if (win.isMinimized()) win.restore();
    win.focus();
    win.setSkipTaskbar(true);
    win.setSkipTaskbar(false);
  }
  win.on("close", () => {
    showNotification("Akıllı tahta kilit", "Uygulama arka planda çalışıyor.");
  });
};
ipcMain.on("pin", (event, data) => {});

function showNotification(title: string, body: string) {
  new Notification({ title, body }).show();
}
