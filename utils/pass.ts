import crypto from "crypto";
import config from "../config";

export function encodePack(pack: any, pass: string) {
  const key = hashAndPad(pass, 32);
  const iv = hashAndPad(pass + "iv", 16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(pack, "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
}
export function decodePack(encryptedPack: string, pass: string) {
  const key = hashAndPad(pass, 32);
  const iv = hashAndPad(pass + "iv", 16);
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedPack, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

function hashAndPad(input, length) {
  const hash = crypto.createHash("sha256").update(input).digest();
  if (hash.length >= length) {
    return hash.subarray(0, length);
  } else {
    const padded = Buffer.alloc(length);
    hash.copy(padded);
    return padded;
  }
}
