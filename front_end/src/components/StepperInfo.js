import React from "react";
import { Box } from "@mui/material";
import Inputs from "./Ui/index";

const StepperInfo = ({ setCampaign, campaign }) => {
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
        Campaign Name
      </div>
      <p style={{ margin: 0, color: "grey", marginBottom: "10px" }}>
        What is the title of your Campaign?
      </p>
      <Inputs
        type="text"
        width={600}
        onChange={(e) =>
          setCampaign({ ...campaign, campaignName: e.target.value })
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
        Campaign Info
      </div>
      <p style={{ margin: 0, color: "grey", marginBottom: "10px" }}>
        What is your Campaign all about?
      </p>
      <Inputs
        type="area"
        rows={6}
        width={600}
        onChange={(e) =>
          setCampaign({ ...campaign, campaignInfo: e.target.value })
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
        Campaign Image
      </div>
      <p style={{ margin: 0, color: "grey", marginBottom: "10px" }}>
        Upload an Image that best describes what your Campaign is all about
      </p>
      <Inputs
        type="file"
        hidden
        width="20vw"
        onChange={(e) =>
          setCampaign({ ...campaign, campaignImg: e.target.files })
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
        Campaign Duration
      </div>
      <p style={{ margin: 0, color: "grey", marginBottom: "10px" }}>
        How long do your Campaign to last?
      </p>
      <Inputs
        type="text"
        width={400}
        onChange={(e) =>
          setCampaign({ ...campaign, campaignDuration: e.target.value })
        }
      />
    </Box>
  );
};

export default StepperInfo;
