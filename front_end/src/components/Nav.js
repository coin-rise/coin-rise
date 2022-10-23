import React, { useState } from "react";
import Web3Modal from "web3modal";

const web3Modal = new Web3Modal({
  providerOptions: {},
});

function Nav() {
  const [instance, setInstance] = useState();

  return (
    <nav style={{ display: "flex" }}>
      <a href="/">
        <b>Coin rise</b>
      </a>
      <a href="/submit">
        <button>Submit a project</button>
      </a>
      <button
        onClick={async () => {
          setInstance(await web3Modal.connect());
        }}
      >
        Connect Wallet
      </button>
    </nav>
  );
}

export default Nav;
