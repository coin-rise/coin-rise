import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import ERC20Abi from "../abis/ERC20.json";
import SwapAbi from "../abis/Swap.json";
import CampaignFactoryAbi from "../abis/CampaignFactory.json";
import { Typography, Box } from "@mui/material";
import AddIcon from "../assets/AddIcon.svg";
import { makeStyles } from "@mui/styles";
import { Link } from "react-router-dom";
import { ReactComponent as TwitterLogo } from "./../assets/Twitter.svg";
import { ReactComponent as GithubLogo } from "./../assets/Github.svg";
import { ReactComponent as Logo } from "./../assets/CoinLogo.svg";

import Inputs from "./Ui";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const useStyles = makeStyles({
  coin: {
    fontFamily: "Inter",
    fontStyle: "normal",
    fontWeight: 700,
    fontSize: "40px",
    lineHeight: "48px",
    color: "#F01D1D",
  },
  rise: {
    fontFamily: "Trebuchet MS",
    fontStyle: "normal",
    fontWeight: 700,
    fontSize: "40px",
    lineHeight: "48px",
    color: "#11484F",
  },
  link: {
    fontFamily: "Sen",
    fontStyle: "normal",
    fontWeight: 700,
    fontSize: "25px",
    lineHeight: "30px",
    color: "#000000",
    cursor: "pointer",
  },
  btnWallet: {
    color: "white",
    backgroundColor: "#11484F",
    borderRadius: "10px",
    fontFamily: "Sen",
    fontStyle: "normal",
    fontWeight: 700,
    fontSize: "25px",
    lineHeight: "30px",
    padding: "10px 15px",
    cursor: "pointer",
  },
  btnSubmit: {
    fontFamily: "Sen",
    fontStyle: "normal",
    fontWeight: 700,
    fontSize: "25px",
    lineHeight: "30px",
    color: "#11484F",
    cursor: "pointer",
    border: "1px solid #11484F",
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "10px 10px",
    display: "flex",
    alignItems: "center",
  },
});

const providerOptions = {};

