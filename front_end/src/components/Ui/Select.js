import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

export default function BasicSelect({ options, width }) {
  const [value, setValue] = React.useState("");

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl
        style={{ width, backgroundColor: "#D9D9D9", borderRadius: "10px" }}
      >
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={value}
          label="Valeu"
          onChange={handleChange}
        >
          {options?.map((option) => (
            <MenuItem value={10}>{option}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
