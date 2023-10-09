//
class xglobal {
  static _inst = null;
  //
  baseUrl = "https://api.binance.com";
  //
  baseAsset = "USDC";
  quoteAsset = "USDT";
  symbol = this.baseAsset+this.quoteAsset;
  static inst() {
    if (this._inst === null) {
      this._inst = new xglobal();
    }
    return this._inst;
  }
}

export default xglobal;
