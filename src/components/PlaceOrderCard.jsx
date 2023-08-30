import React, { useEffect, useState } from "react";
import "./PlaceOrderCard.scss";
import PAlertDlg from "./PAlertDlg";
import { styled } from "@mui/material/styles";
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
    userAssets,
    priceFilter,
    quantityFilter,
    notional,
  } = props;
  const IOSSwitch = styled((props) => (
    <Switch
      focusVisibleClassName=".Mui-focusVisible"
      disableRipple
      {...props}
    />
  ))(({ theme }) => ({
    width: 42,
    height: 22,
    padding: 0,
    "& .MuiSwitch-switchBase": {
      padding: 0,
      margin: 2,
      transitionDuration: "300ms",
      "&.Mui-checked": {
        transform: "translateX(20px)",
        color: "#fff",
        "& + .MuiSwitch-track": {
          backgroundColor:
            theme.palette.mode === "dark" ? "#1C6CF9" : "#65C466", //'#2ECA45',#65C466
          opacity: 1,
          border: 0,
        },
        "&.Mui-disabled + .MuiSwitch-track": {
          opacity: 0.5,
        },
      },
      "&.Mui-focusVisible .MuiSwitch-thumb": {
        color: "#33cf4d",
        border: "6px solid #fff",
      },
      "&.Mui-disabled .MuiSwitch-thumb": {
        color:
          theme.palette.mode === "light"
            ? theme.palette.grey[100]
            : theme.palette.grey[600],
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
      },
    },
    "& .MuiSwitch-thumb": {
      boxSizing: "border-box",
      width: 18,
      height: 18,
    },
    "& .MuiSwitch-track": {
      borderRadius: 22 / 2,
      backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
      opacity: 1,
      transition: theme.transitions.create(["background-color"], {
        duration: 500,
      }),
    },
  }));
  const [bidInfo, setBidInfo] = useState({
    price: "",
    offerBalance: "0",
    quantity: "",
    percentage: "",
    turnover: "",
  });
  const [askInfo, setAskInfo] = useState({
    price: "",
    offerBalance: "0",
    quantity: "",
    percentage: "",
    turnover: "",
  });

  const [autoOrder, setAutoOrder] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  //
  useEffect(() => {
    if (autoOrder && parseFloat(quantityFilter.maxQty) > 0) {
      const symbolFilters = orders.filter((item) => {
        return item.symbol === xglobal.inst().symbol;
      });
      if (symbolFilters.length === 0) {
        console.log("autoOrder", quantityFilter);
        //没有订单，自动下单
        const decimalCount = computeDecimalCount(quantityFilter.stepSize);
        const maxQtyNum = parseFloat(quantityFilter.maxQty);
        const minQtyNum = parseFloat(quantityFilter.minQty);

        if (
          parseFloat(bidInfo.offerBalance) > minQtyNum &&
          parseFloat(askInfo.offerBalance) > minQtyNum
        ) {
        } else {
          if (parseFloat(bidInfo.offerBalance) > minQtyNum) {
            let tBalance = customToFixed(
              Math.abs(parseFloat(bidInfo.offerBalance)),
              decimalCount
            );
            if (tBalance > maxQtyNum) {
              tBalance = maxQtyNum;
            }
            if (tBalance < minQtyNum) {
              tBalance = minQtyNum;
            }
            if (bidList.length > 0) {
              const item = bidList[0];
              const price = parseFloat(item[0]);
              placeOrder("BUY", tBalance, price);
            }
          }
          if (parseFloat(askInfo.offerBalance) > minQtyNum) {
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
            if (askList.length > 0) {
              const item = askList[askList.length - 1];
              const price = parseFloat(item[0]);
              placeOrder("SELL", tBalance, price);
            }
          }
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

  const placeOrder = (side, quantity, price) => {
    if (apiKey.length === 0 || apiSecret.length === 0) {
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
      })
      .catch((err) => {
        console.log(String(err));
      });
  };

  const _bidPrice = () => {
    if (bidInfo.price.length === 0) {
      // return price.length === 0 ? "" : parseFloat(price);
      return 1.0;
    }
    return parseFloat(bidInfo.price);
  };

  const _askPrice = () => {
    if (askInfo.price.length === 0) {
      // return price.length === 0 ? "" : parseFloat(price);
      return 1.0;
    }
    return parseFloat(askInfo.price);
  };

  const _renderAlertDlg = () => {
    return (
      <PAlertDlg
        open={alertVisible}
        // note={openReport.note}
        close={() => {
          setAlertVisible(false);
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
            value={_bidPrice()}
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
                parseFloat(tPrice * bidInfo.quantity),
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
              bidInfo.quantity = tQty;
              const turnoverDeciaml = computeDecimalCount(
                parseFloat(quantityFilter.stepSize) *
                  parseFloat(priceFilter.tickSize)
              );
              bidInfo.turnover = customToFixed(
                parseFloat(tQty * bidInfo.price),
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
                    let tBalance = customToFixed(
                      Math.abs(
                        parseFloat(bidInfo.offerBalance) * parseFloat(label)
                      ),
                      decimalCount
                    );
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
                    bidInfo.turnover = customToFixed(
                      parseFloat(tBalance * bidInfo.price),
                      turnoverDeciaml
                    );
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
              placeOrder("BUY", bidInfo.quantity, bidInfo.price);
              // setAlertVisible(true);
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
              let tPrice = customToFixed(
                Math.abs(parseFloat(event.target.value)),
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
              askInfo.turnover = customToFixed(
                parseFloat(tPrice * askInfo.quantity),
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
              askInfo.quantity = tQty;
              const turnoverDeciaml = computeDecimalCount(
                parseFloat(quantityFilter.stepSize) *
                  parseFloat(priceFilter.tickSize)
              );
              askInfo.turnover = customToFixed(
                parseFloat(tQty * askInfo.price),
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
                    let tQty = customToFixed(
                      Math.abs(
                        parseFloat(askInfo.offerBalance) * parseFloat(label)
                      ),
                      decimalCount
                    );
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
                    askInfo.turnover = customToFixed(
                      parseFloat(tQty * askInfo.price),
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
            onClick={() => {
              placeOrder("SELL", askInfo.quantity, askInfo.price);
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
            paddingLeft:"30px"
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
