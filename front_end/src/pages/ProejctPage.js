import React, { useState, useEffect } from "react";
import StepperIcon from "../assets/StepperIcon.svg";
import { Box, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Inputs from "../components/Ui";
import Card from "../components/Card/Card";
import { Link } from "react-router-dom";
import { ethers, BigNumber } from "ethers";
import {
  storeFiles,
  makeFileObjects,
  loadData,
  retrieveData
} from "../components/Storage";
import deployedContracts from "../deployments/deployedContracts.json"

const MumbaiID = 80001;
const campaignAbi = deployedContracts[MumbaiID].Campaign.abi
const campaignFactoryAbi= deployedContracts[MumbaiID].CampaignFactory.abi

const campaignFactoryAddress = deployedContracts[MumbaiID].CampaignFactory.address


const ProejctPage = () => {
  /**
   * Get Deployed Campaign Contracts
   */
  const getDeployedCampaignContracts = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.JsonRpcProvider(
          process.env.REACT_APP_QUICKNODE_URL_POLYGON_MUMBAI
        );
        const contract = new ethers.Contract(
          campaignFactoryAddress,
          campaignFactoryAbi,
          provider
        );

        let campaignList = await contract.getDeployedCampaignContracts();
        const stylesMining = ["color: black", "background: yellow"].join(";");
        console.log(
          "%c Deployed Campaign Contracts addresses =  %s",
          stylesMining,
          campaignList
        );
        return campaignList;
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log("error", error);
    }
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
          campaignAbi,
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

  const [campaigns, setCampaigns] = useState([]);
  console.log(campaigns, "campaigns");

  const makeObj = async (campaignList) => {
    try {
      let campaignObj = [];
      const promises = campaignList.slice(10).map(async campaignAddr => {
        let cid_i = await getCampaignURI(campaignAddr);
        let content = await loadData(cid_i);
        content.address = campaignAddr;
        campaignObj.push(content);
      })
      await Promise.all(promises)
      return campaignObj;
    } catch (error) {
      console.error("error", error);
    }
  };
  useEffect(() => {
    const test = async (cid) => {
      let campaignList = await getDeployedCampaignContracts();
      const campaignObj = await makeObj(campaignList);
      setCampaigns(campaignObj);
      // console.log("obj", campaignObj);
    };
    test();
  }, []);

  const data = [1, 2, 3, 4];
  const AllComapain = [{}, {}, {}];
  const [text, setText] = useState("");

  if (campaigns === undefined) return <h1>Loading</h1>;

  return (
    <div style={{ marginLeft: "8rem", marginTop: "2rem" }}>
      <Inputs
        type="text"
        width={400}
        onChange={(e) => setText(e.target.value)}
      />
      <Box display="flex" flexWrap="wrap">
        {campaigns
          ?.filter((el) => el?.campaignName?.toString().includes(text))
          .map((el) => (
            <Link
              to={`/project/${el?.address}`}
              style={{
                textDecoration: "none",
                color: "black",
                cursor: "pointer",
              }}
            >
              <Card {...el} />
            </Link>
          ))}
      </Box>
    </div>
  );
};

export default ProejctPage;
