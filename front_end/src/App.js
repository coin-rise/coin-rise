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
