import React from "react";
import { Radio } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";

const useStyles = makeStyles({
  iconRadio: {
    borderRadius: "50%",
    width: 22,
    height: 22,
    boxShadow:
      "inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)",
    backgroundColor: "white",
    backgroundImage:
      "linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))",
    "$root.Mui-focusVisible &": {
      outline: "2px auto rgba(19,124,189,.6)",
      outlineOffset: 2,
    },
    "input:hover ~ &": {
      backgroundColor: "#ebf1f5",
    },
    "input:disabled ~ &": {
      boxShadow: "none",
      background: "rgba(206,217,224,.5)",
    },
  },
  checkedIconRadio: {
    backgroundColor: "#11484F",
    border: "1px solid #39B54A",
    color: "#11484F",
    backgroundImage:
      "linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))",
    "&:before": {
      display: "block",
      width: 22,
      height: 22,
      backgroundImage: "white",
      content: '""',
    },
    "input:hover ~ &": {
      backgroundColor: "#11484F",
    },
  },
});
const RadioContainer = (props) => {
  const classes = useStyles();
  return (
    <Radio
      color="default"
      disableRipple
      checkedIcon={
        <span className={clsx(classes.iconRadio, classes.checkedIconRadio)} />
      }
      icon={<span className={classes.iconRadio} />}
      {...props}
      data-cy="other-input"
      inputProps={{ "aria-label": "D" }}
    />
  );
};

export default RadioContainer;
