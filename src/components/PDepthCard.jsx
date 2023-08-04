import React, { useEffect, useState } from "react";
import "./PDepthCard.scss";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import xglobal from "../util/xglobal";
const PDepthItem = (props) => {
  const { type, item, orders } = props;
  const [hasOrder, setHasOrder] = useState(false);
  useEffect(() => {
    setHasOrder(false);
    for (let i = 0; i < orders.length; i++) {
      const tOrder = orders[i];
      if (tOrder["type"] !== "LIMIT") {
        continue;
      }
      if (tOrder["symbol"] !== xglobal.inst().symbol) {
        continue;
      }
      if (parseFloat(tOrder["price"]) === parseFloat(item[0])) {
        setHasOrder(true);
      }
    }
    return () => {};
  }, [item, orders]);
  return (
    <ListItem
      sx={{
        paddingLeft: "15px",
        paddingRight: 0,
        paddingTop: "2px",
        paddingBottom: "2px",
      }}
    >
      {hasOrder === true ? (
        <Box
          sx={{
            position: "absolute",
            left: "6px",
            width: "6px",
            height: "6px",
            backgroundColor: "rgb(240,184,59)",
            borderRadius: "3px",
          }}
        />
      ) : null}

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
            color: type === "ASK" ? "rgb(245,76,98)" : "rgb(59,192,144)",
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
};

const PDepthCard = (props) => {
  const { bidList, askList, price, orders } = props;

  const renderAskList = () => {
    return askList.length > 0 ? (
      <List className="depth_list">
        {askList.map((item, index) => {
          return (
            <PDepthItem
              key={"ask-item-" + index}
              type="ASK"
              item={item}
              orders={orders}
            />
          );
        })}
      </List>
    ) : (
      renderWaittingList("ask")
    );
  };

  const renderBidList = () => {
    return bidList.length > 0 ? (
      <List className="depth_list">
        {bidList.map((item, index) => {
          return (
            <PDepthItem
              key={"bid-item-" + index}
              type="BID"
              item={item}
              orders={orders}
            />
          );
        })}
      </List>
    ) : (
      renderWaittingList("bid")
    );
  };

  const renderCurPrice = () => {
    return (
      <Box
        sx={{
          paddingLeft: "15px",
          width: "100%",
          height: "50px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        {price.length > 0 ? (
          <Typography
            sx={{
              fontSize: "16px",
              fontFamily: "Saira",
              fontWeight: "400",
              color: "rgb(0,0,4)",
            }}
          >
            {parseFloat(price)}
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
                paddingLeft: "15px",
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
      {renderCurPrice()}
      {renderBidList()}
    </Box>
  );
};

export default React.memo(PDepthCard);
