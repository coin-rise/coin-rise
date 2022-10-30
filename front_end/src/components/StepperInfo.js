import React from "react";
import { Box } from "@mui/material";
import Inputs from "./Ui/index";

const StepperInfo = ({ setUrl }) => {
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
        Compain Name
      </div>
      <Inputs type="text" width={600} />
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
        Compain Info
      </div>
      <Inputs type="area" rows={6} width={600} />
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
        Compain Image
      </div>

      <Inputs
        type="file"
        hidden
        width="20vw"
        onChange={(e) => setUrl(e.target.files)}
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
        Compain Duration
      </div>
      <Inputs type="text" width={400} />
    </Box>
  );
};

export default StepperInfo;
