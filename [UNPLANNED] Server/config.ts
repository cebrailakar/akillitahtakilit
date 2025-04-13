import ms from "@sencinion/ms";
import path from "node:path";
export default {
  ders_baslama: 8.3,
  ders_bitis: 17.3,
  ders_sure: 4,
  tenefus_sure: 10,
  ilk_ara: 4,
  ikinci_ara: 2,
  oglen_arasi_sure: 60,
  databasePath: path.join("C:/", "ProgramData", "kilit"),
  password: "159357",
  update_interval: ms("1 dakika"),
  duyuru_interval: ms("45 dakika"),
  pin_timeout: ms("15 dakika"),
};
