import React, { useState } from "react";
import { Typography, Box } from "@mui/material";
import Stepper from "./Stepper/Stepper";
import StepperGeneral from "./StepperGeneral";
import StepperInfo from "./StepperInfo";
import FinalStepper from "./FinalStepper";
import { storeFiles, makeFileObjects } from "./Storage";

import { ethers, BigNumber } from "ethers";

/* campaignManager Contract Address and Contract ABI */
import contractManagerAbi from "../artifacts/contracts/CampaignManager.sol/CampaignManager.json";
const contractManagerAddress = "0x1D2C3DB58779F6cEC7e91BF12259a43ece338F97";

function Form() {
  const [textTrack, setTextTrack] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState();
  const [url, setUrl] = useState("");
  const [campaign, setCampaign] = useState({
    purpose: "Non-Profit",
    category: "",
    newWalletAddress: "",
    campaignName: "",
    campaignInfo: "",
    campaignImg: "",
    campaignDuration: "",
    minAmount: "",
    campaignVideo: "",
    extraInformation: "",
  });
  //console.log(storeFiles(makeFileObjects(name, name, name, name)), "infobj");
  //console.log(storeFiles(makeFileObjects(img)), "infobj");
  //storeFiles(file1, file2)
  function handleChange(e) {
    setTextTrack(e.target.value);
  }
  function handleNext() {
    if (activeStep < 2) setActiveStep((prev) => prev + 1);
    else {
      CreateNewCampaign();
    }
  }
  function handlePrev() {
    setActiveStep((prev) => prev - 1);
  }
  const steps = ["  ", "", ""];
  const stepsContent = [
    <StepperGeneral setCampaign={setCampaign} campaign={campaign}  />,
    <StepperInfo setCampaign={setCampaign} campaign={campaign} />,
    <FinalStepper setCampaign={setCampaign} campaign={campaign} />,
  ];

  function handleSubmit(e) {
    e.preventDefault();
    for (let i = 0; i < e.target.length - 1; i++) {
      if (e.target[i].name === "checkbox") {
        console.dir(e.target[i].checked);
      } else if (e.target[i].name === "selectMultiple") {
        console.dir(
          Array.from(e.target[i].selectedOptions).map((o) => o.value)
        );
      } else {
        console.dir(e.target[i].value);
      }
    }
    console.log("submit");
  }
  /**
   * Create a new Campaign for funding non-profit projects
   */
  const CreateNewCampaign = async () => {
    /*if (!deadline.value) {
      console.log(`Error, Please enter a valid deadline`);
      return;
    }*/

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
         *  @dev See newAttributeAdded emitted from our smart contract add_new_attribute function
         */
        contract.on("NewCampaignCreated", (newCampaign, deadline) => {
          console.log("newCampaign address :", newCampaign);
          console.log("newCampaign deadline :", deadline.toNumber());
        });
        let tx = await contract.createNewCampaign(
          //BigNumber.from(deadline.value)
          BigNumber.from(40)
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
          "%c🍵 We just added new campaign %s ",
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
            `%c🧬 new campaign added, see transaction: https://polygonscan.com/tx/${tx.hash} %s`,
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

  return (
    <Box>
      <Stepper steps={steps} activeStep={activeStep} />
      <Box width="100%">{stepsContent[activeStep]}</Box>
      <Box mt={5} mb={4} display="flex" justifyContent="center" width="100%">
        {activeStep > 0 && (
          <button
            onClick={handlePrev}
            style={{
              backgroundColor: "white",
              border: "4px solid #11484F",
              borderRadius: "10px",
              fontFamily: "Sen",
              fontSize: "25px",
              lineHeight: "30px",
              color: "#11484F",
              padding: "10px 60px",
              fontWeight: 700,
              cursor: "pointer",
              marginRight: "15px",
            }}
          >
            Previous
          </button>
        )}
        <button
          onClick={handleNext}
          style={{
            backgroundColor: "white",
            border: "4px solid #11484F",
            borderRadius: "10px",
            fontFamily: "Sen",
            fontSize: "25px",
            lineHeight: "30px",
            color: "#11484F",
            padding: "10px 60px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {activeStep == 2 ? "Submit" : "Next"}
        </button>
      </Box>
    </Box>
    // <form className="Form" onSubmit={handleSubmit}>
    //   <div>
    //     <label htmlFor="text">Text </label>
    //     <input type="text" id="text" name="text" />
    //   </div>

    //   <div>
    //     <label htmlFor="text">Text track</label>
    //     <input
    //       type="text"
    //       id="textTrack"
    //       name="textTrack"
    //       value={textTrack}
    //       onChange={handleChange}
    //     />
    //   </div>

    //   <div>
    //     <label htmlFor="textArea">TextArea </label>
    //     <textarea type="text" id="textArea" name="textArea"></textarea>
    //   </div>

    //   <div>
    //     <label>Select </label>
    //     <select id="select" name="select">
    //       <option>Option 1</option>
    //       <option>Option 2</option>
    //       <option>Option 3</option>
    //     </select>
    //     {/* {select} */}
    //   </div>

    //   <div>
    //     <label>Select multiple </label>
    //     <select id="selectMultiple" name="selectMultiple" multiple>
    //       <option>Option 1</option>
    //       <option>Option 2</option>
    //       <option>Option 3</option>
    //     </select>
    //     {/* {selectMultiple} */}
    //   </div>

    //   <div>
    //     <label>Checkbox </label>
    //     <input id="checkbox" name="checkbox" type="checkbox"></input>
    //     {/* {checkbox ? <span>Checked !</span> : null} */}
    //   </div>

    //   <div>
    //     <button>Submit</button>
    //   </div>
    // </form>
  );
}

export default Form;