function Nav({ children }) {
  const classes = useStyles();
  const [instance, setInstance] = useState();
  const [signer, setSigner] = useState();
  const [address, setAddress] = useState();
  const [wmaticContract, setWmaticContract] = useState();
  const [swapContract, setSwapContract] = useState();
  const [campaignFactoryContract, setCampaignFactoryContract] = useState();

  const [amountIn, setAmountIn] = useState();

  // polygon mumbai testnet
  const wmaticAddress = "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889";
  const swapAddress = "0x0000000000000000000000000000000000000000"; // TODO: replace with correct address
  const campaignFactoryAddress = "0x3621cf993dA8d97Ae8BeBC5C420bF02eeE734418";

  useEffect(() => {
    if (instance) {
      const provider = new ethers.providers.Web3Provider(instance);
      setSigner(provider.getSigner());
    }
  }, [instance]);

  useEffect(() => {
    const setUp = async () => {
      if (signer) {
        setAddress(await signer.getAddress());

        setWmaticContract(new ethers.Contract(wmaticAddress, ERC20Abi, signer));
        setSwapContract(new ethers.Contract(swapAddress, SwapAbi, signer));
        setCampaignFactoryContract(
          new ethers.Contract(
            campaignFactoryAddress,
            CampaignFactoryAbi,
            signer
          )
        );
      }
    };

    setUp();
  }, [signer]);

  useEffect(() => {
    const fetch = async () => {
      if (campaignFactoryContract) {
        console.log(
          await campaignFactoryContract.getDeployedCampaignContracts()
        );
        console.log(await campaignFactoryContract.getLastDeployedCampaign());
      }
    };
    fetch();
  }, [campaignFactoryContract]);

  async function connectWallet() {
    try {
      let web3Modal = new Web3Modal({
        cacheProvider: false,
        providerOptions,
      });
      const web3ModalInstance = await web3Modal.connect();
      const web3ModalProvider = await ethers.providers.Web3Provider(
        web3ModalInstance
      );
      console.log(web3ModalProvider);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <Box p={4}>
        <Box display="flex" width="100%" alignItems="center">
          <Box
            display="flex"
            width="70%"
            justifyContent="flex-start"
            alignItems="center"
          >
            <Logo/>
          </Box>
          <Box
            display="flex"
            width="100%"
            justifyContent="flex-end"
            alignItems="center"
          >
            <Box
              display="flex"
              justifyContent="space-between"
              width="100%"
              alignItems="center"
            >
              <Link to="/" style={{ textDecoration: "none" }}>
                <Typography className={classes.link}>Home</Typography>
              </Link>
              <Link to="/project" style={{ textDecoration: "none" }}>
                <Typography className={classes.link}>Project</Typography>
              </Link>
              <Link to="/submit" style={{ textDecoration: "none" }}>
                <button className={classes.btnSubmit}>
                  Submit
                  <img src={AddIcon} style={{ paddingLeft: "5px" }} />
                </button>
              </Link>
              {/* <button className={classes.btnWallet} onClick={connectWallet}>
                Connect Wallet
              </button> */}
              <ConnectButton />
            </Box>
          </Box>
        </Box>
      </Box>
      <Box>{children}</Box>
      <Box mt={3} p={4} style={{ height: "200px", backgroundColor: "black" }}>
        <Box display="flex" width="100%">
          <Box display="flex" width="100%" justifyContent="flex-start">
            <Typography className={classes.coin}>Coin</Typography>
            <Typography className={classes.rise}>Rise</Typography>
          </Box>
          <Box
            display="flex"
            width="100%"
            alignItems="flex-end"
            flexDirection="column"
            mr={5}
          >
            <h1 style={{ margin: 0, color: "white" }}>Community</h1>
            <Box
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "25%",
                alignItems: "center",
              }}
              mt={3}
            >
              <p style={{ margin: 0, color: "white" }}>Twitter</p>
              <TwitterLogo />
            </Box>
            <Box
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "25%",
                alignItems: "center",
              }}
              mt={2}
            >
              {" "}
              <a
                href="https://github.com/coin-rise/coin-rise"
                style={{ textDecoration: "none", color: "white" }}
              >
                <p style={{ margin: 0, color: "white" }}>Github</p>
              </a>
              <GithubLogo />
            </Box>
          </Box>
        </Box>
        <Box display="flex">
          <Inputs type="text" width={300} borderRadius="0px" />
          <button
            style={{
              backgroundColor: "#43C5D6",
              color: "black",
              padding: "19px 50px",
            }}
          >
            Register
          </button>
        </Box>
      </Box>
    </>
    // <nav style={{ display: "flex" }}>
    //   <a href="/">
    //     <b>Coin rise</b>
    //   </a>
    //   <a href="/submit">
    //     <button>Submit a project</button>
    //   </a>
    //   {address ?? (
    //     <button
    //       onClick={async () => {
    //         setInstance(await web3Modal.connect());
    //       }}
    //     >
    //       Connect Wallet
    //     </button>
    //   )}
    //   {wmaticContract && swapContract && (
    //     <div>
    //       <input
    //         id="amountIn"
    //         placeholder="amount in"
    //         value={amountIn}
    //         onChange={(e) => setAmountIn(e.target.value)}
    //       />
    //       <button
    //         onClick={() => {
    //           wmaticContract.approve(
    //             swapContract.address,
    //             ethers.constants.MaxUint256
    //           );
    //         }}
    //       >
    //         Approve
    //       </button>
    //       <button
    //         onClick={() => {
    //           swapContract.swapExactInputSingle(
    //             ethers.utils.parseUnits(
    //               amountIn,
    //               18 // wmatic has 18 decimals
    //             )
    //           );
    //         }}
    //       >
    //         Swap
    //       </button>
    //     </div>
    //   )}
    // </nav>
  );
}

export default Nav;
