import React, { useEffect, useState } from "react";
import Img1 from "../assets/Img1.svg";
import Img2 from "../assets/Img2.svg";
import Img3 from "../assets/Img3.svg";
import Img4 from "../assets/Img4.svg";
import Inputs from "../components/Ui";
import ProejctPage from "./ProejctPage";
import Sponsor1 from "../assets/Sponsor1.svg";
import Sponsor2 from "../assets/Sponsor2.svg";
import Sponsor3 from "../assets/Sponsor3.svg";
import { useNavigate } from "react-router-dom";

function Home() {
  const [data, setData] = useState([]);
  const navigate=useNavigate()
  function handleSubmit(){
    navigate('/submit')
  }
  function handleFund(){
    navigate('/project')

  }
  return (
    <div
      style={{
        marginLeft: "2rem",
        marginTop: "2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <img src={Img1} style={{ height: "400px" }} />
        <img src={Img2} style={{ height: "250px" }} />
        <img src={Img3} style={{ height: "200px" }} />
        <img src={Img4} style={{ height: "400px" }} />
      </div>
      <div>
        <h1>Coin Rise helps helps you get funding for your project </h1>
        <p>We help non profits organization get funding using web3 </p>
        <button
          style={{
            color: "white",
            backgroundColor: "#11484F",
            borderRadius: "10px",
            fontFamily: "Sen",
            fontStyle: "normal",
            fontWeight: 700,
            fontSize: "25px",
            lineHeight: "30px",
            padding: "10px 55px",
            cursor: "pointer",
            marginRight: "20px",
          }}
          onClick={handleSubmit}
        >
          Submit

        </button>
        <button
          style={{
            color: "#11484F",
            backgroundColor: "white",
            borderRadius: "10px",
            fontFamily: "Sen",
            fontStyle: "normal",
            fontWeight: 700,
            fontSize: "25px",
            lineHeight: "30px",
            padding: "10px 15px",
            cursor: "pointer",
            border: "3px solid #11484F",
          }}
          onClick={handleFund}
        >
          Fund a project
        </button>

        <h1>Project </h1>
        <div style={{ marginLeft: "-8rem", marginTop: "2rem" }}>
          <ProejctPage />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <h1>NEWSLETTER</h1>
        <Inputs type="text" width={600} backgroundColor="white" />
        <button
          style={{
            color: "white",
            backgroundColor: "#11484F",
            borderRadius: "10px",
            fontFamily: "Sen",
            fontStyle: "normal",
            fontWeight: 700,
            fontSize: "25px",
            lineHeight: "30px",
            padding: "10px 55px",
            cursor: "pointer",
            marginRight: "20px",
            marginTop: "20px",
          }}
        >
          Register
        </button>
        <h1>Sponsors</h1>
        <div style={{ display: "flex" }}>
          <img src={Sponsor1} style={{ marginRight: "30px" }} />
          <img src={Sponsor2} style={{ marginRight: "30px" }} />
          <img src={Sponsor3} />
        </div>
      </div>
    </div>
  );
}

export default Home;
