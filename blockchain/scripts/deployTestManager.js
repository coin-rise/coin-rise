const { ethers, network } = require("hardhat")
const { verify, updateContractData } = require("../helper-functions")
const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config")

async function deployTestManager() {
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS
    const chainId = network.config.chainId
    const Manager = await ethers.getContractFactory("Manager")
    console.log("Deploying contract...")
    const manager = await Manager.deploy()

    await manager.deployTransaction.wait(waitBlockConfirmations)

    console.log(`Manager  Contract deployed to ${manager.address} on ${network.name} `)

    await updateContractData(manager, chainId, "Manager")

    await verify(manager.address, [])
}

deployTestManager()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
