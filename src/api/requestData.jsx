import Requset from "./httpMgr";
import xglobal from "../util/xglobal";
export function testPing() {
  return Requset({
    method: "get",
    url: xglobal.inst().baseUrl+"/api/v3/ping",
  });
}

export function depthInfo() {
  return Requset({
    method: "get",
    url: xglobal.inst().baseUrl+"/api/v3/depth",
    params:{
      "symbol":"USDCUSDT",
      "limit":5
    }
  });
}

export function tickerPrice() {
  return Requset({
    method: "get",
    url: xglobal.inst().baseUrl+"/api/v3/ticker/price",
    params:{
      "symbol":"USDCUSDT",
    }
  });
}
