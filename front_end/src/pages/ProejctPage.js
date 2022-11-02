import React from "react";
import StepperIcon from "../assets/StepperIcon.svg";
import { Box, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Inputs from "../components/Ui";
import Card from "../components/Card/Card";

const ProejctPage = () => {
  const data = [1, 2, 3, 4];
  return (
    <div style={{ marginLeft: "8rem", marginTop: "2rem" }}>
      <Inputs type="text" width={400} />
      <Box display='flex' flexWrap='wrap'>
      {data?.map((el) => (
        <Card />
      ))}</Box>
    </div>
  );
};

export default ProejctPage;
