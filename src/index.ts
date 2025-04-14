import { app } from "electron";
import { Main } from "./controllers/MainController";
app.setAppUserModelId("kilit");

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.whenReady().then(() => {
    new Main();
  });
}
