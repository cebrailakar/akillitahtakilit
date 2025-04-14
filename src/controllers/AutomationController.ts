import ms from "@sencinion/ms/dist/ms";
import { Main } from "./MainController";

export class AutomationController {
  main: Main;
  interval: NodeJS.Timeout;
  constructor(main: Main) {
    this.main = main;
    this.interval = this.createInterval();
  }
  credits: number = 0;
  createInterval() {
    if (this.interval) clearInterval(this.interval);
    return setInterval(this.check.bind(this), 1000);
  }
  private lastStage: string = "";
  addCredit(number: number) {
    this.credits = this.credits + number;
  }
  check() {
    if (this.credits > 2) {
      this.credits--;
      console.log(
        "Kalan kredi: " + this.credits + ` (${ms(this.credits * 1000)})`
      );
      this.main.other.command.unlockApp();
      return;
    } else if (this.credits <= 2 && this.credits !== 0) {
      this.credits = 0;
      console.log("Kapatılıyor..");
      this.main.other.command.lockApp();
      return;
    } else {
      this.credits = 0;
    }
    if (this.main.config.get("automation") !== true) return;
    const program = this.main.config.get("ders_saatleri");
    const durum = durumRapor(program);
    const aksiyonlar = durum.aksiyonlar;
    if (aksiyonlar.includes("lock")) this.main.other.command.lockApp();
    if (aksiyonlar.includes("unlock")) this.main.other.command.unlockApp();
    if (aksiyonlar.includes("close_screen") && this.lastStage !== durum.durum)
      this.main.other.command.closeScreen();
    if (aksiyonlar.includes("open_screen") && this.lastStage !== durum.durum)
      this.main.other.command.openScreen();

    if (aksiyonlar.includes("shutdown")) this.main.other.command.shutdown();
    this.lastStage = durum.durum;
  }
}
type rapor = {
  type: string;
  start: string;
  end: string;
  actions: string[];
}[];
function durumRapor(program: rapor) {
  const simdi = new Date();
  const saat = simdi.getHours().toString().padStart(2, "0");
  const dakika = simdi.getMinutes().toString().padStart(2, "0");
  const suankiZaman = `${saat}:${dakika}`;

  let suankiDurum = null;
  for (const period of program) {
    if (
      zamanKarsilastir(suankiZaman, period.start) >= 0 &&
      zamanKarsilastir(suankiZaman, period.end) < 0
    ) {
      suankiDurum = period;
      break;
    }
  }

  if (suankiDurum) {
    const uygulanacakAksiyonlar = suankiDurum.actions;

    let sonrakiDurum = null;
    const suankiIndex = program.indexOf(suankiDurum);
    if (suankiIndex < program.length - 1) {
      sonrakiDurum = program[suankiIndex + 1];
    }

    let kalanSure = "";
    if (suankiDurum.end !== "23:59") {
      const [endSaat, endDakika] = suankiDurum.end.split(":").map(Number);
      const endTotalMinutes = endSaat * 60 + endDakika;
      const simdiTotalMinutes = simdi.getHours() * 60 + simdi.getMinutes();
      const kalanDakika = endTotalMinutes - simdiTotalMinutes;

      if (kalanDakika > 60) {
        const saat = Math.floor(kalanDakika / 60);
        const dakika = kalanDakika % 60;
        kalanSure = `${saat} saat ${dakika} dakika`;
      } else {
        kalanSure = `${kalanDakika} dakika`;
      }
    }

    return {
      zaman: suankiZaman,
      durum: suankiDurum.type,
      baslangic: suankiDurum.start,
      bitis: suankiDurum.end,
      aksiyonlar: uygulanacakAksiyonlar,
      kalanSure: kalanSure,
    };
  } else {
    return {
      zaman: suankiZaman,
      durum: "Tanımlanmamış zaman dilimi",
      aksiyonlar: "Hiçbir aksiyon yok",
    };
  }
}
function zamanKarsilastir(zaman1: string, zaman2: string) {
  const [saat1, dakika1] = zaman1.split(":").map(Number);
  const [saat2, dakika2] = zaman2.split(":").map(Number);

  if (saat1 < saat2) return -1;
  if (saat1 > saat2) return 1;
  if (dakika1 < dakika2) return -1;
  if (dakika1 > dakika2) return 1;
  return 0;
}
