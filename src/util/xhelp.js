export const signature = (message, key) => {
  const CryptoJS = require("crypto-js");
  let hmac = CryptoJS.HmacSHA256(message, key);
  let sig = hmac.toString(CryptoJS.enc.Hex);
  return sig;
};
