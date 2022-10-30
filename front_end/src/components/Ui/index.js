import React from "react";
import FormInput from "./Inputs";
import BasicSelect from "./Select";

const Inputs = ({ type, ...props }) => {
  switch (type) {
    case "text":
      return <FormInput {...props} />;
    case "select":
      return <BasicSelect {...props} />;

    default:
      return <FormInput {...props} />;
  }
};

export default Inputs;
