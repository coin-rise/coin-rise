const { ethers, network, run } = require("hardhat")

const {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../../helper-hardhat-config")

const { updateContractData } = require("../../helper-functions")

async function deployCampaignManager(chainId) {
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    const campaignManagerFactory = await ethers.getContractFactory("CampaignManager")

    const campaignManager = await campaignManagerFactory.deploy()

    await campaignManager.deployTransaction.wait(waitBlockConfirmations)

    console.log(
        `Campaign Manager Contract deployed to ${campaignManager.address} on ${network.name} `
    )

    await updateContractData(campaignManager, chainId, "CampaignManager")

    //TODO: verify the contract with the help of the helper functions
}

module.exports = {
    deployCampaignManager,
}
