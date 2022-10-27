const { ethers, network } = require("hardhat")

const {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../../helper-hardhat-config")
const { updateContractData, verify } = require("../../helper-functions")

async function deployCampaign(chainId) {
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    const Campaign = await ethers.getContractFactory("Campaign")

    const campaign = await Campaign.deploy()

    await campaign.deployTransaction.wait(waitBlockConfirmations)

    console.log(`Campaign  Contract deployed to ${campaign.address} on ${network.name} `)

    await updateContractData(campaign, chainId, "Campaign")
    if (!developmentChains.includes(network.name)) {
        await verify(campaign.address, [])
    }
}

module.exports = {
    deployCampaign,
}
