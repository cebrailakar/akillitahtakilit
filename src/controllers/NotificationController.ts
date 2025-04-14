import { Notification } from "electron";
import { Main } from "./MainController";
export type NotificationOptions = {
  type: "warn" | "info";
  title: string;
  body: string;
};
export class NotificationController {
  main: Main;
  constructor(main: Main) {
    this.main = main;
  }
  sendNotification(options: NotificationOptions) {
    if (this.main.window.windowVisible) {
      this.main.window.sendMessage("on_notif", options);
    } else {
      const notification = new Notification({
        title: options.title,
        body: options.body,
      });
      notification.show();
      notification.on("close", () => {
        notification.removeAllListeners();
      });
    }
  }
}
