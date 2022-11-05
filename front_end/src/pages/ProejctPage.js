import React, { useState } from "react";
import StepperIcon from "../assets/StepperIcon.svg";
import { Box, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Inputs from "../components/Ui";
import Card from "../components/Card/Card";
import { Link } from "react-router-dom";

const ProejctPage = () => {
  const data = [1, 2, 3, 4];
  const AllComapain = [{}, {}, {}];
  const [text, setText] = useState("");

  return (
    <div style={{ marginLeft: "8rem", marginTop: "2rem" }}>
      <Inputs
        type="text"
        width={400}
        onChange={(e) => setText(e.target.value)}
      />
      <Box display="flex" flexWrap="wrap">
        {data
          ?.filter((el) => el?.toString().includes(text))
          .map((el) => (
            <Link
              to={`/project/${el}`}
              style={{
                textDecoration: "none",
                color: "black",
                cursor: "pointer",
              }}
            >
              <Card />
            </Link>
          ))}
      </Box>
    </div>
  );
};

export default ProejctPage;
