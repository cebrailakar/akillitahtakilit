import ms from "@sencinion/ms";
import path from "node:path";
export default {
  yasak_uygulama: ["taskmgr.exe", "perfmon.exe", "msconfig.exe", "regedit.exe"],
  ders: {
    ders_baslama: 820, //8:20
    ders_sure: 40, //dk
    tenefus: 10, //dk
    oglen_arası_sure: 40, //dk
    toplam_ders: 7,
    oglen_arası: 4,
  },
  databasePath: path.join("C:/", "ProgramData", "kilit"),
  password: "159357",
  update_interval: ms("5 dakika"),
  duyuru_interval: ms("45 dakika"),
  pin_timeout: ms("15 dakika"),
  mesaj_interval: ms("1 dakika"),
};
