const { ethers, network } = require("hardhat")
const fs = require("fs")
const {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
    deployedContractsPath,
    networkConfig,
} = require("../../helper-hardhat-config")

const { updateContractData } = require("../../helper-functions")

async function deployCampaignManager(chainId) {
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    const CampaignManager = await ethers.getContractFactory("CampaignManager")

    const filePath = deployedContractsPath
    const deployedContracts = JSON.parse(fs.readFileSync(filePath, "utf-8"))

    if (chainId in deployedContracts) {
        if ("CampaignFactory" in deployedContracts[chainId] && "DAI" in networkConfig[chainId]) {
            console.log("CampaignFactory contract found...")

            const campaignFactoryAddress = deployedContracts[chainId]["CampaignFactory"].address
            const stableTokenAddress = networkConfig[chainId].DAI

            const campaignManager = await CampaignManager.deploy(
                campaignFactoryAddress,
                stableTokenAddress
            )

            await campaignManager.deployTransaction.wait(waitBlockConfirmations)

            console.log(
                `Campaign Manager Contract deployed to ${campaignManager.address} on ${network.name} `
            )

            await updateContractData(campaignManager, chainId, "CampaignManager")

            //TODO: verify the contract with the help of the helper functions
        }
    } else {
        console.log("Cannot deploy manager. No CampaignFactory contract found on this network...")
    }
}

module.exports = {
    deployCampaignManager,
}
