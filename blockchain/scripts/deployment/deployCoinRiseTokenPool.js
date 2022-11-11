const { ethers, network } = require("hardhat")
const fs = require("fs")
const {
    developmentChains,
    deployedContractsPath,
    VERIFICATION_BLOCK_CONFIRMATIONS,
    networkConfig,
} = require("../../helper-hardhat-config")

const { updateContractData, verify } = require("../../helper-functions")

async function deployCoinRiseTokenPool(chainId) {
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    const CoinRiseTokenPool = await ethers.getContractFactory("CoinRiseTokenPool")

    const filePath = deployedContractsPath
    const deployedContracts = JSON.parse(fs.readFileSync(filePath, "utf-8"))

    if (chainId in deployedContracts) {
        if ("CampaignManager" in deployedContracts[chainId] && "DAI" in networkConfig[chainId]) {
            const campaignManagerAddress = deployedContracts[chainId]["CampaignManager"].address

            const campaignManager = await ethers.getContractAt(
                "CampaignManager",
                campaignManagerAddress
            )

            const stableTokenAddress = await campaignManager.getStableTokenAddress()

            const coinRiseTokenPool = await CoinRiseTokenPool.deploy(
                stableTokenAddress,
                campaignManagerAddress
            )

            await coinRiseTokenPool.deployTransaction.wait(waitBlockConfirmations)

            console.log(
                `CoinRiseTokenPool Contract deployed to ${coinRiseTokenPool.address} on ${network.name} `
            )

            await updateContractData(coinRiseTokenPool, chainId, "CoinRiseTokenPool")

            if (!developmentChains.includes(network.name)) {
                await verify(coinRiseTokenPool.address, [
                    stableTokenAddress,
                    campaignManagerAddress,
                ])
            }

            console.log("Set the token pool...")

            const tx = await campaignManager.setTokenPoolAddress(coinRiseTokenPool.address)
            await tx.wait(1)
        }
    }
}

module.exports = {
    deployCoinRiseTokenPool,
}
