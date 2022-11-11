import { Box } from "@mui/material";
import React from "react";
import clsx from "clsx";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(() => ({
  scrollBar: {
    overflowY: "scroll",
    "&::-webkit-scrollbar": {
      backgroundColor: "transparent",
      width: "0.5rem",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#d7e0eb",
      borderRadius: "20px",
    },
    "&::-webkit-resizer": {
      backgroundColor: "black",
    },
  },
}));

export default function ScrollBar({ className, children, ...props }) {
  const classes = useStyles();

  return (
    <>
      <Box {...props} className={clsx(className, classes.scrollBar)}>
        {children}
      </Box>
    </>
  );
}
