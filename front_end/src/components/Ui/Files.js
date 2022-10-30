import * as React from "react";
import UploadIcon from "../../assets/UploadIcon.svg";

export default function File({ width, ...props }) {
  return (
    <div style={{ backgroundColor: "#D9D9D9", width }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "35vh",
          borderRadius: "10px",
        }}
      >
        <label
          for="inputTag"
          style={{
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: 700,
            fontSize: "25px",
            color: "#11484F",
          }}
        >
          <img
            src={UploadIcon}
            width={40}
            height={40}
            style={{ marginBottom: "20px" }}
          />{" "}
          Upload Image <br />
          <input
            id="inputTag"
            type="file"
            style={{ display: "none" }}
            {...props}
          />
          <br />
          <span id="imageName"></span>
        </label>
      </div>
    </div>
  );
}
