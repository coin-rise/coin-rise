import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import ERC20Abi from "../abis/ERC20.json";
import SwapAbi from "../abis/Swap.json";

const web3Modal = new Web3Modal({
  providerOptions: {},
});

function Nav() {
  const [instance, setInstance] = useState();
  const [signer, setSigner] = useState();
  const [address, setAddress] = useState();
  const [wmaticContract, setWmaticContract] = useState();
  const [swapContract, setSwapContract] = useState();

  const [amountIn, setAmountIn] = useState();

  // polygon mumbai testnet
  const wmaticAddress = "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889";
  const swapAddress = "0x0000000000000000000000000000000000000000"; // TODO: replace with correct address

  useEffect(() => {
    if (instance) {
      const provider = new ethers.providers.Web3Provider(instance);
      setSigner(provider.getSigner());
    }
  }, [instance]);

  useEffect(() => {
    const setUp = async () => {
      if (signer) {
        setAddress(await signer.getAddress());

        setWmaticContract(new ethers.Contract(wmaticAddress, ERC20Abi, signer));
        setSwapContract(new ethers.Contract(swapAddress, SwapAbi, signer));
      }
    };

    setUp();
  }, [signer]);

  return (
    <nav style={{ display: "flex" }}>
      <a href="/">
        <b>Coin rise</b>
      </a>
      <a href="/submit">
        <button>Submit a project</button>
      </a>
      {address ?? (
        <button
          onClick={async () => {
            setInstance(await web3Modal.connect());
          }}
        >
          Connect Wallet
        </button>
      )}
      {wmaticContract && swapContract && (
        <div>
          <input
            id="amountIn"
            placeholder="amount in"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
          />
          <button
            onClick={() => {
              wmaticContract.approve(
                swapContract.address,
                ethers.constants.MaxUint256
              );
            }}
          >
            Approve
          </button>
          <button
            onClick={() => {
              swapContract.swapExactInputSingle(
                ethers.utils.parseUnits(
                  amountIn,
                  18 // wmatic has 18 decimals
                )
              );
            }}
          >
            Swap
          </button>
        </div>
      )}
    </nav>
  );
}

export default Nav;
