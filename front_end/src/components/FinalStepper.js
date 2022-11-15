import React from "react";
import { Box, Typography } from "@mui/material";
import Inputs from "./Ui/index";
import CheckBox from "./CheckBox/CheckBox";
import { ReactComponent as Gold } from "../assets/Silver.svg";
import { ReactComponent as Silver } from "../assets/Bronze.svg";
import { ReactComponent as Bronze } from "../assets/Gold.svg";

const FinalStepper = ({ setCampaign, campaign }) => {
  const nftsBadge = [
    campaign?.nftGold,
    campaign?.nftSilver,
    campaign?.nftBronze,
  ];
  console.log(nftsBadge, "nftsBadge");
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
      <p style={{ margin: 0, color: "grey", marginBottom: "10px" }}>
        What is the minimum amount needed to start your Campaign?
      </p>
      <Inputs
        type="text"
        width={900}
        onChange={(e) =>
          setCampaign({ ...campaign, minAmount: e.target.value / 0.000001 })
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
        Amount to receive NFT badge
      </div>
      <p style={{ margin: 0, color: "grey", marginBottom: "10px" }}>
        What is the minimum that can contributed to receive NFT badge?
      </p>
      <div style={{ display: "flex", gap: "40px" }}>
        <div style={{ display: "flex" }}>
          <Inputs
            type="text"
            width={80}
            onChange={(e) =>
              setCampaign({
                ...campaign,
                nftGold: e.target.value,
              })
            }
          />
          <Gold style={{ marginLeft: "10px" }} />
        </div>
        <div style={{ display: "flex" }}>
          <Inputs
            type="text"
            width={80}
            onChange={(e) =>
              setCampaign({
                ...campaign,
                nftSilver: e.target.value,
              })
            }
          />
          <Silver style={{ marginLeft: "10px" }} />
        </div>
        <div style={{ display: "flex" }}>
          <Inputs
            type="text"
            width={80}
            onChange={(e) =>
              setCampaign({
                ...campaign,
                nftBronze: e.target.value,
              })
            }
          />
          <Bronze style={{ marginLeft: "10px" }} />
        </div>
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
        Compain Pitch
      </div>
      <p style={{ margin: 0, color: "grey", marginBottom: "10px" }}>
        Input Video link that best describes what your Campaign is all about ?
      </p>
      <Inputs
        type="text"
        width={900}
        onChange={(e) =>
          setCampaign({ ...campaign, campaignVideo: e.target.value })
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
        Additional Information
      </div>
      <p style={{ margin: 0, color: "grey", marginBottom: "10px" }}>
        What are the other information that is relevant to your Campaign like
        social media , website, etc ...
      </p>
      <Inputs
        type="area"
        rows={6}
        width={600}
        onChange={(e) =>
          setCampaign({ ...campaign, extraInformation: e.target.value })
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
        Voting
      </div>
      <p style={{ margin: 0, color: "grey", marginBottom: "10px" }}>
        Allow Contributors vote for your compaign
      </p>

      <CheckBox
        onChange={(e) => setCampaign({ ...campaign, vote: e.target.checked })}
      />
      {campaign?.vote && (
        <>
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
            Min vote percentage
          </div>
          <Inputs
            type="text"
            width={900}
            onChange={(e) =>
              setCampaign({ ...campaign, minVotePercentage: e.target.value })
            }
          />
        </>
      )}
    </Box>
  );
};

export default FinalStepper;
