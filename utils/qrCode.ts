import config from "../config";
import { encodePack } from "./pass";
import QRCode from "qrcode";
export function generateRandomCode() {
  return Math.floor(100000 + Math.random() * 900000);
}
export function generateQRCode(number: number) {
  const encoded = encodePack(number.toString(), config.password);
  return new Promise((a, r) => {
    QRCode.toDataURL(encoded, (error, url) => {
      if (error) r(error);
      a(url);
    });
  });
}
