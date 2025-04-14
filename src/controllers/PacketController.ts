import crypto from "crypto";
import { Main } from "./MainController";

export class PacketController {
  main: Main;
  constructor(main: Main) {
    this.main = main;
  }
  getInfo() {
    const pass = this.main.config.get("packetPassword");
    const key = hashAndPad(pass, 32);
    const iv = hashAndPad(pass + pass, 16);
    return { key, iv };
  }
  encodePack(pack: any) {
    const info = this.getInfo();
    const cipher = crypto.createCipheriv("aes-256-cbc", info.key, info.iv);
    let encrypted = cipher.update(pack, "utf8", "base64");
    encrypted += cipher.final("base64");
    return encrypted;
  }
  decodePack(pack: any) {
    const info = this.getInfo();

    const decipher = crypto.createDecipheriv("aes-256-cbc", info.key, info.iv);
    let decrypted = decipher.update(pack, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }
}
function hashAndPad(input: crypto.BinaryLike, length: number = 32) {
  const hash = crypto.createHash("sha256").update(input).digest();
  if (hash.length >= length) {
    return hash.subarray(0, length);
  } else {
    const padded = Buffer.alloc(length);
    hash.copy(padded);
    return padded;
  }
}
