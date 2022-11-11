import React from "react";
import { Box, Typography } from "@mui/material";
import Inputs from "./Ui/index";
import CheckBox from "./Radio/Radio";

const FinalStepper = ({ setCampaign, campaign }) => {
  const nftsBadge = [
    campaign?.nftGold,
    campaign?.nftSilver,
    campaign?.nftBronze,
  ];
  console.log(nftsBadge,'nftsBadge')
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
      {/* <Radio/> */}
      <Inputs
        type="text"
        width={900}
        onChange={(e) =>
          setCampaign({ ...campaign, minAmount: e.target.value })
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
      <div style={{ display: "flex", gap: "80px" }}>
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
      <p
        style={{
          fontFamily: "Sen",
          fontStyle: "normal",
          fontWeight: 400,
          fontSize: "22px",
          lineHeight: "20px",
          color: "grey",
          margin: 0,
        }}
      >
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
