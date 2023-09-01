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
import PDelegationCard from "./components/PDelegationCard";
import "./Home.scss";
import {
  testPing,
  getUserAsset,
  exchangeInfo,
  openOrders,
  depthInfo,
  requestTickerPrice,
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
  const [orders, setOrders] = useState([]);
  const [askList, setAskList] = useState([]);
  const [bidList, setBidList] = useState([]);
  const [userAssets, setUserAssets] = useState([]);
  const [priceFilter, setPriceFilter] = useState({
    maxPrice: "0",
    minPrice: "0",
    tickSize: "0",
  });
  const [quantityFilter, setQuantityFilter] = useState({
    maxQty: "0",
    minQty: "0",
    stepSize: "0",
  });
  const [notional, setNotional] = useState({
    maxNotional: "",
    minNotional: "",
  });
  const [tickerPrice, setTickerPrice] = useState("");
  const [tarPriceInfo, setTarPriceInfo] = useState({
    price: "1.0000",
    init: false,
  });
  useInterval(() => {
    fetchUserAsset();
    fetchOpenOrders();
    fetchDepthInfo();
    fetchTickerPrice();
  }, 5000);

  useEffect(() => {
    fetchExchangeInfo();
  }, []);

  const fetchUserAsset = () => {
    if (apiKey.length === 0 || apiSecret.length === 0) {
      return;
    }
    const timestamp = new Date().getTime();
    let message = "recvWindow=5000&timestamp=" + timestamp;
    let sig = signature(message, apiSecret);
    getUserAsset(timestamp, apiKey, sig)
      .then((response) => {
        console.log(response);
        setUserAssets(response);
      })
      .catch((err) => {
        console.log(String(err));
      });
  };

  const fetchExchangeInfo = () => {
    exchangeInfo()
      .then((response) => {
        console.log("exchange info", response);
        const exchange = response;
        const filters = exchange["symbols"][0]["filters"];
        const priceFilters = filters.filter((item) => {
          return item.filterType === "PRICE_FILTER";
        });
        if (priceFilters.length > 0) {
          setPriceFilter(priceFilters[0]);
        }
        const lotSizes = filters.filter((item) => {
          return item.filterType === "LOT_SIZE";
        });
        if (lotSizes.length > 0) {
          setQuantityFilter(lotSizes[0]);
        }
        const notionals = filters.filter((item) => {
          return item.filterType === "NOTIONAL";
        });
        if (notionals.length > 0) {
          setNotional(notionals[0]);
        }
      })
      .catch((err) => {
        console.log(String(err));
      });
  };

  const fetchOpenOrders = () => {
    if (apiKey.length === 0 || apiSecret.length === 0) {
      return;
    }
    const timestamp = new Date().getTime();
    let message =
      "symbol=" +
      xglobal.inst().symbol +
      "&recvWindow=5000&timestamp=" +
      timestamp;
    let sig = signature(message, apiSecret);
    openOrders(timestamp, apiKey, sig)
      .then((response) => {
        console.log(response);
        setOrders(response);
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
        let asks_reverse = asks.reverse();
        setAskList(asks_reverse);
        let bids = response["bids"];
        setBidList(bids);
        if (tarPriceInfo.init === false && asks_reverse.length > 0) {
          const item = askList[asks_reverse.length - 1];
          const price = parseFloat(item[0]);
          tarPriceInfo.init = true;
          tarPriceInfo.price = price;
          setTarPriceInfo({ ...tarPriceInfo });
        }
      })
      .catch((err) => {
        console.log(String(err));
      });
  };

  const fetchTickerPrice = () => {
    requestTickerPrice()
      .then((response) => {
        console.log(response);
        setTickerPrice(response["price"]);
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <PDepthCard
              bidList={bidList}
              askList={askList}
              tickerPrice={tickerPrice}
              orders={orders}
              onClickCallback={(price) => {
                tarPriceInfo.price = price;
                setTarPriceInfo({ ...tarPriceInfo });
              }}
            />
            <PlaceOrderCard
              apiKey={apiKey}
              apiSecret={apiSecret}
              orders={orders}
              bidList={bidList}
              askList={askList}
              tarPrice={tarPriceInfo.price}
              userAssets={userAssets}
              priceFilter={priceFilter}
              quantityFilter={quantityFilter}
              notional={notional}
            />
          </Box>
          <Box sx={{ marginTop: "20px" }}>
            <PDelegationCard
              apiKey={apiKey}
              apiSecret={apiSecret}
              orders={orders}
              priceFilter={priceFilter}
              quantityFilter={quantityFilter}
            />
          </Box>
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
          }}
        />
      </Box>
    </Box>
  );
}

export default Home;
