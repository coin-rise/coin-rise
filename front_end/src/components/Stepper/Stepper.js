/*eslint-disable*/
import React from "react";
import {
  Step,
  StepperProps,
  Stepper as MUIStepper,
  StepConnector,
  StepIcon as MUIStepIcon,
  StepLabel as MUIStepLabel,
} from "@mui/material";
import { withStyles } from "@mui/styles";

const StepLabel = withStyles({
  root: {
    "& .MuiStepLabel-label.MuiStepLabel-active": {
      color: "#11484F",
    },
    "& .MuiStepLabel-label.MuiStepLabel-completed": {
      color: "#11484F",
    },
  },
  label: {
    color: "#BCC6D3",
  },
})(MUIStepLabel);
const StepIcon = withStyles({
  root: {
    width: "34px",
    height: "34px",
  },
  completed: {
    color: "#11484F !important",
  },
  text: {
    color: "#FFFFFF",
  },
  active: {
    color: "#11484F !important",
  },
})(MUIStepIcon);

const Connector = withStyles({
  alternativeLabel: {
    top: 15,
    left: "calc(-49% + 16px)",
    right: "calc(51% + 16px)",
  },
  active: {
    "& $line": {
      borderColor: "#11484F",
    },
  },
  completed: {
    "& $line": {
      borderColor: "#11484F",
    },
  },
  line: {
    borderColor: "#11484F",
    borderTopWidth: 3,
    borderRadius: 1,
  },
})(StepConnector);

const Stepper = ({ steps, alternativeLabel = true, activeStep }) => {
  return (
    <MUIStepper
      style={{ width: "100%" }}
      alternativeLabel={alternativeLabel}
      connector={<Connector />}
      activeStep={activeStep}
    >
      {steps.map((label) => {
        const stepProps = {};
        const labelProps = {};
        return (
          <Step key={label} {...stepProps}>
            <StepLabel StepIconComponent={StepIcon} {...labelProps}>
              {label}
            </StepLabel>
          </Step>
        );
      })}
    </MUIStepper>
  );
};

export default Stepper;
