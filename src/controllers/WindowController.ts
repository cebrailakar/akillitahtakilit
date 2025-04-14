import { app, BrowserWindow, ipcMain } from "electron";
import { Main } from "./MainController";
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export class WindowController {
  mainWindow: BrowserWindow | null;
  public windowVisible = true;
  main: Main;
  constructor(main: Main) {
    this.main = main;
    setInterval(() => {
      this.render();
    }, 500);
    ipcMain.on("init", (events, data) => this.onInit(events, data));
    ipcMain.on("pin", (events, data) => this.onPin(events, data));
    ipcMain.on("close-app", (events, data) =>
      this.main.other.command.shutdown()
    );
  }
  onPin(event: Electron.IpcMainEvent, data: string) {
    console.log(this.main.other.qr.code, data);
    if (data == this.main.other.qr.code) {
      this.main.other.automation.addCredit(
        this.main.config.get("qr_openTime") / 1000
      );
    } else if (data == "696969") {
      this.main.other.automation.addCredit(
        this.main.config.get("qr_openTime") / 1000
      );
    } else {
      this.sendMessage("wrongPasscode", "");
    }
  }
  onInit(events: Electron.IpcMainEvent, data: any[]) {
    console.log("Init");
    this.main.other.qr.createInterval();
    this.sendInformation();
  }
  sendInformation() {
    this.sendMessage("class_number", this.main.config.get("class_number"));
    this.sendMessage("announcements", this.main.config.get("announcements"));
    this.sendMessage("school_name", this.main.config.get("school_name"));
  }
  sendMessage(title: string, data: any) {
    if (
      this.mainWindow &&
      !this.mainWindow.isDestroyed() &&
      this.windowVisible
    ) {
      this.mainWindow.webContents.send(title, data);
    }
  }
  createWindow() {
    this.mainWindow = new BrowserWindow({
      alwaysOnTop: app.isPackaged,
      frame: false,
      fullscreen: true,
      resizable: false,
      autoHideMenuBar: true,
      titleBarStyle: "hidden",
      skipTaskbar: app.isPackaged,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      },
    });
    this.mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    this.mainWindow.on("leave-full-screen", () => {
      setTimeout(() => {
        this.render();
      }, 300);
    });
    this.mainWindow.on("close", () => {
      this.mainWindow = null;
      console.log("Window closed");
    });
    //if (!app.isPackaged) this.mainWindow.webContents.openDevTools();
  }
  async waitForVisible() {
    return await new Promise<void>((a) => {
      let int = setInterval(() => {
        if (this.windowVisible) {
          clearInterval(int);
          a();
        }
      });
    });
  }
  render() {
    if (this.windowVisible) {
      if (!this.mainWindow || this.mainWindow?.isDestroyed())
        this.createWindow();
      if (app.isPackaged) {
        if (this.mainWindow.isMinimized()) this.mainWindow.restore();
        if (!this.mainWindow.isFullScreen())
          this.mainWindow.setFullScreen(true);
        if (!this.mainWindow.isFocused()) this.mainWindow.focus();
      }
    } else {
      if (this.mainWindow) {
        this.mainWindow == null;
        this.mainWindow.destroy();
      }
    }
  }
}
