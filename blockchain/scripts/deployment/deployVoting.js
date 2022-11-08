const { ethers, network } = require("hardhat")
const fs = require("fs")
const {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
    deployedContractsPath,
    networkConfig,
} = require("../../helper-hardhat-config")

const { updateContractData, verify } = require("../../helper-functions")

async function deployVoting(chainId) {
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    const Voting = await ethers.getContractFactory("Voting")

    const filePath = deployedContractsPath
    const deployedContracts = JSON.parse(fs.readFileSync(filePath, "utf-8"))

    if (chainId in deployedContracts) {
        if ("CampaignManager" in deployedContracts[chainId]) {
            console.log("CampaignManager contract found...")

            const campaignManagerAddress = deployedContracts[chainId]["CampaignManager"].address

            const voting = await Voting.deploy(campaignManagerAddress)

            await voting.deployTransaction.wait(waitBlockConfirmations)

            console.log(`Voting Contract deployed to ${voting.address} on ${network.name} `)

            await updateContractData(voting, chainId, "Voting")

            if (!developmentChains.includes(network.name)) {
                await verify(voting.address, [campaignManagerAddress])
            }

            console.log("Set the voting address in campaing manager contract...")
            const campaignManager = await ethers.getContractAt(
                "CampaignManager",
                campaignManagerAddress
            )

            let tx = await campaignManager.setVotingContractAddress(voting.address)
            await tx.wait()
        }
    }
}

module.exports = { deployVoting }
