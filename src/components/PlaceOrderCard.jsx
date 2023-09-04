import React, { useEffect, useState } from "react";
import "./PlaceOrderCard.scss";
import PAlertDlg from "./PAlertDlg";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { requestPlaceOrder } from "../api/requestData";
import { signature, computeDecimalCount, customToFixed } from "../util/xhelp";
import xglobal from "../util/xglobal";
//

const PlaceOrderCard = (props) => {
  const {
    apiKey,
    apiSecret,
    orders,
    bidList,
    askList,
    tarPrice,
    userAssets,
    priceFilter,
    quantityFilter,
    notional,
  } = props;
  let isOrdering = false;
  const [bidInfo, setBidInfo] = useState({
    price: "",
    offerBalance: "0",
    quantity: "0",
    percentage: "",
    turnover: "0",
  });
  const [askInfo, setAskInfo] = useState({
    price: "",
    offerBalance: "0",
    quantity: "0",
    percentage: "",
    turnover: "0",
  });

  const [autoOrder, setAutoOrder] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ visible: false, content: "" });
  //
  useEffect(() => {
    if (autoOrder === true && parseFloat(quantityFilter.maxQty) > 0) {
      const symbolFilters = orders.filter((item) => {
        return item.symbol === xglobal.inst().symbol;
      });
      if (symbolFilters.length === 0) {
        console.log("************* AUTO ORDER *************");
        //没有订单，自动下单
        const decimalCount = computeDecimalCount(quantityFilter.stepSize);
        const maxQtyNum = parseFloat(quantityFilter.maxQty);
        const minQtyNum = parseFloat(quantityFilter.minQty);

        if (
          parseFloat(bidInfo.offerBalance) > minQtyNum &&
          bidList.length > 0
        ) {
          const item = bidList[0];
          const price = parseFloat(item[0]);
          let tQty = customToFixed(
            Math.abs(parseFloat(bidInfo.offerBalance) / parseFloat(price)),
            decimalCount
          );
          if (tQty > maxQtyNum) {
            tQty = maxQtyNum;
          }
          if (tQty < minQtyNum) {
            tQty = minQtyNum;
          }
          placeOrder("BUY", tQty, price);
        }
        if (
          parseFloat(askInfo.offerBalance) > minQtyNum &&
          askList.length > 0
        ) {
          const item = askList[askList.length - 1];
          const price = parseFloat(item[0]);
          let tBalance = customToFixed(
            Math.abs(parseFloat(askInfo.offerBalance)),
            decimalCount
          );
          if (tBalance > maxQtyNum) {
            tBalance = maxQtyNum;
          }
          if (tBalance < minQtyNum) {
            tBalance = minQtyNum;
          }
          placeOrder("SELL", tBalance, price);
        }
      } else {
        //已有订单，判断下是否需要撤销订单，然后重新下单
      }
    }
  }, [orders, bidList, askList]);

  useEffect(() => {
    const assets = userAssets;
    if (assets.length > 0) {
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
    } else {
      askInfo.offerBalance = 0;
      setAskInfo({ ...askInfo });
      bidInfo.offerBalance = 0;
      setBidInfo({ ...bidInfo });
    }
  }, [userAssets]);

  useEffect(() => {
    bidInfo.price = tarPrice;
    setBidInfo({ ...bidInfo });
    askInfo.price = tarPrice;
    setAskInfo({ ...askInfo });
  }, [tarPrice]);

  const placeOrder = (side, quantity, price) => {
    if (apiKey.length === 0 || apiSecret.length === 0) {
      return;
    }
    if (isOrdering === true) {
      return;
    }
    isOrdering = true;
    const timestamp = new Date().getTime();
    let message =
      "symbol=" +
      xglobal.inst().symbol +
      "&side=" +
      side +
      "&type=LIMIT&timeInForce=GTC" +
      "&quantity=" +
      quantity +
      "&price=" +
      price +
      "&recvWindow=5000&timestamp=" +
      timestamp;
    let sig = signature(message, apiSecret);
    requestPlaceOrder(
      xglobal.inst().symbol,
      side,
      quantity,
      price,
      apiKey,
      timestamp,
      sig
    )
      .then((response) => {
        console.log(response);
        isOrdering = false;
        if (side === "BUY") {
          bidInfo.offerBalance =
            parseFloat(bidInfo.offerBalance) - parseFloat(quantity);
          setBidInfo({ ...bidInfo });
        } else {
          askInfo.offerBalance =
            parseFloat(askInfo.offerBalance) - parseFloat(quantity);
          setAskInfo({ ...askInfo });
        }
      })
      .catch((err) => {
        console.log(String(err));
        isOrdering = false;
      });
  };

  const _renderAlertDlg = () => {
    return (
      <PAlertDlg
        open={alertInfo.visible}
        content={alertInfo.content}
        close={() => {
          alertInfo.visible = false;
          alertInfo.content = "";
          setAlertInfo({ ...alertInfo });
        }}
      />
    );
  };

  return (
    <Box className="place_orders_bg">
      <Box
        sx={{
          paddingLeft: "30px",
          paddingRight: "30px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
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
            value={bidInfo.price}
            onChange={(event) => {
              const decimalCount = computeDecimalCount(priceFilter.tickSize);
              const maxPriceNum = parseFloat(priceFilter.maxPrice);
              const minPriceNum = parseFloat(priceFilter.minPrice);
              let tPrice = customToFixed(
                Math.abs(parseFloat(event.target.value)),
                decimalCount
              );
              if (maxPriceNum > 0 && tPrice > maxPriceNum) {
                tPrice = maxPriceNum;
              }
              if (minPriceNum > 0 && tPrice < minPriceNum) {
                tPrice = minPriceNum;
              }
              bidInfo.price = tPrice;
              //
              const turnoverDeciaml = computeDecimalCount(
                parseFloat(quantityFilter.stepSize) *
                  parseFloat(priceFilter.tickSize)
              );
              bidInfo.turnover = customToFixed(
                parseFloat(tPrice) * parseFloat(bidInfo.quantity),
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
              let tQty = customToFixed(
                Math.abs(parseFloat(event.target.value)),
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
              const turnoverDeciaml = computeDecimalCount(
                parseFloat(quantityFilter.stepSize) *
                  parseFloat(priceFilter.tickSize)
              );
              let tTurnover = customToFixed(
                parseFloat(tQty) * parseFloat(bidInfo.price),
                turnoverDeciaml
              );
              //
              bidInfo.turnover = tTurnover;
              bidInfo.quantity = tQty;
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
                    const turnoverDeciaml = computeDecimalCount(
                      parseFloat(quantityFilter.stepSize) *
                        parseFloat(priceFilter.tickSize)
                    );
                    let tTurnover = customToFixed(
                      parseFloat(bidInfo.offerBalance) * parseFloat(label),
                      turnoverDeciaml
                    );
                    //
                    const decimalCount = computeDecimalCount(
                      quantityFilter.stepSize
                    );
                    let tQty = customToFixed(
                      Math.abs(
                        parseFloat(tTurnover) / parseFloat(bidInfo.price)
                      ),
                      decimalCount
                    );
                    //
                    bidInfo.quantity = tQty;
                    bidInfo.turnover = tTurnover;
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
              const turnoverDeciaml = computeDecimalCount(
                parseFloat(quantityFilter.stepSize) *
                  parseFloat(priceFilter.tickSize)
              );
              let tTurnover = customToFixed(
                parseFloat(e.target.value),
                turnoverDeciaml
              );
              //
              const decimalCount = computeDecimalCount(quantityFilter.stepSize);
              let tQty = customToFixed(
                Math.abs(parseFloat(tTurnover) / parseFloat(bidInfo.price)),
                decimalCount
              );
              //
              bidInfo.turnover = tTurnover;
              bidInfo.quantity = tQty;
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
              //过滤
              const maxQtyNum = parseFloat(quantityFilter.maxQty);
              const minQtyNum = parseFloat(quantityFilter.minQty);
              let canOrder = true;
              let alerContent = "";
              if (bidInfo.quantity.length > 0) {
                alerContent = "请输入下单数量";
                canOrder = false;
              }
              if (bidInfo.quantity > maxQtyNum) {
                alerContent =
                  "下单数量大于" +
                  maxQtyNum +
                  " " +
                  xglobal.inst().baseAsset +
                  "，请调整后再试一次";
                canOrder = false;
              }
              if (bidInfo.quantity < minQtyNum) {
                alerContent =
                  "下单数量小于" +
                  minQtyNum +
                  " " +
                  xglobal.inst().baseAsset +
                  "，请调整后再试一次";
                canOrder = false;
              }
              const maxPriceNum = parseFloat(priceFilter.maxPrice);
              const minPriceNum = parseFloat(priceFilter.minPrice);
              const price = bidInfo.price;
              if (price.length > 0) {
                alerContent = "请输入下单单价";
                canOrder = false;
              }
              if (maxPriceNum > 0 && price > maxPriceNum) {
                alerContent =
                  "下单单价大于" +
                  maxPriceNum +
                  " " +
                  xglobal.inst().quoteAsset +
                  "，请调整后再试一次";
                canOrder = false;
              }
              if (minPriceNum > 0 && price < minPriceNum) {
                alerContent =
                  "下单单价小于" +
                  minPriceNum +
                  " " +
                  xglobal.inst().quoteAsset +
                  "，请调整后再试一次";
                canOrder = false;
              }
              const maxNotional = parseFloat(notional.maxNotional);
              const minNotional = parseFloat(notional.minNotional);
              if (bidInfo.turnover > maxNotional) {
                alerContent =
                  "下单总金额大于" +
                  maxNotional +
                  " " +
                  xglobal.inst().quoteAsset +
                  "，请调整后再试一次";
                canOrder = false;
              }
              if (bidInfo.turnover < minNotional) {
                alerContent =
                  "下单总金额小于" +
                  minNotional +
                  " " +
                  xglobal.inst().quoteAsset +
                  "，请调整后再试一次";
                canOrder = false;
              }
              if (bidInfo.turnover > askInfo.offerBalance) {
                alerContent =
                  "下单总金额大于 " +
                  xglobal.inst().quoteAsset +
                  " 可用余额，请调整后再试一次";
                canOrder = false;
              }

              if (canOrder === false) {
                alertInfo.visible = true;
                alertInfo.content = alerContent;
                setAlertInfo({ ...alertInfo });
                return;
              }
              placeOrder("BUY", bidInfo.quantity, price);
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
            value={askInfo.price}
            onChange={(event) => {
              const decimalCount = computeDecimalCount(priceFilter.tickSize);
              const maxPriceNum = parseFloat(priceFilter.maxPrice);
              const minPriceNum = parseFloat(priceFilter.minPrice);
              let tPrice = customToFixed(
                Math.abs(parseFloat(event.target.value)),
                decimalCount
              );
              if (maxPriceNum > 0 && tPrice > maxPriceNum) {
                tPrice = maxPriceNum;
              }
              if (minPriceNum > 0 && tPrice < minPriceNum) {
                tPrice = minPriceNum;
              }
              askInfo.price = tPrice;
              //
              const turnoverDeciaml = computeDecimalCount(
                parseFloat(quantityFilter.stepSize) *
                  parseFloat(priceFilter.tickSize)
              );
              askInfo.turnover = customToFixed(
                parseFloat(tPrice) * parseFloat(askInfo.quantity),
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
              console.log("quantityFilter", quantityFilter);
              const decimalCount = computeDecimalCount(quantityFilter.stepSize);
              const maxQtyNum = parseFloat(quantityFilter.maxQty);
              const minQtyNum = parseFloat(quantityFilter.minQty);
              let tQty = customToFixed(
                Math.abs(parseFloat(event.target.value)),
                decimalCount
              );
              if (tQty > maxQtyNum) {
                tQty = maxQtyNum;
              }
              if (tQty < minQtyNum) {
                tQty = minQtyNum;
              }

              const turnoverDeciaml = computeDecimalCount(
                parseFloat(quantityFilter.stepSize) *
                  parseFloat(priceFilter.tickSize)
              );
              let tTurnover = customToFixed(
                parseFloat(tQty) * parseFloat(askInfo.price),
                turnoverDeciaml
              );
              //
              askInfo.turnover = tTurnover;
              askInfo.quantity = tQty;
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
                    let tQty = customToFixed(
                      Math.abs(
                        parseFloat(askInfo.offerBalance) * parseFloat(label)
                      ),
                      decimalCount
                    );
                    //
                    const turnoverDeciaml = computeDecimalCount(
                      parseFloat(quantityFilter.stepSize) *
                        parseFloat(priceFilter.tickSize)
                    );
                    let tTurnover = customToFixed(
                      parseFloat(tQty) * parseFloat(askInfo.price),
                      turnoverDeciaml
                    );
                    //
                    askInfo.quantity = tQty;
                    askInfo.turnover = tTurnover;
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
              const turnoverDeciaml = computeDecimalCount(
                parseFloat(quantityFilter.stepSize) *
                  parseFloat(priceFilter.tickSize)
              );
              let tTurnover = customToFixed(
                parseFloat(e.target.value),
                turnoverDeciaml
              );
              //
              const decimalCount = computeDecimalCount(quantityFilter.stepSize);
              let tQty = customToFixed(
                Math.abs(tTurnover / parseFloat(askInfo.price)),
                decimalCount
              );
              //
              askInfo.quantity = tQty;
              askInfo.turnover = tTurnover;
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
            onClick={() => {
              //过滤
              const maxQtyNum = parseFloat(quantityFilter.maxQty);
              const minQtyNum = parseFloat(quantityFilter.minQty);
              let canOrder = true;
              let alerContent = "";
              if (askInfo.quantity.length > 0) {
                alerContent = "请输入下单数量";
                canOrder = false;
              }
              if (askInfo.quantity > maxQtyNum) {
                alerContent =
                  "下单数量大于" +
                  maxQtyNum +
                  " " +
                  xglobal.inst().baseAsset +
                  "，请调整后再试一次";
                canOrder = false;
              }
              if (askInfo.quantity < minQtyNum) {
                alerContent =
                  "下单数量小于" +
                  minQtyNum +
                  " " +
                  xglobal.inst().baseAsset +
                  "，请调整后再试一次";
                canOrder = false;
              }
              if (askInfo.quantity > bidInfo.offerBalance) {
                alerContent =
                  "下单数量大于 " +
                  xglobal.inst().baseAsset +
                  " 可用余额，请调整后再试一次";
                canOrder = false;
              }
              const maxPriceNum = parseFloat(priceFilter.maxPrice);
              const minPriceNum = parseFloat(priceFilter.minPrice);
              const price = askInfo.price;
              if (price.length > 0) {
                alerContent = "请输入下单单价";
                canOrder = false;
              }
              if (maxPriceNum > 0 && price > maxPriceNum) {
                alerContent =
                  "下单单价大于" +
                  maxPriceNum +
                  " " +
                  xglobal.inst().quoteAsset +
                  "，请调整后再试一次";
                canOrder = false;
              }
              if (minPriceNum > 0 && price < minPriceNum) {
                alerContent =
                  "下单单价小于" +
                  minPriceNum +
                  " " +
                  xglobal.inst().quoteAsset +
                  "，请调整后再试一次";
                canOrder = false;
              }
              const maxNotional = parseFloat(notional.maxNotional);
              const minNotional = parseFloat(notional.minNotional);
              if (askInfo.turnover > maxNotional) {
                alerContent =
                  "下单总金额大于" +
                  maxNotional +
                  " " +
                  xglobal.inst().quoteAsset +
                  "，请调整后再试一次";
                canOrder = false;
              }
              if (askInfo.turnover < minNotional) {
                alerContent =
                  "下单总金额小于" +
                  minNotional +
                  " " +
                  xglobal.inst().quoteAsset +
                  "，请调整后再试一次";
                canOrder = false;
              }

              if (canOrder === false) {
                alertInfo.visible = true;
                alertInfo.content = alerContent;
                setAlertInfo({ ...alertInfo });
                return;
              }

              placeOrder("SELL", askInfo.quantity, price);
            }}
          >
            {"卖出" + xglobal.inst().baseAsset}
          </Button>
        </Box>
      </Box>
      {_renderAlertDlg()}
      <Box
        sx={{
          marginTop: "40px",
          // paddingLeft: "30px",
          paddingRight: "30px",
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
          {"自动下单模式："}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            paddingLeft: "30px",
          }}
        >
          <FormControlLabel
            required
            control={
              <Switch
                checked={autoOrder}
                onChange={(ev) => {
                  setAutoOrder(ev.target.checked);
                }}
              />
            }
            label={autoOrder === true ? "已开启" : "已关闭"}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(PlaceOrderCard);
