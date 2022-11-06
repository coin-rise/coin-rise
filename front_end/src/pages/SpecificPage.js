import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { BorderLinearProgress } from "../components/Card/Card";
import { ReactComponent as Clock } from "../assets/Clock.svg";
import Avatar from "@mui/material/Avatar";
import BasicTabs from "../components/Tabs";
import BasicModal from "../components/Modal/Modal";
import Inputs from "../components/Ui";
import { ethers, BigNumber } from "ethers";
import { useParams } from "react-router-dom";
import {
  storeFiles,
  makeFileObjects,
  retrieveData,
} from "../components/Storage";

import CampaignAbi from "../artifacts/contracts/Campaign.sol/Campaign.json";

const SpecificPage = () => {
  const [open, setOpen] = useState(false);
  function handleClose() {
    setOpen(false);
  }
  function handleOpen() {
    setOpen(true);
  }
  const style = {
    borderRadius: "10px",
    color: "white",
    backgroundColor: "#11484F",
    marginRight: "10px",
  };

  /**
   * Get the IPFS CID of a Campaign
   */
  const getCampaignURI = async (campaignaddress) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.JsonRpcProvider(
          process.env.REACT_APP_QUICKNODE_URL_POLYGON_MUMBAI
        );
        const contract = new ethers.Contract(
          campaignaddress,
          CampaignAbi.abi,
          provider
        );

        let cid = await contract.getCampaignURI();
        const stylesMining = ["color: black", "background: yellow"].join(";");
        console.log("%c campaign IPFS CID =  %s", stylesMining, cid);
        return cid;
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const [CampaignsData, setCampaignsData] = useState();
  const getCampaignData = async (address) => {
    try {
      let cid_i = await getCampaignURI(address);
      let content = await retrieveData(cid_i);
      setCampaignsData(content);
      return content;
    } catch (error) {
      console.log("error", error);
    }
  };
  const { id } = useParams();
  useEffect(() => {
    getCampaignData(id);
  }, []);
  return (
    <Box px={4}>
      <Box display="flex">
        <Box width="50%">
          <img
            src="https://pixl8-cloud-techuk.s3.eu-west-2.amazonaws.com/prod/public/f1afc92b-2d5d-42d3-bd1b4d75769849e5/750x421_highestperformance_/blockchainreimagined1200x628pxfinal.jpg"
            width="100%"
            height="350px"
          />
        </Box>
        <Box width="50%" m={4}>
          <Box
            display="flex"
            width="100%"
            alignItems="center"
            justifyContent="space-between"
          >
            <Avatar
              style={{
                width: "160px",
                height: "160px",
                fontSize: "46px",
                color: "black",
                backgroundColor: "#D9D9D9",
                border: "10px solid green",
                fontWeight: 400,
              }}
            >
              46%
            </Avatar>
            <Box dispaly="flex" flexDirection="column">
              <h1 style={{ margin: 0 }}>{CampaignsData?.campaignName}</h1>
              <Box mt={3} display="flex" alignItems="center">
                <Clock
                  width="20px"
                  height="20px"
                  style={{ marginRight: "10px" }}
                />
                <p style={{ margin: 0 }}>25 days</p>
              </Box>
            </Box>
          </Box>
          <Box display="flex" width="100%" justifyContent="center">
            <button
              style={{
                color: "white",
                backgroundColor: "#11484F",
                borderRadius: "10px",
                fontFamily: "Sen",
                fontStyle: "normal",
                fontWeight: 700,
                fontSize: "25px",
                lineHeight: "30px",
                padding: "10px 85px",
                cursor: "pointer",
              }}
              onClick={handleOpen}
            >
              Fund
            </button>
          </Box>
        </Box>
      </Box>

      <Box mt={5}>
        <Box display="flex" alignItems="center" width="100%">
          <Box
            display="flex"
            alignItems="center"
            justifyContent="flex-start"
            width="92%"
          >
            <p style={{ margin: 0, width: "20%" }}>$546 Raised</p>
            <BorderLinearProgress
              variant="determinate"
              value={50}
              style={{ width: "60%" }}
            />{" "}
          </Box>
          <Box>
            <p style={{ margin: 0 }}>1200 $ needed</p>
          </Box>
        </Box>
      </Box>

      <Box mt={5}>
        <BasicTabs
          style={style}
          tabsBar={["proposal", "comments", "info"]}
          tabsContent={[
            <div>{CampaignsData?.campaignInfo}</div>,
            <div>e</div>,
            <div>w</div>,
          ]}
        />
      </Box>
      <h1>Additional Information</h1>
      {CampaignsData?.extraInfo}

      <BasicModal open={open} handleClose={handleClose}>
        <BasicTabs
          style={{}}
          padding={4}
          tabsBar={["Fund", "Swap"]}
          tabsContent={[
            <div>
              <h1 style={{ margin: 0 }}>
                Wallet Connected : kj1k23j123axzc213123
              </h1>
              <Box mt={4}>
                <Inputs type="select" options={["Non-Profit"]} width={250} />
              </Box>
              <Box my={4}>
                <Inputs type="text" width={450} />
              </Box>
              <button
                style={{
                  color: "white",
                  backgroundColor: "#11484F",
                  borderRadius: "10px",
                  fontFamily: "Sen",
                  fontStyle: "normal",
                  fontWeight: 700,
                  fontSize: "25px",
                  lineHeight: "30px",
                  padding: "10px 85px",
                  cursor: "pointer",
                }}
                onClick={handleOpen}
              >
                Fund
              </button>
            </div>,
            <div>e</div>,
          ]}
        />
      </BasicModal>
    </Box>
  );
};

export default SpecificPage;
