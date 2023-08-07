import React, { useEffect, useState } from "react";
import "./PlaceOrderCard.scss";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import { getUserAsset, requestPlaceOrder } from "../api/requestData";
import xglobal from "../util/xglobal";
import { computeDecimalCount } from "../util/xhelp";
import { signature } from "../util/xhelp";
const PlaceOrderCard = (props) => {
  const { exchange, price } = props;
  const [bidInfo, setBidInfo] = useState({
    price: "",
    offerBalance: "49912.765",
    quantity: "",
    percentage: "",
    turnover: "",
  });
  const [askInfo, setAskInfo] = useState({
    price: "",
    offerBalance: "",
    quantity: "",
    percentage: "",
    turnover: "",
  });
  const [priceFilter, setPriceFilter] = useState({
    maxPrice: "",
    minPrice: "",
    tickSize: "",
  });
  const [quantityFilter, setQuantityFilter] = useState({
    maxQty: "",
    minQty: "",
    stepSize: "",
  });
  const [notional, setNotional] = useState({
    maxNotional: "",
    minNotional: "",
  });
  useEffect(() => {
    const filters = exchange["symbols"][0]["filters"];
    const priceFilters = filters.filter((item) => {
      return item.filterType === "PRICE_FILTER";
    });
    if (priceFilters.length > 0) {
      setPriceFilter(priceFilters[0]);
    }
    const lostSizes = filters.filter((item) => {
      return item.filterType === "LOT_SIZE";
    });
    if (lostSizes.length > 0) {
      setQuantityFilter(lostSizes[0]);
    }
    const notionals = filters.filter((item) => {
      return item.filterType === "NOTIONAL";
    });
    if (notionals.length > 0) {
      setNotional(notionals[0]);
    }
  }, []);

  useEffect(() => {
    ///
    fetchUserAsset();
  }, []);

  const fetchUserAsset = () => {
    const apikey = xglobal.inst().apiKey;
    const apiSecret = xglobal.inst().apiSecret;
    if (apikey.length === 0 || apiSecret.length === 0) {
      return;
    }
    const timestamp = new Date().getTime();
    let message = "recvWindow=5000&timestamp=" + timestamp;
    let sig = signature(message, apiSecret);
    getUserAsset(timestamp, apikey, sig)
      .then((response) => {
        console.log(response);
        const assets = response;
        for (let index = 0; index < assets.length; index++) {
          const asset = assets[index];
          if (asset["asset"] === xglobal.inst().baseAsset) {
            askInfo.offerBalance = asset["free"];
            setAskInfo({ ...askInfo });
          }
          if (asset["asset"] === xglobal.inst().quoteAsset) {
            bidInfo.offerBalance = asset["free"];
            setBidInfo({ ...bidInfo });
          }
        }
      })
      .catch((err) => {
        console.log(String(err));
      });
  };

  const placeOrder = (side) => {
    const apikey = xglobal.inst().apiKey;
    const apiSecret = xglobal.inst().apiSecret;
    if (apikey.length === 0 || apiSecret.length === 0) {
      return;
    }
    const timestamp = new Date().getTime();
    let message =
      "symbol=" +
      xglobal.inst().symbol +
      "&side=" +
      side +
      "&type=LIMIT&timeInForce=GTC" +
      "&quantity=" +
      bidInfo.quantity +
      "&price=" +
      bidInfo.price +
      "&recvWindow=5000&timestamp=" +
      timestamp;
    let sig = signature(message, apiSecret);
    requestPlaceOrder(
      xglobal.inst().symbol,
      side,
      bidInfo.quantity,
      bidInfo.price,
      apikey,
      timestamp,
      sig
    )
      .then((response) => {
        console.log(response);
      })
      .catch((err) => {
        console.log(String(err));
      });
  };

  const _bidPrice = () => {
    if (bidInfo.price.length === 0) {
      return price.length === 0 ? "" : parseFloat(price);
    }
    return parseFloat(bidInfo.price);
  };

  const _askPrice = () => {
    if (askInfo.price.length === 0) {
      return price.length === 0 ? "" : parseFloat(price);
    }
    return parseFloat(askInfo.price);
  };

  return (
    <Box className="place_orders_bg">
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Box
          sx={{
            width: "45%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
          }}
        >
          <Typography
            sx={{
              fontSize: "14px",
              fontFamily: "Saira",
              fontWeight: "400",
              color: "rgb(0,0,4)",
            }}
          >
            {"可用: " + bidInfo.offerBalance + xglobal.inst().quoteAsset}
          </Typography>
          <TextField
            sx={{
              marginTop: "15px",
              width: "95%",
              "&.MuiInputBase-root": {
                height: "30px",
              },
            }}
            type="number"
            value={_bidPrice()}
            onChange={(event) => {
              const decimalCount = computeDecimalCount(priceFilter.tickSize);
              const maxPriceNum = parseFloat(priceFilter.maxPrice);
              const minPriceNum = parseFloat(priceFilter.minPrice);
              let tPrice = Math.abs(parseFloat(event.target.value)).toFixed(
                decimalCount
              );
              if (tPrice > maxPriceNum) {
                tPrice = maxPriceNum;
              }
              if (tPrice < minPriceNum) {
                tPrice = minPriceNum;
              }
              bidInfo.price = tPrice;
              //
              const turnoverDeciaml = computeDecimalCount(
                parseFloat(quantityFilter.stepSize) *
                  parseFloat(priceFilter.tickSize)
              );
              bidInfo.turnover = parseFloat(tPrice * bidInfo.quantity).toFixed(
                turnoverDeciaml
              );
              setBidInfo({ ...bidInfo });
            }}
            InputProps={{
              inputProps: {
                style: { textAlign: "right", paddingRight: "5px" },
              },
              startAdornment: (
                <InputAdornment position="start">
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontFamily: "Saira",
                      fontWeight: "400",
                      color: "rgba(0,0,4,0.5)",
                    }}
                  >
                    {"价格"}
                  </Typography>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="start">
                  {" "}
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontFamily: "Saira",
                      fontWeight: "400",
                      color: "rgba(0,0,4,1)",
                    }}
                  >
                    {xglobal.inst().quoteAsset}
                  </Typography>
                </InputAdornment>
              ),
            }}
            variant="outlined"
          />
          <TextField
            sx={{
              marginTop: "15px",
              width: "95%",
              "&.MuiInputBase-root": {
                height: "30px",
              },
            }}
            type="number"
            value={bidInfo.quantity}
            onChange={(event) => {
              const decimalCount = computeDecimalCount(quantityFilter.stepSize);
              const maxQtyNum = parseFloat(quantityFilter.maxQty);
              const minQtyNum = parseFloat(quantityFilter.minQty);
              let tQty = Math.abs(parseFloat(event.target.value)).toFixed(
                decimalCount
              );
              //
              if (tQty > maxQtyNum) {
                tQty = maxQtyNum;
              }
              if (tQty < minQtyNum) {
                tQty = minQtyNum;
              }
              //
              bidInfo.quantity = tQty;
              const turnoverDeciaml = computeDecimalCount(
                parseFloat(quantityFilter.stepSize) *
                  parseFloat(priceFilter.tickSize)
              );
              bidInfo.turnover = parseFloat(tQty * bidInfo.price).toFixed(
                turnoverDeciaml
              );
              bidInfo.percentage = "";
              setBidInfo({ ...bidInfo });
            }}
            InputProps={{
              inputProps: {
                style: { textAlign: "right", paddingRight: "5px" },
              },
              startAdornment: (
                <InputAdornment position="start">
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: "400",
                      color: "rgba(0,0,4,0.5)",
                    }}
                  >
                    {"数量"}
                  </Typography>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="start">
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: "400",
                      color: "rgba(0,0,4,1)",
                    }}
                  >
                    {xglobal.inst().baseAsset}
                  </Typography>
                </InputAdornment>
              ),
            }}
            variant="outlined"
          />
          <Box
            sx={{
              marginTop: "10px",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              width: "95%",
            }}
          >
            {["0.25", "0.5", "0.75", "1.0"].map((label, index) => {
              return (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    width: "15%",
                    cursor: "pointer",
                  }}
                  key={"percentage-" + index}
                  onClick={() => {
                    const decimalCount = computeDecimalCount(
                      quantityFilter.stepSize
                    );
                    const maxQtyNum = parseFloat(quantityFilter.maxQty);
                    const minQtyNum = parseFloat(quantityFilter.minQty);
                    let tBalance = Math.abs(
                      parseFloat(bidInfo.offerBalance) * parseFloat(label)
                    ).toFixed(decimalCount);
                    if (tBalance > maxQtyNum) {
                      tBalance = maxQtyNum;
                    }
                    if (tBalance < minQtyNum) {
                      tBalance = minQtyNum;
                    }
                    bidInfo.quantity = tBalance;
                    //
                    const turnoverDeciaml = computeDecimalCount(
                      parseFloat(quantityFilter.stepSize) *
                        parseFloat(priceFilter.tickSize)
                    );
                    bidInfo.turnover = parseFloat(
                      tBalance * bidInfo.price
                    ).toFixed(turnoverDeciaml);
                    bidInfo.percentage = label;
                    setBidInfo({ ...bidInfo });
                  }}
                >
                  <Box
                    sx={{
                      height: "5px",
                      backgroundColor:
                        bidInfo.percentage === label
                          ? "rgb(59,192,144)"
                          : "rgb(224,225,226)",
                      width: "100%",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "10px",
                      fontWeight: "400",
                      color: "rgb(128,128,128)",
                    }}
                  >
                    {parseFloat(label) * 100 + "%"}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          <TextField
            sx={{
              marginTop: "15px",
              width: "95%",
              "&.MuiInputBase-root": {
                height: "30px",
              },
            }}
            type="number"
            value={bidInfo.turnover}
            onChange={(e) => {
              bidInfo.turnover = e.target.value;
              setBidInfo({ ...bidInfo });
            }}
            InputProps={{
              inputProps: {
                style: { textAlign: "right", paddingRight: "5px" },
              },
              startAdornment: (
                <InputAdornment position="start">
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: "400",
                      color: "rgba(0,0,4,0.5)",
                    }}
                  >
                    {"成交额"}
                  </Typography>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="start">
                  {" "}
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: "400",
                      color: "rgba(0,0,4,1)",
                    }}
                  >
                    {xglobal.inst().quoteAsset}
                  </Typography>
                </InputAdornment>
              ),
            }}
            variant="outlined"
          />
          <Button
            variant="contained"
            sx={{
              marginTop: "15px",
              width: "95%",
              backgroundColor: "rgb(51,189,137)",
              "&:hover": {
                backgroundColor: "rgb(51,209,137)",
              },
            }}
            onClick={() => {
              placeOrder("BUY");
            }}
          >
            {"买入" + xglobal.inst().baseAsset}
          </Button>
        </Box>
        <Box
          sx={{
            width: "45%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
          }}
        >
          <Typography
            sx={{
              fontSize: "14px",
              fontFamily: "Saira",
              fontWeight: "400",
              color: "rgb(0,0,4)",
            }}
          >
            {"可用: " + askInfo.offerBalance + xglobal.inst().baseAsset}
          </Typography>
          <TextField
            sx={{
              marginTop: "15px",
              width: "95%",
              "&.MuiInputBase-root": {
                height: "30px",
              },
            }}
            type="number"
            value={_askPrice()}
            onChange={(event) => {
              const decimalCount = computeDecimalCount(priceFilter.tickSize);
              const maxPriceNum = parseFloat(priceFilter.maxPrice);
              const minPriceNum = parseFloat(priceFilter.minPrice);
              let tPrice = Math.abs(parseFloat(event.target.value)).toFixed(
                decimalCount
              );
              if (tPrice > maxPriceNum) {
                tPrice = maxPriceNum;
              }
              if (tPrice < minPriceNum) {
                tPrice = minPriceNum;
              }
              askInfo.price = tPrice;
              //
              const turnoverDeciaml = computeDecimalCount(
                parseFloat(quantityFilter.stepSize) *
                  parseFloat(priceFilter.tickSize)
              );
              askInfo.turnover = parseFloat(tPrice * askInfo.quantity).toFixed(
                turnoverDeciaml
              );
              setAskInfo({ ...askInfo });
            }}
            InputProps={{
              inputProps: {
                style: { textAlign: "right", paddingRight: "5px" },
              },
              startAdornment: (
                <InputAdornment position="start">
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontFamily: "Saira",
                      fontWeight: "400",
                      color: "rgba(0,0,4,0.5)",
                    }}
                  >
                    {"价格"}
                  </Typography>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="start">
                  {" "}
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontFamily: "Saira",
                      fontWeight: "400",
                      color: "rgba(0,0,4,1)",
                    }}
                  >
                    {xglobal.inst().quoteAsset}
                  </Typography>
                </InputAdornment>
              ),
            }}
            variant="outlined"
          />
          <TextField
            sx={{
              marginTop: "15px",
              width: "95%",
              "&.MuiInputBase-root": {
                height: "30px",
              },
            }}
            type="number"
            value={askInfo.quantity}
            onChange={(event) => {
              const decimalCount = computeDecimalCount(quantityFilter.stepSize);
              const maxQtyNum = parseFloat(quantityFilter.maxQty);
              const minQtyNum = parseFloat(quantityFilter.minQty);
              let tQty = Math.abs(parseFloat(event.target.value)).toFixed(
                decimalCount
              );
              //
              if (tQty > maxQtyNum) {
                tQty = maxQtyNum;
              }
              if (tQty < minQtyNum) {
                tQty = minQtyNum;
              }
              //
              askInfo.quantity = tQty;
              const turnoverDeciaml = computeDecimalCount(
                parseFloat(quantityFilter.stepSize) *
                  parseFloat(priceFilter.tickSize)
              );
              askInfo.turnover = parseFloat(tQty * askInfo.price).toFixed(
                turnoverDeciaml
              );
              askInfo.percentage = "";
              setAskInfo({ ...askInfo });
            }}
            InputProps={{
              inputProps: {
                style: { textAlign: "right", paddingRight: "5px" },
              },
              startAdornment: (
                <InputAdornment position="start">
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: "400",
                      color: "rgba(0,0,4,0.5)",
                    }}
                  >
                    {"数量"}
                  </Typography>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="start">
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: "400",
                      color: "rgba(0,0,4,1)",
                    }}
                  >
                    {xglobal.inst().baseAsset}
                  </Typography>
                </InputAdornment>
              ),
            }}
            variant="outlined"
          />
          <Box
            sx={{
              marginTop: "10px",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              width: "95%",
            }}
          >
            {["0.25", "0.5", "0.75", "1.0"].map((label, index) => {
              return (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    width: "15%",
                    cursor: "pointer",
                  }}
                  key={"percentage-" + index}
                  onClick={() => {
                    const decimalCount = computeDecimalCount(
                      quantityFilter.stepSize
                    );
                    const maxQtyNum = parseFloat(quantityFilter.maxQty);
                    const minQtyNum = parseFloat(quantityFilter.minQty);
                    let tQty = Math.abs(
                      parseFloat(askInfo.offerBalance) * parseFloat(label)
                    ).toFixed(decimalCount);
                    if (tQty > maxQtyNum) {
                      tQty = maxQtyNum;
                    }
                    if (tQty < minQtyNum) {
                      tQty = minQtyNum;
                    }
                    askInfo.quantity = tQty;
                    //
                    const turnoverDeciaml = computeDecimalCount(
                      parseFloat(quantityFilter.stepSize) *
                        parseFloat(priceFilter.tickSize)
                    );
                    askInfo.turnover = parseFloat(tQty * askInfo.price).toFixed(
                      turnoverDeciaml
                    );
                    askInfo.percentage = label;
                    setAskInfo({ ...askInfo });
                  }}
                >
                  <Box
                    sx={{
                      height: "5px",
                      backgroundColor:
                        askInfo.percentage === label
                          ? "rgb(245,75,95)"
                          : "rgb(224,225,226)",
                      width: "100%",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "10px",
                      fontWeight: "400",
                      color: "rgb(128,128,128)",
                    }}
                  >
                    {parseFloat(label) * 100 + "%"}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          <TextField
            sx={{
              marginTop: "15px",
              width: "95%",
              "&.MuiInputBase-root": {
                height: "30px",
              },
            }}
            type="number"
            value={askInfo.turnover}
            onChange={(e) => {
              askInfo.turnover = e.target.value;
              setBidInfo({ ...askInfo });
            }}
            InputProps={{
              inputProps: {
                style: { textAlign: "right", paddingRight: "5px" },
              },
              startAdornment: (
                <InputAdornment position="start">
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: "400",
                      color: "rgba(0,0,4,0.5)",
                    }}
                  >
                    {"成交额"}
                  </Typography>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="start">
                  {" "}
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: "400",
                      color: "rgba(0,0,4,1)",
                    }}
                  >
                    {xglobal.inst().quoteAsset}
                  </Typography>
                </InputAdornment>
              ),
            }}
            variant="outlined"
          />
          <Button
            variant="contained"
            sx={{
              marginTop: "15px",
              width: "95%",
              backgroundColor: "rgb(245,75,95)",
              "&:hover": {
                backgroundColor: "rgb(270,75,120)",
              },
            }}
            onClick={() => {}}
          >
            {"卖出" + xglobal.inst().baseAsset}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(PlaceOrderCard);
