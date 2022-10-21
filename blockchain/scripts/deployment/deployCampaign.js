const { ethers, network } = require("hardhat")

const {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../../helper-hardhat-config")
const { updateContractData } = require("../../helper-functions")

async function deployCampaign(chainId) {
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    const campaignFactory = await ethers.getContractFactory("Campaign")

    const campaign = await campaignFactory.deploy()

    await campaign.deployTransaction.wait(waitBlockConfirmations)

    console.log(`Campaign  Contract deployed to ${campaign.address} on ${network.name} `)

    await updateContractData(campaign, chainId, "Campaign")

    //TODO: verify the contract with the help of the helper functions
}

module.exports = {
    deployCampaign,
}
