import React, { useEffect, useState } from "react";
import "./PDepthCard.scss";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { depthInfo, tickerPrice } from "../api/requestData";
import useInterval from "../util/xinterval";
const PDepthCard = (props) => {
  const [askList, setAskList] = useState([]);
  const [bidList, setBidList] = useState([]);
  const [curPrice, setCurPrice] = useState("");

  useInterval(() => {
    // fetchData();
  }, 1500);

  useEffect(() => {
    fetchData();
    return () => {};
  }, []);

  const fetchData = () => {
    fetchDepthInfo();
    fetchTickerPrice();
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

  const renderAskList = () => {
    return (
      askList.length > 0 ? <List className="depth_list">
        {askList.map((item, index) => {
          return (
            <ListItem
              key={"ask-item-" + index}
              sx={{
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: "2px",
                paddingBottom: "2px",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontFamily: "Saira",
                    fontWeight: "400",
                    color: "rgb(245,76,98)",
                  }}
                >
                  {parseFloat(item[0])}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontFamily: "Saira",
                    fontWeight: "400",
                    color: "rgb(0,0,4)",
                  }}
                >
                  {parseFloat(item[1])}
                </Typography>
              </Box>
            </ListItem>
          );
        })}
      </List>:renderWaittingList("asks")
    );
  };

  const renderBidList = () => {
    return (
      bidList.length > 0 ? <List className="depth_list">
        {bidList.map((item, index) => {
          return (
            <ListItem
              key={"ask-item-" + index}
              sx={{
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: "2px",
                paddingBottom: "2px",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontFamily: "Saira",
                    fontWeight: "400",
                    color: "rgb(59,192,144)",
                  }}
                >
                  {parseFloat(item[0])}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontFamily: "Saira",
                    fontWeight: "400",
                    color: "rgb(0,0,4)",
                  }}
                >
                  {parseFloat(item[1])}
                </Typography>
              </Box>
            </ListItem>
          );
        })}
      </List>:renderWaittingList("bids")
    );
  };

  const renderPrice = () => {
    return (
      <Box
        sx={{
          paddingLeft: "25px",
          width: "100%",
          height: "50px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        {curPrice.length > 0 ? (
          <Typography
            sx={{
              fontSize: "16px",
              fontFamily: "Saira",
              fontWeight: "400",
              color: "rgb(128,128,128)",
            }}
          >
            {parseFloat(curPrice)}
          </Typography>
        ) : (
          <Skeleton animation="wave" width={"80%"} height={"60%"} />
        )}
      </Box>
    );
  };

  const renderWaittingList = (key) => {
    return (
      <List className="depth_list">
        {[0, 1, 2, 3, 4].map((item, index) => {
          return (
            <ListItem
              key={key + "waitting-item-" + index}
              sx={{
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: "2px",
                paddingBottom: "2px",
              }}
            >
              <Skeleton animation="wave" width={"100%"} />
            </ListItem>
          );
        })}
      </List>
    );
  };

  return (
    <Box className="depth_bg">
      <Box className="depth_header_box">
        <Typography
          sx={{
            fontSize: "14px",
            fontFamily: "Saira",
            fontWeight: "400",
            color: "rgb(128,128,128)",
          }}
        >
          {"价格(USDT)"}
        </Typography>
        <Typography
          sx={{
            fontSize: "14px",
            fontFamily: "Saira",
            fontWeight: "400",
            color: "rgb(128,128,128)",
          }}
        >
          {"数量(USDC)"}
        </Typography>
      </Box>
      {renderAskList()}
      {renderPrice()}
      {renderBidList()}
    </Box>
  );
};

export default React.memo(PDepthCard);
