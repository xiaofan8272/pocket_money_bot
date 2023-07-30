import Requset from "./httpMgr";
import xglobal from "../util/xglobal";
export function testPing() {
  return Requset({
    method: "get",
    url: xglobal.inst().baseUrl + "/api/v3/ping",
  });
}

export function depthInfo() {
  return Requset({
    method: "get",
    url: xglobal.inst().baseUrl + "/api/v3/depth",
    params: {
      symbol: "USDCUSDT",
      limit: 5,
    },
  });
}

export function tickerPrice() {
  return Requset({
    method: "get",
    url: xglobal.inst().baseUrl + "/api/v3/ticker/price",
    params: {
      symbol: "USDCUSDT",
    },
  });
}

export function openOrders(timestamp, apiKey, sig) {
  return Requset({
    method: "get",
    url: xglobal.inst().baseUrl + "/api/v3/openOrders",
    extHeaders: {
      "X-MBX-APIKEY": apiKey,
    },
    params: {
      symbol: "USDCUSDT",
      recvWindow: 5000,
      timestamp: timestamp,
      signature: sig,
    },
  });
}

export function account(timestamp, apiKey, sig) {
  return Requset({
    method: "get",
    url: xglobal.inst().baseUrl + "/api/v3/account",
    // headers: {
    //   'content-type': 'application/json',
    //   "X-MBX-APIKEY":apiKey
    // },
    extHeaders: {
      "X-MBX-APIKEY": apiKey,
    },
    params: {
      recvWindow: 5000,
      timestamp: timestamp,
      // apiKey: apiKey,
      signature: sig,
    },
  });
}
