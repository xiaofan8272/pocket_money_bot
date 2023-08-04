import React, { useEffect, useState } from "react";
import "./PlaceOrderCard.scss";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import xglobal from "../util/xglobal";
const PlaceOrderCard = (props) => {
  const {exchange,price} = props;
  const [bidInfo, setBidInfo] = useState({
    price: "",
    offerBalance: "49912.765",
    balance: "",
    percentage: "",
    turnover: "",
  });
  const [askInfo, setAskInfo] = useState({
    price: "",
    offerBalance: "",
    balance: "",
    percentage: "",
    turnover: "",
  });
  const [priceFilter, setPriceFilter] = useState({
    max: "",
    min: "",
    tickSize: "",
  });
  const [quantityFilter, setQuantityFilter] = useState({
    max: "",
    min: "",
    stepSize: "",
  });
  useEffect(() => {
    
    return () => {};
  }, []);
  const _bidPrice = ()=>{
    if(bidInfo.price.length === 0){
      return price.length === 0 ? "":parseFloat(price);
    }
    return parseFloat(bidInfo.price);
  }
  return (
    <Box className="place_orders_bg">
      <Box
        sx={{
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
            onChange={(e) => {
              bidInfo.price = e.target.value;
              setBidInfo({ ...bidInfo });
            }}
            InputProps={{
              sx: { height: "40px" },
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
            value={bidInfo.balance}
            onChange={(event) => {
              bidInfo.balance = event.target.value;
              bidInfo.percentage = "";
              setBidInfo({ ...bidInfo });
            }}
            InputProps={{
              sx: { height: "40px" },
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
                  key={"percentage-"+index}
                  onClick={() => {
                    bidInfo.percentage = label;
                    bidInfo.balance = Math.floor(parseFloat(bidInfo.offerBalance)*parseFloat(bidInfo.percentage));
                    setBidInfo({...bidInfo});
                  }}
                >
                  <Box
                    sx={{
                      height: "5px",
                      backgroundColor: bidInfo.percentage === label ? "rgb(59,192,144)": "rgb(224,225,226)",
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
                    {parseFloat(label)*100+"%"}
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
            value={bidInfo.price}
            onChange={(e) => {
              bidInfo.turnover = e.target.value;
              setBidInfo({ ...bidInfo });
            }}
            InputProps={{
              sx: { height: "40px" },
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
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(PlaceOrderCard);
