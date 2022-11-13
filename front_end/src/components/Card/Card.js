import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { ReactComponent as Like } from "../../assets/Like.svg";
import { ReactComponent as Clock } from "../../assets/Clock.svg";
import { ethers, BigNumber } from "ethers";
import CircularProgress, {
  circularProgressClasses,
} from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { retrieveImg } from "../Storage";
import deployedContracts from "../../deployments/deployedContracts.json";

const MumbaiID = 80001;
const CampaignAbi = deployedContracts[MumbaiID].Campaign.abi;

export const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor:
      theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === "light" ? "#5CA05F" : "#308fe8",
  },
}));
const Card = ({
  campaignName,
  campaignInfo,
  videoLink,
  extraInfo,
  address,
  cidImg,
}) => {
  const [value] = useState(50);
  const [contributor, setContributor] = useState();
  const [remaining, setRemaining] = useState();
  const [totalSuply, setTotalSuply] = useState();
  const [minAmount, setMinAmount] = useState();
  const [isActive, setIsActive] = useState();
  const [succesfullFunding, setSuccesfullFunding] = useState();
  const [img, setImg] = useState();
  const [campaignVotable, setCampaignVotable] = useState();
  console.log(totalSuply, "totalSuply");
  console.log(address, "address");

  const getNumberOfContributor = async (campaignaddress) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.JsonRpcProvider(
          process.env.REACT_APP_QUICKNODE_URL_POLYGON_MUMBAI
        );
        const contract = new ethers.Contract(
          campaignaddress,
          CampaignAbi,
          provider
        );

        let numberContributor = await contract.getNumberOfContributor();
        const stylesMining = ["color: black", "background: yellow"].join(";");
        console.log(
          "%c number of Contributor =  %s",
          stylesMining,
          numberContributor
        );
        setContributor(numberContributor?.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  /**
   * Get Remaining Funding Time of a Campaign
   */
  const getRemainingFundingTime = async (campaignaddress) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.JsonRpcProvider(
          process.env.REACT_APP_QUICKNODE_URL_POLYGON_MUMBAI
        );
        const contract = new ethers.Contract(
          campaignaddress,
          CampaignAbi,
          provider
        );

        let RemainingFundingTime = await contract.getRemainingFundingTime();
        const stylesMining = ["color: black", "background: yellow"].join(";");
        console.log(
          "%c Remaining Funding Time of a Campaign =  %s",
          stylesMining,
          RemainingFundingTime
        );
        setRemaining(RemainingFundingTime?.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const isCampaignVotable = async (campaignaddress) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.JsonRpcProvider(
          process.env.REACT_APP_QUICKNODE_URL_POLYGON_MUMBAI
        );
        const contract = new ethers.Contract(
          campaignaddress,
          CampaignAbi,
          provider
        );

        let Votable = await contract.isCampaignVotable();
        const stylesMining = ["color: black", "background: yellow"].join(";");
        console.log("%c is Campaign Votable =  %s", stylesMining, Votable);
        setCampaignVotable(Votable);
        return Votable;
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  /**
   * Get the status of the Funding
   */
  const isFundingActive = async (campaignaddress) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.JsonRpcProvider(
          process.env.REACT_APP_QUICKNODE_URL_POLYGON_MUMBAI
        );
        const contract = new ethers.Contract(
          campaignaddress,
          CampaignAbi,
          provider
        );

        let isactive = await contract.isFundingActive();
        const stylesMining = ["color: black", "background: yellow"].join(";");
        console.log("%c is Funding Active =  %s", stylesMining, isactive);
        setIsActive(isactive);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  /**
   * Get the status of the Funding
   */
  const getFundingStatus = async (campaignaddress) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.JsonRpcProvider(
          process.env.REACT_APP_QUICKNODE_URL_POLYGON_MUMBAI
        );
        const contract = new ethers.Contract(
          campaignaddress,
          CampaignAbi,
          provider
        );

        let successfulFunded = await contract.getFundingStatus();
        const stylesMining = ["color: black", "background: yellow"].join(";");
        console.log(
          "%c is Funding successful =  %s",
          stylesMining,
          successfulFunded
        );
        setSuccesfullFunding(successfulFunded);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  /**
   * Get the TotalSupply of the campaign
   */
  const getTotalSupply = async (campaignaddress) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.JsonRpcProvider(
          process.env.REACT_APP_QUICKNODE_URL_POLYGON_MUMBAI
        );
        const contract = new ethers.Contract(
          campaignaddress,
          CampaignAbi,
          provider
        );

        let TotalSupply = await contract.getTotalSupply();
        const stylesMining = ["color: black", "background: yellow"].join(";");
        console.log("%c is Funding Active =  %s", stylesMining, TotalSupply);
        setTotalSuply(TotalSupply?.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  /**
   * Get the min amount of the campaign
   */
  const getMinAmount = async (campaignaddress) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.JsonRpcProvider(
          process.env.REACT_APP_QUICKNODE_URL_POLYGON_MUMBAI
        );
        const contract = new ethers.Contract(
          campaignaddress,
          CampaignAbi,
          provider
        );

        let MinAmount = await contract.getMinAmount();
        const stylesMining = ["color: black", "background: yellow"].join(";");
        console.log("%c min amount =  %s", stylesMining, MinAmount);
        setMinAmount(MinAmount.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    retrieveImg(setImg, cidImg);
  }, [cidImg]);

  useEffect(() => {
    getNumberOfContributor(address);
    getRemainingFundingTime(address);
    isFundingActive(address);
    getFundingStatus(address);
    getTotalSupply(address);
    getMinAmount(address);
    isCampaignVotable(address);
  }, []);
  return (
    <Box
      mt={2}
      mr={2}
      style={{ width: "400px", height: "478px", border: "1px solid #D9D9D9" }}
    >
      <img src={img} width="100%" height="40%" />
      <Box mx={2} mt={2}>
        <Box display="flex" width="100%">
          <Box display="flex" justifyContent="flex-start" width="100%">
            <h5
              style={{
                margin: 0,
              }}
            >
              {campaignName && campaignName}
            </h5>
          </Box>
          <Box display="flex" justifyContent="flex-end" width="100%">
            <Like width="20px" height="20px" />
          </Box>
        </Box>
      </Box>
      <Box mt={2} ml={2}>
        <p style={{ margin: 0 }}>{campaignInfo && campaignInfo}</p>
      </Box>

      <Box mt={5} ml={2}>
        <h4 style={{ margin: 0 }}>Philantropy</h4>
      </Box>

      <Box mx={2} mt={2}>
        <Box display="flex" alignItems="center">
          <Box display="flex" justifyContent="flex-start" width="100%">
            <p>{totalSuply && Math.floor(totalSuply * 0.000001)}$ Raised</p>
          </Box>
          <Box display="flex" justifyContent="flex-end" width="100%">
            {Math.floor((totalSuply / minAmount) * 100)}%
          </Box>
        </Box>
        <BorderLinearProgress
          variant="determinate"
          value={totalSuply / minAmount > 1 ? 100 : totalSuply / minAmount}
        />
      </Box>
      <Box display="flex" mt={2} px={2} alignItems="center">
        <Box display="flex" justifyContent="flex-start" width="100%">
          {isActive ? (
            <Box display="flex" alignItems="center">
              <Clock
                width="20px"
                height="20px"
                style={{ marginRight: "10px" }}
              />
              <p style={{ margin: 0 }}>
                {remaining && Math.floor(remaining / (3600 * 24))} days
              </p>
            </Box>
          ) : (
            <Box>
              <p
                style={{
                  margin: 0,
                  color: succesfullFunding ? "green" : "red",
                }}
              >
                {succesfullFunding ? "Success" : "Failed"}
              </p>
            </Box>
          )}
        </Box>
        <Box display="flex" justifyContent="flex-end" width="100%">
          {campaignVotable && (
            <Box display="flex" justifyContent="flex-end" width="100%">
              Votable
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Card;
