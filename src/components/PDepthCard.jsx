import React, { useEffect, useState } from "react";
import "./PDepthCard.scss";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";

const PDepthItem = (props) => {
  const { type, item, orders } = props;
  const [hasOrder, setHasOrder] = useState(false);
  useEffect(() => {
    setHasOrder(false);
    for(let i = 0;i<orders.length;i++){
      const tOrder = orders[i];
      if(tOrder["type"] !== "LIMIT"){
        continue;
      }
      if(tOrder["symbol"] !== "USDCUSDT"){
        continue;
      }
      if(parseFloat(tOrder["price"]) === parseFloat(item[0])){
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
            left: "5px",
            width: "4px",
            height: "4px",
            backgroundColor: "rgb(240,184,59)",
            borderRadius: "2px",
            marginRight: "5px",
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
            color: type === "SELL" ? "rgb(245,76,98)" : "rgb(59,192,144)",
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
  const { buyList, sellList, price, orders } = props;


  // useEffect(() => {
  //   fetchData();
  //   return () => {};
  // }, []);

  const renderSellList = () => {
    return sellList.length > 0 ? (
      <List className="depth_list">
        {sellList.map((item, index) => {
          return (
            <PDepthItem
              key={"sell-item-" + index}
              type="SELL"
              item={item}
              orders={orders}
            />
          );
        })}
      </List>
    ) : (
      renderWaittingList("sell")
    );
  };

  const renderBuyList = () => {
    return buyList.length > 0 ? (
      <List className="depth_list">
        {buyList.map((item, index) => {
          return (
            <PDepthItem
              key={"buy-item-" + index}
              type="BUY"
              item={item}
              orders={orders}
            />
          );
        })}
      </List>
    ) : (
      renderWaittingList("buy")
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
              color: "rgb(128,128,128)",
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
      {renderSellList()}
      {renderCurPrice()}
      {renderBuyList()}
    </Box>
  );
};

export default React.memo(PDepthCard);
