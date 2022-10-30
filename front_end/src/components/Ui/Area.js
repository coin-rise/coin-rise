import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

export default function Area({ width,rows, ...props }) {
  return (
    <Box
      component="form"
      sx={{
        "& > :not(style)": {
          width,
          backgroundColor: "#D9D9D9",
          borderRadius: "10px",
        },
      }}
      noValidate
      autoComplete="off"
    >
      <TextField
        id="outlined-basic"
        variant="outlined"
        {...props}
        multiline={true}
        rows={rows}
      />
    </Box>
  );
}
