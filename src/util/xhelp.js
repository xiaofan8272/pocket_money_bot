export const signature = (message, key) => {
  const CryptoJS = require("crypto-js");
  let hmac = CryptoJS.HmacSHA256(message, key);
  let sig = hmac.toString(CryptoJS.enc.Hex);
  return sig;
};

export const computeDecimalCount = (num) => {
  const tNum = parseFloat(num);
  if (Math.floor(tNum) === tNum) return 0;
  return tNum.toString().split(".")[1].length || 0;
};

export const formateTime = (milliseconds) => {
  let date = new Date(milliseconds);
  return (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
}
