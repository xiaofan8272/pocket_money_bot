import { React, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import PDepthCard from "./components/PDepthCard";
import PlaceOrderCard from "./components/PlaceOrderCard";
import "./Home.scss";
import {
  testPing,
  account,
  exchangeInfo,
  openOrders,
  depthInfo,
  tickerPrice,
  getUserAsset
} from "./api/requestData";
import xglobal from "./util/xglobal";
import { defBaseUrl, baseUrlList } from "./util/xdef";
import { signature } from "./util/xhelp";
import useInterval from "./util/xinterval";
function Home() {
  const [curBaseUrl, setCurBaseUrl] = useState(defBaseUrl);
  const [pingInfo, setPingInfo] = useState({ isPing: false, info: "" });
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [exchange, setExchange] = useState({});
  const [orders, setOrders] = useState([]);
  const [askList, setAskList] = useState([]);
  const [bidList, setBidList] = useState([]);
  const [balances, setBalances] = useState([]);
  const [curPrice, setCurPrice] = useState("");

  // useInterval(() => {
  //   // fetchExchangeInfo();
  //   fetchOpenOrders();
  //   fetchDepthInfo();
  //   fetchTickerPrice();
  //   // fetchUserAsset();
  // }, 2000);

  useEffect(() => {
    fetchExchangeInfo();
    return () => {};
  }, []);

  const fetchAccount = () => {
    const apikey = xglobal.inst().apiKey;
    const apiSecret = xglobal.inst().apiSecret;
    if (apikey.length === 0 || apiSecret.length === 0) {
      return;
    }
    const timestamp = new Date().getTime();
    let message = "recvWindow=5000&timestamp=" + timestamp;
    let sig = signature(message, apiSecret);
    account(timestamp, apikey, sig)
      .then((response) => {
        const tBalances = response["balances"];
        let tFreeBalances = tBalances.filter((coinInfo) => {
          return (
            parseFloat(coinInfo.free) > 0 || parseFloat(coinInfo.locked) > 0
          );
        });
        setBalances(tFreeBalances);
        console.log(tFreeBalances);
      })
      .catch((err) => {
        console.log(String(err));
      });
  };

  const fetchOpenOrders = () => {
    const apikey = xglobal.inst().apiKey;
    const apiSecret = xglobal.inst().apiSecret;
    if (apikey.length === 0 || apiSecret.length === 0) {
      return;
    }
    const timestamp = new Date().getTime();
    let message =
      "symbol=" +
      xglobal.inst().symbol +
      "&recvWindow=5000&timestamp=" +
      timestamp;
    let sig = signature(message, apiSecret);
    openOrders(timestamp, apikey, sig)
      .then((response) => {
        console.log(response);
        setOrders(response);
      })
      .catch((err) => {
        console.log(String(err));
      });
  };

  const fetchUserAsset = () => {
    const apikey = xglobal.inst().apiKey;
    const apiSecret = xglobal.inst().apiSecret;
    if (apikey.length === 0 || apiSecret.length === 0) {
      return;
    }
    const timestamp = new Date().getTime();
    let message = "recvWindow=5000&timestamp=" + timestamp;
    let sig = signature(message, apiSecret);
    getUserAsset(timestamp,apikey,sig)
      .then((response) => {
        console.log(response);
      })
      .catch((err) => {
        console.log(String(err));
      });
  };

  const fetchExchangeInfo = () => {
    exchangeInfo()
      .then((response) => {
        console.log(response);
        setExchange(response);
      })
      .catch((err) => {
        console.log(String(err));
      });
  };

  const fetchDepthInfo = () => {
    depthInfo()
      .then((response) => {
        console.log(response);
        let asks = response["asks"];
        setAskList(asks.reverse());
        let bids = response["bids"];
        setBidList(bids);
      })
      .catch((err) => {
        console.log(String(err));
      });
  };

  const fetchTickerPrice = () => {
    tickerPrice()
      .then((response) => {
        console.log(response);
        setCurPrice(response["price"]);
      })
      .catch((err) => {
        console.log(String(err));
      });
  };

  return (
    <Box className="home_bg" maxWidth="false">
      <Box className="home_left_box">
        <Box className="home_header_box">
          <Typography
            sx={{
              marginLeft: "10px",
              // marginBottom:"10px",
              fontSize: "20px",
              fontFamily: "Saira",
              fontWeight: "600",
              color: "rgb(0,0,4)",
            }}
          >
            {xglobal.inst().baseAsset + "/" + xglobal.inst().quoteAsset}
          </Typography>
          <Typography
            sx={{
              marginLeft: "10px",
              fontSize: "15px",
              fontFamily: "Saira",
              fontWeight: "400",
              color: "rgb(0,0,4)",
            }}
          >
            {"0费率"}
          </Typography>
        </Box>

        <Box className="home_main_box">
          <PDepthCard
            bidList={bidList}
            askList={askList}
            price={curPrice}
            orders={orders}
          />
          {exchange["symbols"] !== undefined ? <PlaceOrderCard exchange={exchange} price={curPrice} /> : null} 
        </Box>
      </Box>
      <Box className="home_right_box">
        <FormGroup>
          {baseUrlList.map((item) => {
            return (
              <FormControlLabel
                key={item}
                control={
                  <Checkbox
                    checked={curBaseUrl === item}
                    onChange={() => {
                      setCurBaseUrl(item);
                      xglobal.inst().baseUrl = item;
                    }}
                  />
                }
                label={item}
              />
            );
          })}
        </FormGroup>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginTop: "20px",
          }}
        >
          <Button
            variant="contained"
            onClick={() => {
              fetchUserAsset();
              return;
              if (pingInfo.isPing) {
                return;
              }
              pingInfo.isPing = true;
              setPingInfo({ ...pingInfo });
              testPing()
                .then((response) => {
                  pingInfo.isPing = false;
                  pingInfo.info = "server connection";
                  setPingInfo({ ...pingInfo });
                  console.log(response);
                })
                .catch((err) => {
                  pingInfo.isPing = false;
                  pingInfo.info = "server not connected";
                  setPingInfo({ ...pingInfo });
                  console.log(String(err));
                });
            }}
          >
            Ping
          </Button>
          <Typography sx={{ marginLeft: "20px" }}>
            {pingInfo.isPing === true ? "ping..." : pingInfo.info}
          </Typography>
        </Box>
        <TextField
          sx={{
            marginTop: "12px",
            width: "80%",
            borderRadius: "5px",
            borderColor: "#323232",
            fontSize: "14px",
            fontFamily: "Saira",
            fontWeight: "500",
          }}
          type="password"
          value={apiKey}
          variant="outlined"
          onChange={(event) => {
            setApiKey(event.target.value);
            xglobal.inst().apiKey = event.target.value;
          }}
        />
        <TextField
          sx={{
            marginTop: "12px",
            width: "80%",
            borderRadius: "5px",
            borderColor: "#323232",
            fontSize: "14px",
            fontFamily: "Saira",
            fontWeight: "500",
          }}
          type="password"
          value={apiSecret}
          variant="outlined"
          onChange={(event) => {
            setApiSecret(event.target.value);
            xglobal.inst().apiSecret = event.target.value;
          }}
        />
      </Box>
    </Box>
  );
}

export default Home;
