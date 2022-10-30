import React from "react";
import { Box, Typography } from "@mui/material";
import Inputs from "./Ui/index";

const FinalStepper = () => {
  return (
    <Box style={{ marginLeft: "17rem" }}>
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
        Minimun amount needed
      </div>
      <Inputs type="text" width={900} />
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
        Compain Pitch
      </div>
      <Inputs type="file" hidden width="20vw" />
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
        Additional Information
      </div>
      <Inputs type="area" rows={6} width={600} />
    </Box>
  );
};

export default FinalStepper;
