const { ethers, network } = require("hardhat")
const fs = require("fs")
const {
    developmentChains,
    deployedContractsPath,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../../helper-hardhat-config")

const { updateContractData, verify } = require("../../helper-functions")

async function deployCampaignFactory(chainId) {
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    const CampaignFactory = await ethers.getContractFactory("CampaignFactory")

    const filePath = deployedContractsPath
    const deployedContracts = JSON.parse(fs.readFileSync(filePath, "utf-8"))

    if (chainId in deployedContracts) {
        if ("Campaign" in deployedContracts[chainId]) {
            console.log("Campaign contract found...")

            const campaignAddress = deployedContracts[chainId]["Campaign"].address

            const campaignFactory = await CampaignFactory.deploy(campaignAddress)

            await campaignFactory.deployTransaction.wait(waitBlockConfirmations)

            console.log(
                `Campaign Factory Contract deployed to ${campaignFactory.address} on ${network.name} `
            )

            await updateContractData(campaignFactory, chainId, "CampaignFactory")

            if (!developmentChains.includes(network.name)) {
                await verify(campaignFactory.address, [campaignAddress])
            }
        } else {
            console.log("Cannot deploy factory. No Campaign contract found on this network...")
        }
    }
}

module.exports = {
    deployCampaignFactory,
}
