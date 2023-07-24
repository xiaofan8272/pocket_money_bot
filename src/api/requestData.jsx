import Requset from "./httpMgr";
import xglobal from "../xglobal";
export function testPing() {
  return Requset({
    method: "get",
    url: xglobal.inst().baseUrl+"/api/v3/ping",
  });
}
