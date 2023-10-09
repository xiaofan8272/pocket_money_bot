import React from "react";
import "./PNorDlg.scss";

import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
const PNorDlg = (props) => {
  const { title, content } = props;

  const handleDialogClose = () => {
    props.close();
  };
  const handleDialogConfirm = () => {
    props.confirm();
  };

  return (
    <Dialog
      className={"nor_dlg_bg"}
      PaperProps={{
        style: {
          boxShadow: "none",
          backgroundColor: "#0F0F0F",
        },
      }}
      elevation={0}
      open={props.open}
      onClose={handleDialogClose}
    >
      <Box className={"nor_content_box"}>
        <DialogTitle>
          <Typography
            sx={{
              fontSize: "20px",
              fontFamily: "Saira",
              fontWeight: "500",
              textAlign: "center",
              color: "rgb(51,54,57)",
            }}
          >
            {title}
          </Typography>
        </DialogTitle>

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
            {content}
          </Typography>
        </DialogContent>
        <Box sx={{marginTop:"20px", width:"90%", display: "flex", flexDirection: "row", justifyContent:"space-between" }}>
          <Button
            variant="contained"
            sx={{
              width: "45%",
              height: "40px",
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
          <Button
            variant="contained"
            sx={{
              width: "45%",
              height: "40px",
              fontSize: "16px",
              fontFamily: "Saira",
              fontWeight: "500",
              color: "#FFFFFF",
              backgroundColor: "rgb(51,189,137)",
              "&:hover": {
                backgroundColor: "rgb(51,209,137)",
              },
            }}
            onClick={(event) => {
              event.stopPropagation();
              handleDialogConfirm();
            }}
          >
            {"确定"}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default React.memo(PNorDlg);
