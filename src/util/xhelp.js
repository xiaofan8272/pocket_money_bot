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

export const customToFixed = (num, decimalCount) => {
  const tNum = parseFloat(num);
  const tDecimalCount = parseInt(decimalCount);
  if(tDecimalCount > 0){
    const tempCount = Math.pow(10, tDecimalCount);
    return Math.floor(tNum * tempCount) / tempCount;
  }
  return Math.floor(num);

};

export const formateTime = (milliseconds) => {
  let date = new Date(milliseconds);
  return (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
}
