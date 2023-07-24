//
export let defBaseUrl = "https://api.binance.com";
class xglobal {
  static _inst = null;
  //
  baseUrl = defBaseUrl;
  static inst() {
    if (this._inst === null) {
      this._inst = new xglobal();
    }
    return this._inst;
  }
  //
}

export default xglobal;
