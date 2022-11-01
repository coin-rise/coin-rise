import React from "react";
import StepperIcon from "../assets/StepperIcon.svg";
import { Box, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Inputs from "./Ui/index";

const useStyles = makeStyles({
  text: {
    fontFamily: "Secular One",
    fontStyle: "normal",
    fontWweight: 400,
    fontSize: "70px",
    lineHeight: "102px",
    textTransform: "uppercase",
    color: "#000000",
  },
  label: {
    fontFamily: "Secular One",
    fontStyle: "normal",
    fontWweight: 400,
    fontSize: "32px",
    lineHeight: "47px",
    textTransform: "uppercase",
    color: "#000000",
  },
});

const StepperGeneral = ({ setCampaign, campaign ,userAddress}) => {
  const classes = useStyles();
  return (
    <>
      <Box>
        <Box display="flex" justifyContent="center" widht="100%">
          <img src={StepperIcon} />
        </Box>
        <Box style={{ marginLeft: "17rem", marginTop: "5rem" }}>
          <div>
            <div
              style={{
                fontFamily: "Secular One",
                fontStyle: "normal",
                fontWeight: 400,
                fontSize: "70px",
                lineHeight: "70px",
                textTransform: "uppercase",
                color: "#000000",
                margin: 0,
              }}
            >
              lets make the world a <br /> better place Together
            </div>
            <div
              style={{
                fontFamily: "Sen",
                fontStyle: "normal",
                fontWeight: 400,
                fontSize: "32px",
                lineHeight: "90px",
                textTransform: "uppercase",
                color: "#000000",
                margin: "0px",
              }}
            >
              please Fill out the Information To Start A Compain
            </div>

            <div
              style={{
                fontFamily: "Sen",
                fontStyle: "normal",
                fontWeight: 400,
                fontSize: "32px",
                lineHeight: "60px",
                color: "#000000",
                margin: 0,
              }}
            >
              Purpose Of Compain
            </div>
            <Inputs
              type="select"
              options={["Non-Profit"]}
              width={250}
              value="Non-Profit"
              onChange={(e) =>
                setCampaign({ ...campaign, purpose: e.target.value })
              }
            />
            <div
              style={{
                fontFamily: "Sen",
                fontStyle: "normal",
                fontWeight: 400,
                fontSize: "32px",
                lineHeight: "60px",
                color: "#000000",
                margin: 0,
              }}
            >
              Category Of Compain
            </div>
            <Inputs
              type="select"
              options={["Non-Profit"]}
              width={250}
              onChange={(e) =>
                setCampaign({ ...campaign, category: e.target.value })
              }
            />
            <div
              style={{
                fontFamily: "Sen",
                fontStyle: "normal",
                fontWeight: 400,
                fontSize: "32px",
                lineHeight: "60px",
                color: "#000000",
                margin: 0,
              }}
            >
              Wallet Adress
            </div>
            <Inputs
              type="text"
              width={900}
              value={userAddress}
              onChange={(e) =>
                setCampaign({ ...campaign, newWalletAddress: e.target.value })
              }
            />
          </div>
        </Box>
      </Box>
    </>
  );
};

export default StepperGeneral;
