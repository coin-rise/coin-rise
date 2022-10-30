import React, { useState } from "react";
import { Typography, Box } from "@mui/material";
import Stepper from "./Stepper/Stepper";
import StepperGeneral from "./StepperGeneral";
import StepperInfo from "./StepperInfo";
import FinalStepper from "./FinalStepper";

function Form() {
  const [textTrack, setTextTrack] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState();
  const [url, setUrl] = useState("");
  console.log(url, "urlwawe");
  function handleChange(e) {
    setTextTrack(e.target.value);
  }
  function handleNext() {
    if (activeStep < 2) setActiveStep((prev) => prev + 1);
    else {
    }
  }
  function handlePrev() {
    setActiveStep((prev) => prev - 1);
  }
  const steps = ["  ", "", ""];
  const stepsContent = [
    <StepperGeneral setName={setName} />,
    <StepperInfo setUrl={setUrl} />,
    <FinalStepper />,
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
