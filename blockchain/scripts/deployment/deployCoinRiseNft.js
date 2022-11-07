const { ethers, network } = require("hardhat")

const {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../../helper-hardhat-config")
const { updateContractData, verify } = require("../../helper-functions")

async function deployCoinRiseNFT(chainId) {
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    const CoinRiseNFT = await ethers.getContractFactory("CoinRiseNFT")

    const coinRiseNFT = await CoinRiseNFT.deploy()

    await coinRiseNFT.deployTransaction.wait(waitBlockConfirmations)

    console.log(`CoinRise NFT Contract deployed to ${coinRiseNFT.address} on ${network.name}`)

    await updateContractData(coinRiseNFT, chainId, "CoinRiseNFT")

    if (!developmentChains.includes(network.name)) {
        await verify(coinRiseNFT.address, [])
    }
}

module.exports = {
    deployCoinRiseNft: deployCoinRiseNFT,
}
