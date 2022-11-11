import React from "react";
import { Checkbox } from "@mui/material/";

const CheckBoxContainer = (props) => {
  return (
    <Checkbox
      {...props}
      data-cy="male-input"
      inputProps={{ "aria-label": "A" }}
    />
  );
};

export default CheckBoxContainer;
