import crypto from "crypto";
import { Main } from "./MainController";
import { execSync } from "child_process";
import { app } from "electron";

export class CommandController {
  main: Main;
  constructor(main: Main) {
    this.main = main;
  }
  isUnlocked() {
    return !this.main.window.windowVisible;
  }
  unlockApp() {
    this.main.window.windowVisible = false;
    this.main.window.render();
  }
  lockApp() {
    this.main.window.windowVisible = true;
    this.main.window.render();
  }
  closeScreen() {
    execSync(
      `powershell.exe -Command (Add-Type '[DllImport("user32.dll")] public static extern int SendMessage(int hWnd, int hMsg, int wParam, int lParam);' -Name a -PassThru)::SendMessage(-1, 0x0112, 0xF170, 2)`
    );
  }
  openScreen() {
    execSync(
      `powershell.exe -Command (Add-Type '[DllImport("user32.dll")] public static extern int SendMessage(int hWnd, int hMsg, int wParam, int lParam);' -Name a -PassThru)::SendMessage(-1, 0x0112, 0xF170, 1)`
    );
  }
  shutdown() {
    if (app.isPackaged) {
      execSync("shutdown /s /t 0");
    } else {
      //  process.exit();
    }
  }
}
