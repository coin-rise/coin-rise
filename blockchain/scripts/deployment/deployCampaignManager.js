const { ethers, network } = require("hardhat")
const fs = require("fs")
const {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
    deployedContractsPath,
    networkConfig,
} = require("../../helper-hardhat-config")

const { updateContractData, verify } = require("../../helper-functions")

async function deployCampaignManager(chainId) {
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    const CampaignManager = await ethers.getContractFactory("CampaignManager")

    const filePath = deployedContractsPath
    const deployedContracts = JSON.parse(fs.readFileSync(filePath, "utf-8"))

    if (chainId in deployedContracts) {
        if (
            "CampaignFactory" in deployedContracts[chainId] &&
            "DAI" in networkConfig[chainId] &&
            "CoinRiseNFT" in deployedContracts[chainId]
        ) {
            console.log("CampaignFactory contract found...")

            const campaignFactoryAddress = deployedContracts[chainId]["CampaignFactory"].address

            const coinRiseNftAddress = deployedContracts[chainId]["CoinRiseNFT"].address

            let stableTokenAddress = networkConfig[chainId].DAI

            // it the contract is deployed to a testnet deploy a mock DAI token
            if (network.name == "mumbai") {
                const MockToken = await ethers.getContractFactory("MockToken")
                const coinRiseDai = await MockToken.deploy("CoinRiseDAI", "CRDAI")

                await coinRiseDai.deployTransaction.wait(waitBlockConfirmations)

                await verify(coinRiseDai.address, ["CoinRiseDAI", "CRDAI"])

                stableTokenAddress = coinRiseDai.address
            }
            const campaignManager = await CampaignManager.deploy(
                campaignFactoryAddress,
                stableTokenAddress,
                coinRiseNftAddress
            )

            await campaignManager.deployTransaction.wait(waitBlockConfirmations)

            console.log(
                `Campaign Manager Contract deployed to ${campaignManager.address} on ${network.name} `
            )

            await updateContractData(campaignManager, chainId, "CampaignManager")

            if (!developmentChains.includes(network.name)) {
                await verify(campaignManager.address, [
                    campaignFactoryAddress,
                    stableTokenAddress,
                    coinRiseNftAddress,
                ])
            }

            console.log("Set the initial fees to 100 => 1% ...")
            let tx = await campaignManager.setFees(100)
            await tx.wait(1)

            console.log("Transfer the ownership of the factory to the Manager Contract..")

            const campaignFactory = await ethers.getContractAt(
                "CampaignFactory",
                campaignFactoryAddress
            )
            tx = await campaignFactory.transferOwnership(campaignManager.address)
            await tx.wait(1)
        } else {
            console.log(
                "Cannot deploy manager. No CampaignFactory contract found on this network..."
            )
        }
    }
}

module.exports = {
    deployCampaignManager,
}
