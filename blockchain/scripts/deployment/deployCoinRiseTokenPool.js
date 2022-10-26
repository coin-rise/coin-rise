const { ethers, network } = require("hardhat")
const fs = require("fs")
const {
    developmentChains,
    deployedContractsPath,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../../helper-hardhat-config")

const { updateContractData } = require("../../helper-functions")

async function deployCoinRiseTokenPool(chainId) {
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    const CoinRiseTokenPool = await ethers.getContractFactory("CoinRiseTokenPool")

    //TODO: deploy the CoinriseTokenPool
}

module.exports = {
    deployCoinRiseTokenPool,
}
