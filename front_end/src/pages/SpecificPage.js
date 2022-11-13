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
import { CircularProgress } from "@mui/material";

import {
  storeFiles,
  makeFileObjects,
  retrieveData,
  retrieveImg,
  loadData,
  loadImg,
  makeRequestObjects,
} from "../components/Storage";
import IERC20 from "../artifacts/token/ERC20/ERC20.sol/ERC20.json";

import deployedContracts from "../deployments/deployedContracts.json";

import ScrollBar from "../components/ScrollBar/Scroll";
import Radio from "../components/Radio/Radio";

const MumbaiID = 80001;
const campaignAbi = deployedContracts[MumbaiID].Campaign.abi;
const campaignManagerAbi = deployedContracts[MumbaiID].CampaignManager.abi;
const campaignManagerAddress =
  deployedContracts[MumbaiID].CampaignManager.address;

const SpecificPage = () => {
  const [open, setOpen] = useState(false);
  const [openVote, setOpenVote] = useState(false);
  const [openRequest, setOpenRequest] = useState(false);

  function handleCloseVote() {
    setOpenVote(false);
  }
  function handleCloseRequest() {
    setOpenRequest(false);
  }
  function handleClose() {
    setOpen(false);
  }
  function handleOpen() {
    setOpen(true);
  }
  function handleOpenVote() {
    setOpenVote(true);
  }
  function handleOpenRequest() {
    setOpenRequest(true);
  }
  const [contributor, setContributor] = useState();
  const [remaining, setRemaining] = useState();
  const [totalSuply, setTotalSuply] = useState();
  const [minAmount, setMinAmount] = useState();
  const [userAddress, setUserAddress] = useState();
  const [fundDetails, setFundDetails] = useState({ option: "", value: "" });
  const [img, setImg] = useState();
  const [radioCheck, setRadioCheck] = useState();
  const [contibution, setContribution] = useState();
  const [submitterAddress, setSubmitterAddress] = useState();
  const [isActive, setIsActive] = useState();
  const [campaignVotable, setCampaignVotable] = useState();
  const [succesfullFunding, setSuccesfullFunding] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const [allRequests, setAllRequests] = useState([]);
  function handleCheck(e) {
    setRadioCheck(e.target.value);
  }
  const [request, setRequest] = useState({
    title: "",
    reason: "",
    duration: "",
    amount: "",
    wallet: "",
  });
  console.log(request, "requestwajih");

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
          campaignAbi,
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
          campaignAbi,
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
          campaignAbi,
          provider
        );

        let isactive = await contract.isFundingActive();
        const stylesMining = ["color: black", "background: yellow"].join(";");
        console.log("%c is Funding Active =  %s", stylesMining, isactive);
        setIsActive(isactive);
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
          campaignAbi,
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
          campaignAbi,
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
          campaignAbi,
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

  /**
   * Get Contributor contribution
   */
  const getContributor = async (campaignaddress, contributorAddress) => {
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

        let contribution = await contract.getContributor(contributorAddress);
        const stylesMining = ["color: black", "background: yellow"].join(";");
        console.log("%c contribution =  %s", stylesMining, contribution);
        setContribution(contribution.toNumber());
        return contribution;
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  /**
   * Get Submitter address
   */
  const getSubmitter = async (campaignaddress) => {
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

        let Submitter = await contract.getSubmitter();
        const stylesMining = ["color: black", "background: yellow"].join(";");
        console.log("%c Submitter address =  %s", stylesMining, Submitter);
        setSubmitterAddress(Submitter.toString());
        return Submitter;
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  /**
   * is Campaign Votable
   */
  const isCampaignVotable = async (campaignaddress) => {
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
   * Get All Requests Info
   */
  const getAllRequests = async (campaignaddress) => {
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

        let AllRequests = await contract.getAllRequests();
        const stylesMining = ["color: black", "background: yellow"].join(";");
        console.log("%c Submitter address =  %s", stylesMining, AllRequests);
        setAllRequests(AllRequests);
        return AllRequests;
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const [CampaignsData, setCampaignsData] = useState();
  const [campaignsRequests, setCampaignsRequests] = useState();
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

  const StoreRequestsInfo = async () => {
    try {
      const files = await makeRequestObjects(
        request?.title,
        request?.reason
      );
      const cid = await storeFiles(files);
      return cid;
    } catch (error) {
      console.error("error", error);
    }
  };

  const getCampaignRequestsInfo = async (address, ReqId) => {
    try {
      let RequestInformation = await getAllRequests(address);
      /* let cid_i = RequestInformation[ReqId];
       let content = await loadData(cid_i);
       setCampaignsRequests(content);
       return content;*/
    } catch (error) {
      console.log("error", error);
    }
  };

  const makeRequest = async () => {
    try {
      const cid = await StoreRequestsInfo();
      await transferStableTokensWithRequest(
        id,
        request?.wallet,
        request?.amount,
        request?.duration,
        cid
      )
      console.log("request done")
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
          campaignManagerAddress,
          campaignManagerAbi,
          signer
        );

        const stableTokenAddress = await contract.getStableTokenAddress();
        const stableToken = new ethers.Contract(
          stableTokenAddress,
          IERC20.abi,
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
        setIsLoading(true);
        let appr = await stableToken.approve(campaignManagerAddress, amount);
        console.log("approve... please wait!");
        await appr.wait();
        let tx = await contract.contributeCampaign(
          BigNumber.from(amount),
          campaignAddress
        );
        const stylesMining = ["color: black", "background: yellow"].join(";");
        console.log(
          "%c contribute to campaign... please wait!  %s",
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
        setIsLoading(false);
        handleClose();
        return;
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const transferStableTokensWithRequest = async (
    campaignAddress,
    to,
    amount,
    requestDuration,
    cidIpfs
  ) => {
    if (!campaignAddress) {
      console.log(`Error, Please enter a valid campaign Address`);
      return;
    }

    if (!to) {
      console.log(`Error, Please enter a valid destination Address`);
      return;
    }

    if (!amount && Number(amount)) {
      console.log(`Error, Please enter a valid amount`);
      return;
    }

    if (!cidIpfs) {
      console.log(`Error, Please enter a valid IPFS CID`);
      return;
    }

    if (!requestDuration && Number(requestDuration)) {
      console.log(`Error, Please enter a valid request Duration`);
      return;
    }

    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          campaignAddress,
          campaignAbi,
          signer
        );

        let tx = await contract.transferStableTokensWithRequest(
          to,
          BigNumber.from(amount),
          BigNumber.from(requestDuration),
          cidIpfs
        );
        const stylesMining = ["color: black", "background: yellow"].join(";");
        console.log(
          "%c transfer StableTokens With Request... please wait!  %s",
          stylesMining,
          tx.hash
        );
        //wait until a block containing our transaction has been mined and confirmed.
        const receipt = await tx.wait();
        const stylesReceipt = ["color: black", "background: #e9429b"].join(";");
        console.log("%c you just passed a request %s ", stylesReceipt, tx.hash);
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

  const voteOnTransferRequest = async (campaignAddress, requestId, approve) => {
    if (!campaignAddress) {
      console.log(`Error, Please enter a valid campaign Address`);
      return;
    }

    if (!requestId && Number(requestId)) {
      console.log(`Error, Please enter a valid requestId`);
      return;
    }

    if (!approve) {
      console.log(`Error, Please enter a valid approve`);
      return;
    }

    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          campaignAddress,
          campaignAbi,
          signer
        );

        let tx = await contract.voteOnTransferRequest(
          BigNumber.from(requestId),
          approve
        );
        const stylesMining = ["color: black", "background: yellow"].join(";");
        console.log(
          "%c vote On Transfer Request... please wait!  %s",
          stylesMining,
          tx.hash
        );
        //wait until a block containing our transaction has been mined and confirmed.
        const receipt = await tx.wait();
        const stylesReceipt = ["color: black", "background: #e9429b"].join(";");
        console.log(
          "%c you have just voted a proposal %s ",
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
    getSubmitter(id);
    getContributor(id, userAddress);
    isCampaignVotable(id);
  }, [userAddress]);

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
            width="50%"
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
              {Math.floor((totalSuply / minAmount) * 100)} %
            </Avatar>
            <Box dispaly="flex" flexDirection="column">
              <h1 style={{ margin: 0 }}>{CampaignsData?.campaignName}</h1>
              {isActive ? (
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
              ) : (
                <Box mt={1}>
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
              <p style={{ margin: 0, marginTop: "10px" }}>
                {contributor && contributor} Contributors
              </p>
            </Box>
          </Box>
          <Box mb={2} display="flex" width="100%" justifyContent="center">
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
          {contibution !== 0 && campaignVotable /*&& campaignVotable == true*/ && (
            <Box mb={2} display="flex" width="100%" justifyContent="center">
              <button
                style={{
                  color: "black",
                  backgroundColor: "white",
                  borderRadius: "10px",
                  fontFamily: "Sen",
                  fontStyle: "normal",
                  fontWeight: 700,
                  fontSize: "25px",
                  lineHeight: "30px",
                  padding: "10px 85px",
                  cursor: "pointer",
                }}
                onClick={handleOpenVote}
              >
                vote
              </button>
            </Box>
          )}
          {submitterAddress === userAddress &&
            campaignVotable /*&& campaignVotable == true*/ && (
              <Box display="flex" width="100%" justifyContent="center">
                <button
                  style={{
                    color: "black",
                    backgroundColor: "white",
                    borderRadius: "10px",
                    fontFamily: "Sen",
                    fontStyle: "normal",
                    fontWeight: 700,
                    fontSize: "25px",
                    lineHeight: "30px",
                    padding: "10px 85px",
                    cursor: "pointer",
                  }}
                  onClick={handleOpenRequest}
                >
                  Request
                </button>
              </Box>
            )}
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
              {totalSuply && Math.floor(totalSuply * 0.000001)} $ Raised
            </p>
            <BorderLinearProgress
              variant="determinate"
              value={totalSuply / minAmount > 1 ? 100 : totalSuply / minAmount}
              style={{ width: "60%" }}
            />{" "}
          </Box>
          <Box>
            <p style={{ margin: 0 }}>
              {minAmount && Math.floor(minAmount * 0.000001)} $ needed
            </p>
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
                    setFundDetails({
                      ...fundDetails,
                      value: e.target.value / 0.000001,
                    })
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
                {isLoading ? <CircularProgress /> : "Fund"}
              </button>
            </div>,
            <div>e</div>,
          ]}
        />
      </BasicModal>
      <BasicModal open={openRequest} handleClose={handleCloseRequest}>
        <ScrollBar maxHeight="80vh">
          <Box p={4}>
            <Box my={4}>
              <h4 style={{ margin: 0, marginBottom: "5px" }}>
                Title of Request
              </h4>
              <Inputs
                type="text"
                width={450}
                onChange={(e) =>
                  setRequest({ ...request, title: e.target.value })
                }
              />
            </Box>
            <Box my={4}>
              <h4 style={{ margin: 0, marginBottom: "5px" }}>
                Reason for Request
              </h4>
              <Inputs
                type="area"
                rows={6}
                width={450}
                onChange={(e) =>
                  setRequest({ ...request, reason: e.target.value })
                }
              />
            </Box>
            <Box my={4}>
              <h4 style={{ margin: 0, marginBottom: "5px" }}>
                Request Duration
              </h4>
              <Inputs
                type="text"
                width={450}
                onChange={(e) =>
                  setRequest({ ...request, duration: e.target.value })
                }
              />
            </Box>
            <Box my={4}>
              <h4 style={{ margin: 0, marginBottom: "5px" }}>Amount</h4>
              <Inputs
                type="text"
                width={450}
                onChange={(e) =>
                  setRequest({ ...request, amount: e.target.value / 0.000001 })
                }
              />
            </Box>
            <Box my={4}>
              <h4 style={{ margin: 0, marginBottom: "5px" }}>Wallet Address</h4>
              <Inputs
                type="text"
                width={450}
                onChange={(e) =>
                  setRequest({ ...request, wallet: e.target.value })
                }
              />
            </Box>
            <Box display="flex" justifyContent="center" widht="100%">
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
                onClick={makeRequest}
              >
                Request Fund
              </button>
            </Box>
          </Box>
        </ScrollBar>
      </BasicModal>
      <BasicModal open={openVote} handleClose={handleCloseVote}>
        <Box p={4} position="relative" width="500px">
          <div style={{ display: "flex", marginBottom: "30px" }}>
            <h4 style={{ margin: 0, marginBottom: "5px" }}>Title of Request</h4>
            <h4
              style={{
                margin: 0,
                marginBottom: "5px",
                position: "absolute",
                right: 30,
              }}
            >
              title
            </h4>
          </div>
          <div style={{ display: "flex", marginBottom: "30px" }}>
            <h4 style={{ margin: 0, marginBottom: "5px" }}>
              Reason for Request
            </h4>
            <h4
              style={{
                margin: 0,
                marginBottom: "5px",
                position: "absolute",
                right: 30,
              }}
            >
              reason
            </h4>
          </div>
          <div style={{ display: "flex", marginBottom: "30px" }}>
            <h4 style={{ margin: 0, marginBottom: "5px" }}>Request Duration</h4>
            <h4
              style={{
                margin: 0,
                marginBottom: "5px",
                position: "absolute",
                right: 30,
              }}
            >
              duration
            </h4>
          </div>
          <div style={{ display: "flex", marginBottom: "30px" }}>
            <h4 style={{ margin: 0, marginBottom: "5px" }}>Amount</h4>
            <h4
              style={{
                margin: 0,
                marginBottom: "5px",
                position: "absolute",
                right: 30,
              }}
            >
              Amount
            </h4>
          </div>
          <div style={{ display: "flex", marginBottom: "30px" }}>
            <h4 style={{ margin: 0, marginBottom: "5px" }}>Wallet Address</h4>
            <h4
              style={{
                margin: 0,
                marginBottom: "5px",
                position: "absolute",
                right: 30,
              }}
            >
              wallet
            </h4>
          </div>
          <div
            style={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              Yes
              <Radio
                checked={radioCheck === "yes"}
                onChange={handleCheck}
                value="yes"
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              No
              <Radio
                checked={radioCheck === "no"}
                onChange={handleCheck}
                value="no"
              />
            </div>
          </div>
          <Box display="flex" justifyContent="center" widht="100%">
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
            >
              Vote
            </button>
          </Box>
        </Box>
      </BasicModal>
    </Box>
  );
};

export default SpecificPage;
