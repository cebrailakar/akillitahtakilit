import { app, BrowserWindow, dialog, ipcMain, Notification } from "electron";
import path from "path";
import fs from "fs";
import config from "./config";
import Database from "./utils/database";
import { generateQRCode, generateRandomCode } from "./utils/qrCode";
import { yasaklı_uygulama_bul } from "./utils/util";
import ms from "@sencinion/ms";
let closed = false;
try {
  fs.statSync(config.databasePath);
  console.log("Config dizini mevcut.");
} catch (err) {
  fs.mkdirSync(config.databasePath, { recursive: true });
  console.log("Klasör oluşturuldu.");
}
const database = new Database("data");

let currentCode = generateRandomCode();
let lastNotif = Date.now();
let checkInterval = setInterval(() => {
  const yasak = yasaklı_uygulama_bul();
  if (yasak) {
    if (closed) {
      Date.now() - lastNotif > ms("2 dakika")
        ? showNotification("Uyarı", "Yasak bu sana")
        : false;
    } else {
    }
  }
}, 1000);
let UpdateInterval = undefined;
let UpdateInterval2 = undefined;
ipcMain.on("init", async (event) => {
  const sınıf = database.get("sinif") || "10/A";
  const okul_ad = database.get("okulad") || "Okul adı bura";
  const duyurular = database.get("duyurular") || [];

  let QRData = await generateQRCode(currentCode);
  event.reply("qr-code", { QRData, nextUpdate: config.update_interval });
  event.reply("sinif", { sınıf });
  event.reply("okul_ad", { okul_ad });
  event.reply("duyurular", { duyurular });
  UpdateInterval = setInterval(async () => {
    currentCode = generateRandomCode();
    QRData = await generateQRCode(currentCode);
    const sınıf = database.get("sinif") || "10/A";
    const okul_ad = database.get("okulad") || "Okul adı";
    event.reply("qr-code", { QRData, nextUpdate: config.update_interval });
    event.reply("sinif", { sınıf });
    event.reply("okul_ad", { okul_ad });
  }, config.update_interval);
  UpdateInterval2 = setInterval(async () => {
    const duyurular = database.get("duyurular") || [];
    event.reply("duyurular", { duyurular });
  }, config.duyuru_interval);
});
app.whenReady().then(() => {
  createWindow();
});

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
  // win.webContents.openDevTools();
  win.setSkipTaskbar(true);
  if (!closed) {
    try {
      win && !win?.isMinimized() && win.restore();
      win && win?.focus();
    } catch (error) {}
  }
  win.on("blur", () => {
    if (!closed) {
      console.log("Pencere arka planda.");
      setTimeout(() => {
        try {
          win && !win?.isFocused() && win.close();
        } catch (error) {}
      }, 5000);
    }
  });

  win.on("focus", () => {
    if (!closed) {
      try {
        win && !win.isMinimized() && win.restore();
        win && win.focus();
      } catch (error) {}
    }
  });

  let interval = setInterval(() => {
    if (!closed) {
      try {
        win && !win.isMinimized() && win.restore();
        win && win.focus();
      } catch (error) {}
    } else {
      try {
        win.close();
      } catch (error) {}
    }
  }, 1500);
  win.on("close", (event) => {
    console.log("closed");
    clearInterval(interval);
  });
  win.loadFile(path.join(__dirname, "../html/main.html"));
};
ipcMain.on("close-app", (event) => {
  closed = true;
  //TODO: DÜZELT
  setTimeout(() => {
    closed = false;
    console.log("tmdır");
  }, 7000);
});
ipcMain.on("pin", (event, data) => {
  console.log(currentCode, data);
  if (data == currentCode) {
    console.log("Tutturdu la");
    closed = true;
    setTimeout(() => {
      closed = false;
      console.log("süre bitti");
    }, config.pin_timeout);
  } else {
    event.reply("wrongPasscode");
  }
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
function showNotification(title: string, body: string) {
  new Notification({ title, body }).show();
}
