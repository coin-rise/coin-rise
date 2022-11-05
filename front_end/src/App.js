import "./App.css";
import React, { useState, useEffect } from "react";
import Form from "./components/Form";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Project from "./pages/ProejctPage";
import { ethers, BigNumber } from "ethers";
import {
  storeFiles,
  makeFileObjects,
  retrieveFiles,
  loadData,
} from "./components/Storage";
import SpecificPage from "./pages/SpecificPage";
import CampaignAbi from "./artifacts/contracts/Campaign.sol/Campaign.json";
import CampaignFactoryAbi from "./artifacts/contracts/CampaignFactory.sol/CampaignFactory.json";

const FactoryAddress = "0xd98458e022ac999a547D49f9da37DCc6F4d1f19F";
const campaignAddress = "0x3A7A5176Caf503dEb19d06fcDE845B9D6DD01B10";

function App() {
  /**
  * Get Deployed Campaign Contracts
  */
  const getDeployedCampaignContracts = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          FactoryAddress,
          CampaignFactoryAbi.abi,
          signer
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
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          campaignaddress,
          CampaignAbi.abi,
          signer
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

  const retrieveData = async (cid) => {
    const files = await retrieveFiles(cid);
    const content = await loadData(files[0].cid);
    return content;
  };

  const makeObj = async (campaignList) => {
    let campaignObj =[];
    for (let i = 11; i < campaignList.length; i++) {
      let cid_i = await getCampaignURI(campaignList[i]);
      let  content = await retrieveData(cid_i);
      content.address = campaignList[i];
      campaignObj.push(content);
    }
    return campaignObj;
  };

  const test = async (cid) => {
    let campaignList = await getDeployedCampaignContracts();
    const campaignObj = await makeObj(campaignList);
    console.log("obj",campaignObj);
  };
  test();
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Nav>
                <Home />
              </Nav>
            }
          />
          <Route
            path="/submit"
            element={
              <Nav>
                <Form />
              </Nav>
            }
          />
          <Route
            path="/project/:id"
            element={
              <Nav>
                <SpecificPage />
              </Nav>
            }
          />
          <Route
            path="/project"
            element={
              <Nav>
                <Project />
              </Nav>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
