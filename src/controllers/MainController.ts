import { app } from "electron";
import { WindowController } from "./WindowController";
import { NotificationController } from "./NotificationController";
import { ConfigController } from "./ConfigController";
import { QRController } from "./QRController";
import { PacketController } from "./PacketController";
import { AutomationController } from "./AutomationController";
import { CommandController } from "./CommandController";

export class Main {
  notification = new NotificationController(this);
  window = new WindowController(this);
  config = new ConfigController(this);
  packet = new PacketController(this);
  other = {
    qr: new QRController(this),
    automation: new AutomationController(this),
    command: new CommandController(this),
  };
  constructor() {
    //Prevent quit;
    app.on("quit", (e) => this.onQuit(e));
    app.on("before-quit", (e) => this.onQuit(e));
    app.on("window-all-closed", () => {});
  }
  private onQuit(e: Electron.Event) {
    if (app.isPackaged) {
      e.preventDefault();
    }
  }
}
