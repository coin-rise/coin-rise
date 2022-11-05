import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { ReactComponent as Like } from "../../assets/Like.svg";
import { ReactComponent as Clock } from "../../assets/Clock.svg";

import CircularProgress, {
  circularProgressClasses,
} from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";

export const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor:
      theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === "light" ? "#5CA05F" : "#308fe8",
  },
}));
const Card = () => {
  const [value] = useState(50);
  return (
    <Box
      mt={2}
      mr={2}
      style={{ width: "400px", height: "478px", border: "1px solid #D9D9D9" }}
    >
      <img
        src="https://pixl8-cloud-techuk.s3.eu-west-2.amazonaws.com/prod/public/f1afc92b-2d5d-42d3-bd1b4d75769849e5/750x421_highestperformance_/blockchainreimagined1200x628pxfinal.jpg"
        width="100%"
        height="40%"
      />
      <Box mx={2} mt={2}>
        <Box display="flex" width="100%">
          <Box display="flex" justifyContent="flex-start" width="100%">
            <h5
              style={{
                margin: 0,
              }}
            >
              Feed A chiled Project
            </h5>
          </Box>
          <Box display="flex" justifyContent="flex-end" width="100%">
            <Like width="20px" height="20px" />
          </Box>
        </Box>
      </Box>
      <Box mt={2} ml={2}>
        <p style={{ margin: 0 }}>
          We have an orphonage with 200 children displaced by flood in Africa
        </p>
      </Box>

      <Box mt={5} ml={2}>
        <h4 style={{ margin: 0 }}>Philantropy</h4>
      </Box>

      <Box mx={2} mt={2}>
        <Box display="flex" alignItems="center">
          <Box display="flex" justifyContent="flex-start" width="100%">
            <p>$546 Raised</p>
          </Box>
          <Box display="flex" justifyContent="flex-end" width="100%">
            {value}%
          </Box>
        </Box>
        <BorderLinearProgress variant="determinate" value={value} />
      </Box>
      <Box ml={2} mt={2} display="flex" alignItems="center">
        <Clock width="20px" height="20px" style={{ marginRight: "10px" }} />
        <p style={{ margin: 0 }}>25 days</p>
      </Box>
    </Box>
  );
};

export default Card;
