import crypto from "node:crypto";
export function generateRandomCode(length = 6) {
  const digits = "0123456789";
  let code = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    code += digits[array[i] % digits.length];
  }

  return code;
}
