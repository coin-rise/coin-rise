import "./App.css";
import React, { useState, useEffect } from "react";
import Form from "./components/Form";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Project from "./pages/ProejctPage";
import { ethers, BigNumber } from "ethers";
import { storeFiles, makeFileObjects, retrieveFiles, loadData} from "./components/Storage";

import CampaignAbi from "./artifacts/contracts/Campaign.sol/Campaign.json";
const campaignAddress = "0x1a111771e2FD5c1Ee970CdDd45a89268120Bc45A";

function App() {

  /**
   * Create a new Campaign for funding non-profit projects
   */
  const getCampaignURI = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          campaignAddress,
          CampaignAbi.abi,
          signer
        );

        let cid = await contract.getCampaignURI();
        const stylesMining = ["color: black", "background: yellow"].join(";");
        console.log(
          "%c campaign IPFS CID =  %s",
          stylesMining,
          cid
        );
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
    //console.log(content.campaignName)
  };
  
  const test = async (cid) => {
    let cid_i = await getCampaignURI();
    await retrieveData(cid_i);
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
