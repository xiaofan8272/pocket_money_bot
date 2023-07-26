import React, { useEffect, useState } from "react";
import "./PDepthCard.scss";
import Box from "@mui/material/Box";
import { depthInfo } from "./api/requestData";
const PDepthCard = (props) => {
  useEffect(() => {
    fetchDepthInfo();
    return () => {};
  }, []);

  const fetchDepthInfo = () => {
    depthInfo()
      .then((response) => {
        console.log(response);
      })
      .catch((err) => {
        console.log(String(err));
      });
  };

  return <Box className={"card_game_bg"} elevation={0}></Box>;
};

export default React.memo(PDepthCard);
