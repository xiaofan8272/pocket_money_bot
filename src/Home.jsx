import { React, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import PDepthCard from "./components/PDepthCard";
import "./Home.scss";
import { testPing } from "./api/requestData";
import xglobal from "./util/xglobal";
import { defBaseUrl, baseUrlList } from "./util/xdef";
import { signature } from "./util/xhelp";
function Home() {
  const [curBaseUrl, setCurBaseUrl] = useState(defBaseUrl);
  const [pingInfo, setPingInfo] = useState({ isPing: false, info: "" });

  const testHMAC = () => {
    let message = "apiKey=vmPUZE6mv9SD5VNHk4HlWFsOr6aKE2zvsw0MuIgwCIPy6utIco14y7Ju91duEh8A&newOrderRespType=ACK&price=52000.00&quantity=0.01000000&recvWindow=100&side=SELL&symbol=BTCUSDT&timeInForce=GTC&timestamp=1645423376532&type=LIMIT"
    let secret = "NhqPtmdSJYdKjVHjA7PZj4Mge3R5YNiP1e3UZjInClVN65XAbvqqM6A7H5fATj0j";
    let sig =  signature(message, secret);
    console.log(sig);
  }

  return (
    <Box className="home_bg" maxWidth="false">
      <Box className="home_left_box">
        <Box className="home_header_box">
          <Typography
            sx={{
              marginLeft:"10px",
              // marginBottom:"10px",
              fontSize: "20px",
              fontFamily: "Saira",
              fontWeight: "600",
              color: "rgb(0,0,4)",
            }}
          >
            {"USDC/USDT"}
          </Typography>
          <Typography
            sx={{
              marginLeft:"10px",
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
          <PDepthCard/>
          {/* <Box sx={{width:"100px", height:"100px", backgroundColor:"green"}}></Box> */}
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
              testHMAC();
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
      </Box>
    </Box>
  );
}

export default Home;
