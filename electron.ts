import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Notification,
  Tray,
} from "electron";
import path from "path";
import fs from "fs";
import config from "./config";
import Database from "./utils/database";
import { generateQRCode, generateRandomCode } from "./utils/qrCode";
import { yasaklı_uygulama_bul } from "./utils/util";
import ms from "@sencinion/ms";

try {
  fs.statSync(config.databasePath);
  console.log("Config dizini mevcut.");
} catch (err) {
  fs.mkdirSync(config.databasePath, { recursive: true });
  console.log("Klasör oluşturuldu.");
}

app.on("quit", (event) => {
  event.preventDefault();
  console.log("after-quit event triggered");
});
app.on("before-quit", (e) => {
  e.preventDefault();
  console.log("before-quit event triggered");
});
const database = new Database("data");
let closed = false;
let closeTime = 0;
let lastNotification = Date.now();
let currentCode = generateRandomCode();
let globalTick = 0;
let currentWindow: BrowserWindow = null;
let currentTray: Tray = null;
let lastTick = Date.now();
let Interval = null;
app.whenReady().then(async () => {
  tick();
  Interval = setInterval(() => {
    if (Date.now() - lastTick > 1000) {
      lastTick = Date.now();
      tick();
    }
  }, 100);
});
ipcMain.on("init", () => {
  if (Interval) clearInterval(Interval);
  Interval = setInterval(() => {
    if (Date.now() - lastTick > 1000) {
      lastTick = Date.now();
      tick();
    }
  }, 100);

  qrInterval(true);
  duyuruInterval(true);
});
async function tick() {
  console.log("Tick: ", globalTick);
  await Promise.all([
    checkInterval(),
    qrInterval(),
    duyuruInterval(),
    windowInterval(),
  ]);
  globalTick++;
}

ipcMain.on("close-app", (event) => {
  closed = true;
  closeTime = closeTime + 10;
});
ipcMain.on("pin", (event, data) => {
  console.log(currentCode, data);
  if (data == currentCode) {
    console.log("Tutturdu la");
    closed = true;
    closeTime = closeTime + Math.floor(config.pin_timeout / 1000);
  } else {
    event.reply("wrongPasscode");
  }
});
async function windowInterval() {
  //  console.log("Window interval");
  if (!currentWindow && !closed) createWindow();
  if (currentWindow?.isDestroyed()) currentWindow = null;
  if (!closed) restoreWindow();
  else {
    if (currentWindow && !currentWindow.isDestroyed()) currentWindow.close();
    if (closeTime > 0) {
      closeTime--;
      closed = true;
    } else {
      closeTime = 0;
      closed = false;
    }
  }
}

async function qrInterval(force: boolean = false) {
  if (globalTick % Math.floor(config.update_interval / 1000) === 0 || force) {
    console.log("qrInterval");

    currentCode = generateRandomCode();
    const QRData = await generateQRCode(currentCode);
    const sınıf = database.get("sinif") || "10/A";
    const okul_ad = database.get("okulad") || "Okul adı bura";

    broadcastToAllWindows("qr-code", {
      QRData,
      nextUpdate: config.update_interval,
    });
    broadcastToAllWindows("sinif", { sınıf });
    broadcastToAllWindows("okul_ad", { okul_ad });
  }
}

async function checkInterval() {
  //console.log("checkInterval");
  const yasak = yasaklı_uygulama_bul();
  if (yasak) {
    console.log("Yasak uygulama bulundu.");
    showNotification("Sistem", "Yasak uygulama bulundu.");
  }
}
async function duyuruInterval(force: boolean = false) {
  if (globalTick % Math.floor(config.duyuru_interval / 1000) === 0 || force) {
    console.log("duyuruInterval");

    const duyurular = database.get("duyurular") || [];
    broadcastToAllWindows("duyurular", { duyurular });
  }
}

function restoreWindow() {
  currentWindow && !currentWindow?.isMinimized() && currentWindow.restore();
  currentWindow && currentWindow?.focus();
}
function createWindow() {
  if (currentWindow && !currentWindow.isDestroyed()) currentWindow.destroy();
  currentWindow = new BrowserWindow({
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
  currentWindow.setSkipTaskbar(true);
  currentWindow.loadFile(path.join(__dirname, "../html/main.html"));
  currentWindow.on("close", () => {
    currentWindow = null;
    console.log("Window closed");
  });
  if (!closed) restoreWindow();
  else currentWindow.close();
}
function showNotification(title: string, body: string) {
  if (Date.now() - lastNotification > config.mesaj_interval) {
    lastNotification = Date.now();
    console.log("Bildirim gösterildi.");
    new Notification({ title, body }).show();
  }
}
function broadcastToAllWindows(channel: string, data: any) {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send(channel, data);
  });
}
