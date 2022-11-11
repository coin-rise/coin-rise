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
  retrieveImg,
  loadData,
  loadImg,
} from "../components/Storage";
import contractManagerAbi from "../artifacts/contracts/CampaignManager.sol/CampaignManager.json";
import CampaignAbi from "../artifacts/contracts/Campaign.sol/Campaign.json";
const contractManagerAddress = "0x02D7E5f45A7ae98d8aa572Db8df54165aD4bF88b";

const SpecificPage = () => {
  const [open, setOpen] = useState(false);
  function handleClose() {
    setOpen(false);
  }
  function handleOpen() {
    setOpen(true);
  }
  const [contributor, setContributor] = useState();
  const [remaining, setRemaining] = useState();
  const [totalSuply, setTotalSuply] = useState();
  const [minAmount, setMinAmount] = useState();
  const [userAddress, setUserAddress] = useState();
  const [fundDetails, setFundDetails] = useState({ option: "", value: "" });
  const [img, setImg] = useState();
  useEffect(() => {
    const onNewSigner = async () => {
      let addr;
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        addr = await signer.getAddress();

        setUserAddress(addr.toString());
      }
    };

    onNewSigner();
  }, [window.ethereum]);
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

  /**
   * Get Number Of Contributors in the Campaign
   */
  const getNumberOfContributor = async (campaignaddress) => {
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
          CampaignAbi.abi,
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
          CampaignAbi.abi,
          provider
        );

        let isactive = await contract.isFundingActive();
        const stylesMining = ["color: black", "background: yellow"].join(";");
        console.log("%c is Funding Active =  %s", stylesMining, isactive);
        return isactive;
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
          CampaignAbi.abi,
          provider
        );

        let successfulFunded = await contract.getFundingStatus();
        const stylesMining = ["color: black", "background: yellow"].join(";");
        console.log(
          "%c is Funding successful =  %s",
          stylesMining,
          successfulFunded
        );
        return successfulFunded;
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
          CampaignAbi.abi,
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
          CampaignAbi.abi,
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

  const [CampaignsData, setCampaignsData] = useState();
  const getCampaignData = async (address) => {
    try {
      let cid_i = await getCampaignURI(address);
      let content = await loadData(cid_i);
      setCampaignsData(content);
      return content;
    } catch (error) {
      console.log("error", error);
    }
  };

  const contributeCampaign = async (amount, campaignAddress) => {
    if (!campaignAddress) {
      console.log(`Error, Please enter a valid campaignAddress`);
      return;
    }

    if (!amount && Number(amount)) {
      console.log(`Error, Please enter a valid amount`);
      return;
    }

    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          contractManagerAddress,
          contractManagerAbi.abi,
          signer
        );
        /**
         *  Receive Emitted Event from Smart Contract
         *  @dev See ContributorsUpdated emitted from our smart contract contributeCampaign function
         */
        contract.on(
          "ContributorsUpdated",
          (ContributorAddress, campaignTokenAmount, campaignAddress) => {
            console.log("Contributor address :", ContributorAddress);
            console.log(
              "campaign Token Amount :",
              campaignTokenAmount.toNumber()
            );
            console.log("Campaign address :", campaignAddress);
          }
        );
        let tx = await contract.contributeCampaign(
          BigNumber.from(amount),
          campaignAddress
        );
        const stylesMining = ["color: black", "background: yellow"].join(";");
        console.log(
          "%c Create new campaign... please wait!  %s",
          stylesMining,
          tx.hash
        );
        //wait until a block containing our transaction has been mined and confirmed.
        //NewCampaignCreated event has been emitted .
        const receipt = await tx.wait();
        const stylesReceipt = ["color: black", "background: #e9429b"].join(";");
        console.log(
          "%c you just contributed to Campaign %s ",
          stylesReceipt,
          tx.hash
        );
        /* Check our Transaction results */
        if (receipt.status === 1) {
          /**
           * @dev NOTE: Switch up these links once we go to Production
           * Currently set to use Polygon Mumbai Testnet
           */
          const stylesPolygon = ["color: white", "background: #7e44df"].join(
            ";"
          );
          console.log(
            `%c see transaction: https://polygonscan.com/tx/${tx.hash} %s`,
            stylesPolygon,
            tx.hash
          );
        }
        return;
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  const { id } = useParams();

  useEffect(() => {
    getCampaignData(id);
    getNumberOfContributor(id);
    getRemainingFundingTime(id);
    isFundingActive(id);
    getFundingStatus(id);
    getTotalSupply(id);
    getMinAmount(id);
  }, []);

  useEffect(() => {
    retrieveImg(setImg, CampaignsData?.cidImg);
  }, [CampaignsData]);

  return (
    <Box px={4}>
      <Box display="flex">
        <Box width="50%">
          <img src={img} width="100%" height="350px" />
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
              {(totalSuply / minAmount) * 100} %
            </Avatar>
            <Box dispaly="flex" flexDirection="column">
              <h1 style={{ margin: 0 }}>{CampaignsData?.campaignName}</h1>
              <Box mt={3} display="flex" alignItems="center">
                <Clock
                  width="20px"
                  height="20px"
                  style={{ marginRight: "10px" }}
                />
                <p style={{ margin: 0 }}>
                  {remaining && Math.floor(remaining / (3600 * 24))} days
                </p>
              </Box>
              <p style={{ margin: 0, marginTop: "10px" }}>
                {contributor && contributor?.toNumber()} Contributors
              </p>
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
            <p style={{ margin: 0, width: "20%" }}>
              {totalSuply && totalSuply} $ Raised
            </p>
            <BorderLinearProgress
              variant="determinate"
              value={totalSuply / minAmount}
              style={{ width: "60%" }}
            />{" "}
          </Box>
          <Box>
            <p style={{ margin: 0 }}>{minAmount && minAmount} $ needed</p>
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
              <div style={{ display: "flex" }}>
                <h1 style={{ margin: 0 }}>Wallet Connected </h1>
                <p> {userAddress}</p>
              </div>
              <Box mt={4}>
                <h4 style={{ margin: 0 }}>Select stable coin</h4>
                <Inputs
                  type="select"
                  options={["DAI", "USDC"]}
                  width={250}
                  onChange={(e) =>
                    setFundDetails({ ...fundDetails, option: e.target.value })
                  }
                />
              </Box>
              <Box my={4}>
                <h4 style={{ margin: 0 }}>Funding Amount</h4>
                <Inputs
                  type="text"
                  width={450}
                  onChange={(e) =>
                    setFundDetails({ ...fundDetails, value: e.target.value })
                  }
                />
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
                onClick={() => contributeCampaign(fundDetails?.value, id)}
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
