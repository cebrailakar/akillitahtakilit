import { generateRandomCode } from "../utils/generator";
import { Main } from "./MainController";
import QRCode from "qrcode";
export class QRController {
  main: Main;
  code = generateRandomCode();
  interval: NodeJS.Timeout;
  constructor(main: Main) {
    this.main = main;
    this.interval = this.createInterval();
  }
  createInterval() {
    this.change();
    if (this.interval) clearInterval(this.interval);
    return setInterval(
      this.change.bind(this),
      this.main.config.get("qrChangeTime") - 1000
    );
  }
  change() {
    this.code = generateRandomCode();
    QRCode.toDataURL(this.main.packet.encodePack(this.code), (error, url) => {
      if (error) console.log(error);
      this.main.window.sendMessage("qr_code", {
        url,
        changeTime: this.main.config.get("qrChangeTime"),
      });
    });
  }
}
