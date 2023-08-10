import React, { useEffect, useState } from "react";
import "./PAlertDlg.scss";

import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import DialogContent from '@mui/material/DialogContent';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { pink } from '@mui/material/colors';
const PAlertDlg = (props) => {
  const [content, setContent] = React.useState("");
  useEffect(() => { }, []);

  const handleDialogClose = () => {
    props.close();
  };

  return (
    <Dialog
      className={'alert_dlg_bg'}
      PaperProps={{
        style: {
          boxShadow: 'none',
          backgroundColor: '#0F0F0F',
        },
      }}
      elevation={0}
      open={props.open}
      onClose={handleDialogClose}
    >
      <Box className={'alert_content_box'}>
        <ErrorOutlineIcon sx={{ fontSize: 60, color: pink[500] }} />
        <DialogContent>
        <Typography
          sx={{
            fontSize: "18px",
            fontFamily: "Saira",
            fontWeight: "500",
            textAlign: "center",
            color: "rgb(51,54,57)",
          }}
        >
          {"下单总金额大于10 USDT，请调整后再试一次。"}
        </Typography>
        </DialogContent>
        <Button
          variant="contained"
          sx={{
            marginTop: "10px",
            width: "80%",
            height: "48px",
            fontSize: "16px",
            fontFamily: "Saira",
            fontWeight: "500",
            color: "#FFFFFF",
            backgroundColor: "#272727",
              "&:hover": {
                backgroundColor: "#383838",
              },
          }}
          onClick={(event) => {
            event.stopPropagation();
            handleDialogClose();
          }}
        >
          {"取消"}
        </Button>
      </Box>
    </Dialog>
  );
};

export default React.memo(PAlertDlg);
