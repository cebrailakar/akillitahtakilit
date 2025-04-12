import config from "./config.js";
import Database from "./utils/database.js";
import fs from "node:fs";
new Database("database");
console.log("Başlatılıyor...");
try {
  fs.statSync(config.databasePath);
  console.log("Config dizini mevcut.");
} catch (err) {
  fs.mkdirSync(config.databasePath, { recursive: true });
  console.log("Klasör oluşturuldu.");
}
/*const killExplorer = new Deno.Command("taskkill", {
  args: ["/F", "/IM", "explorer.exe"],
  stdout: "piped",
  stderr: "piped",
});

const { code } = await killExplorer.output();
if (code === 0) {
  console.log("Explorer işlemi başarıyla sonlandırıldı.");
} else {
  console.log("Explorer işlemi sonlandırılamadı.");
}
*/
