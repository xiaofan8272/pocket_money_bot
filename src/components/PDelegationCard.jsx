import React, { useEffect, useState } from "react";
import "./PDepthCard.scss";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PNorDlg from "./PNorDlg";
import { signature, formateTime } from "../util/xhelp";
import { requestDeleteOrder } from "../api/requestData";
import xglobal from "../util/xglobal";
const PDelegationCard = (props) => {
  const { orders, apiKey, apiSecret } = props;
  const [dlgInfo, setDlgInfo] = useState({ visible: false, orderId: "" });
  let requesting = false;
  const _requestDeleteOrder = () => {
    if (requesting === true) {
      return;
    }
    if (dlgInfo.orderId.length === 0) {
      return;
    }
    if (apiKey.length === 0 || apiSecret.length === 0) {
      return;
    }

    const timestamp = new Date().getTime();
    let message =
      "symbol=" +
      xglobal.inst().symbol +
      "&orderId=" +
      dlgInfo.orderId +
      "&recvWindow=5000&timestamp=" +
      timestamp;
    let sig = signature(message, apiSecret);
    requestDeleteOrder(xglobal.inst().symbol, dlgInfo.orderId, apiKey, timestamp, sig)
      .then((response) => {
        console.log(response);
        requesting = false;
        dlgInfo.visible = false;
        dlgInfo.orderId = "";
        setDlgInfo({ ...dlgInfo });
      })
      .catch((err) => {
        console.log(String(err));
        requesting = false;
        dlgInfo.visible = false;
        dlgInfo.orderId = "";
        setDlgInfo({ ...dlgInfo });
      });
  };
  return (
    <Box className="delegation_bg">
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          paddingLeft: "15px",
          paddingRight: "15px",
        }}
      >
        <Typography
          sx={{
            textAlign: "left",
            width: "12%",
            fontSize: "14px",
            fontFamily: "Saira",
            fontWeight: "400",
            color: "rgb(128,128,128)",
          }}
        >
          {"日期"}
        </Typography>
        <Typography
          sx={{
            textAlign: "left",
            width: "12%",
            fontSize: "14px",
            fontFamily: "Saira",
            fontWeight: "400",
            color: "rgb(128,128,128)",
          }}
        >
          {"交易对"}
        </Typography>
        <Typography
          sx={{
            textAlign: "left",
            width: "12%",
            fontSize: "14px",
            fontFamily: "Saira",
            fontWeight: "400",
            color: "rgb(128,128,128)",
          }}
        >
          {"交易类型"}
        </Typography>
        <Typography
          sx={{
            textAlign: "left",
            width: "8%",
            fontSize: "14px",
            fontFamily: "Saira",
            fontWeight: "400",
            color: "rgb(128,128,128)",
          }}
        >
          {"方向"}
        </Typography>
        <Typography
          sx={{
            textAlign: "left",
            width: "12%",
            fontSize: "14px",
            fontFamily: "Saira",
            fontWeight: "400",
            color: "rgb(128,128,128)",
          }}
        >
          {"价格"}
        </Typography>
        <Typography
          sx={{
            textAlign: "left",
            width: "12%",
            fontSize: "14px",
            fontFamily: "Saira",
            fontWeight: "400",
            color: "rgb(128,128,128)",
          }}
        >
          {"数量"}
        </Typography>
        <Typography
          sx={{
            textAlign: "left",
            width: "12%",
            fontSize: "14px",
            fontFamily: "Saira",
            fontWeight: "400",
            color: "rgb(128,128,128)",
          }}
        >
          {"金额"}
        </Typography>
      </Box>
      {orders.map((item, index) => {
        return item.isWorking === true && item.type === "LIMIT" ? (
          <Box
            key={"order-" + index}
            sx={{
              marginTop: "5px",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              paddingLeft: "15px",
              paddingRight: "15px",
            }}
          >
            <Typography
              sx={{
                textAlign: "left",
                width: "12%",
                fontSize: "12px",
                fontFamily: "Saira",
                fontWeight: "400",
                color: "rgb(0,0,4)",
              }}
            >
              {formateTime(item.time)}
            </Typography>
            <Typography
              sx={{
                textAlign: "left",
                width: "12%",
                fontSize: "12px",
                fontFamily: "Saira",
                fontWeight: "400",
                color: "rgb(0,0,4)",
              }}
            >
              {item.symbol}
            </Typography>
            <Typography
              sx={{
                textAlign: "left",
                width: "12%",
                fontSize: "12px",
                fontFamily: "Saira",
                fontWeight: "400",
                color: "rgb(0,0,4)",
              }}
            >
              {"限价委托"}
            </Typography>
            <Typography
              sx={{
                textAlign: "left",
                width: "8%",
                fontSize: "12px",
                fontFamily: "Saira",
                fontWeight: "400",
                color: "rgb(0,0,4)",
              }}
            >
              {item.side}
            </Typography>
            <Typography
              sx={{
                textAlign: "left",
                width: "12%",
                fontSize: "12px",
                fontFamily: "Saira",
                fontWeight: "400",
                color: "rgb(0,0,4)",
              }}
            >
              {parseFloat(item.price)}
            </Typography>
            <Typography
              sx={{
                textAlign: "left",
                width: "12%",
                fontSize: "12px",
                fontFamily: "Saira",
                fontWeight: "400",
                color: "rgb(0,0,4)",
              }}
            >
              {parseFloat(item.origQty)}
            </Typography>
            <Typography
              sx={{
                textAlign: "left",
                width: "12%",
                fontSize: "12px",
                fontFamily: "Saira",
                fontWeight: "400",
                color: "rgb(0,0,4)",
              }}
            >
              {parseFloat(item.origQty * item.price)}
            </Typography>
            <Typography
              sx={{
                marginLeft: "20px",
                textAlign: "left",
                fontSize: "12px",
                fontFamily: "Saira",
                fontWeight: "400",
                color: "rgb(11,117,201)",
                cursor: "pointer",
              }}
              onClick={() => {
                dlgInfo.visible = true;
                dlgInfo.orderId = item.orderId;
                setDlgInfo({ ...dlgInfo });
              }}
            >
              {"撤销"}
            </Typography>
          </Box>
        ) : null;
      })}
      <PNorDlg
        open={dlgInfo.visible}
        title={"取消委托"}
        content={"是否要取消委托？"}
        close={() => {
          dlgInfo.visible = false;
          dlgInfo.orderId = "";
          setDlgInfo({ ...dlgInfo });
        }}
        confirm={() => {
          _requestDeleteOrder();
        }}
      />
    </Box>
  );
};

export default React.memo(PDelegationCard);
