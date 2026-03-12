import CryptoJS from "crypto-js";

const secretKey = "61553794402181761075972151624328";

export function decrypt(encryptedText: string): any {
  const aesDecryptedBytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
  const aesDecrypted = aesDecryptedBytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(aesDecrypted);
}
