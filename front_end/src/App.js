import "./App.css";
import React, { useState, useEffect } from "react";
import Form from "./components/Form";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Project from "./pages/ProejctPage";
import { storeFiles, makeFileObjects, retrieveFiles, loadData} from "./components/Storage";

function App() {

  useEffect(() => {
    const setUp = async () => {
      const testCid = 'bafybeibhk6qmeh6s6epgvoncmc6qgrfcoepccsv7pifjim2r7rat2b6s3a';
      const files = await retrieveFiles(testCid);
      const content = await loadData(files[0].cid);
      console.log(content.campaignName)
    };
    setUp();
  }, []);

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
