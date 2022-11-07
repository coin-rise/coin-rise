import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export default function BasicTextFields({width,borderRadius='10px',backgroundColor="#D9D9D9",...props}) {
  return (
    <Box
      component="form"
      sx={{
        '& > :not(style)': { width,backgroundColor,borderRadius },
      }}
      noValidate
      autoComplete="off"
    >
      <TextField id="outlined-basic" variant="outlined" {...props} />
    </Box>
  );
}