import { exec, execSync } from "child_process";
import config from "../config.js";
export function yasaklı_uygulama_bul() {
  const execute = execSync(`tasklist`).toString("utf-8").toLowerCase();
  let found = false;
  config.yasak_uygulama.forEach((app) => {
    if (execute.includes(app.toLowerCase())) {
      found = true;
      exec(`taskkill /IM ${app} /F`);
    }
  });
  return found;
}
export function pc_kapa() {}
export function ekranAc() {
  execSync(
    `powershell.exe -Command (Add-Type '[DllImport("user32.dll")] public static extern int SendMessage(int hWnd, int hMsg, int wParam, int lParam);' -Name a -PassThru)::SendMessage(-1, 0x0112, 0xF170, 1)`
  );
}
export function ekranKapa() {
  execSync(
    `powershell.exe -Command (Add-Type '[DllImport("user32.dll")] public static extern int SendMessage(int hWnd, int hMsg, int wParam, int lParam);' -Name a -PassThru)::SendMessage(-1, 0x0112, 0xF170, 2)`
  );
}
export function explorerAc() {
  execSync("explorer.exe");
}
export function explorerKapa() {
  execSync("taskkill /f /im explorer.exe");
}
