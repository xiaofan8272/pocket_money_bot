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
      symbol: xglobal.inst().symbol,
      limit: 10,
    },
  });
}

export function exchangeInfo() {
  return Requset({
    method: "get",
    url: xglobal.inst().baseUrl + "/api/v3/exchangeInfo",
    params: {
      symbol: xglobal.inst().symbol,
    },
  });
}

export function getUserAsset(timestamp, apiKey, sig) {
  return Requset({
    method: "post",
    url: xglobal.inst().baseUrl + "/sapi/v3/asset/getUserAsset",
    extHeaders: {
      "X-MBX-APIKEY": apiKey,
    },
    params: {
      recvWindow: 5000,
      timestamp: timestamp,
      signature: sig,
    },
  });
}

export function tickerPrice() {
  return Requset({
    method: "get",
    url: xglobal.inst().baseUrl + "/api/v3/ticker/price",
    params: {
      symbol: xglobal.inst().symbol,
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
      symbol: xglobal.inst().symbol,
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
    extHeaders: {
      "X-MBX-APIKEY": apiKey,
    },
    params: {
      recvWindow: 5000,
      timestamp: timestamp,
      signature: sig,
    },
  });
}

export function requestPlaceOrder(
  symbol,
  side,
  quantity,
  price,
  apiKey,
  timestamp,
  sig
) {
  return Requset({
    method: "post",
    url: xglobal.inst().baseUrl + "/api/v3/order",
    extHeaders: {
      "X-MBX-APIKEY": apiKey,
    },
    params: {
      symbol: symbol,
      side: side,
      type: "LIMIT",
      timeInForce: "GTC",
      quantity: quantity,
      price: price,
      recvWindow: 5000,
      timestamp: timestamp,
      signature: sig,
    },
  });
}

export function requestDeleteOrder(
  symbol,
  orderId,
  apiKey,
  timestamp,
  sig
) {
  return Requset({
    method: "delete",
    url: xglobal.inst().baseUrl + "/api/v3/order",
    extHeaders: {
      "X-MBX-APIKEY": apiKey,
    },
    params: {
      symbol: symbol,
      orderId: orderId,
      recvWindow: 5000,
      timestamp: timestamp,
      signature: sig,
    },
  });
}
