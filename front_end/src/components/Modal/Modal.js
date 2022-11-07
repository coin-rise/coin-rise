import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 700,
  backgroundColor: "white",
  p: 4,
};

export default function BasicModal({ open, handleClose, children, props }) {
  return (
    <Modal open={open} onClose={handleClose} {...props}>
      <div style={style}>{children}</div>
    </Modal>
  );
}
