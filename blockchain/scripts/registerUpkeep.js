const { ethers, network } = require("hardhat")
const helpers = require("@nomicfoundation/hardhat-network-helpers")

const { networkConfig, developmentChains } = require("../helper-hardhat-config")

/**
 * @notice - This script is only on polygon mumbai possible
 */
async function registerUpkeep() {
    let keeperRegistryAddress, linkTokenWhale, linkTokenAddress
    const managerAddress = "0x32438092eaF505c3e1554B4316557fA3646c233d"
    const chainId = network.config.chainId

    if ((network.config.chainId = 80001)) {
        console.log(chainId)

        keeperRegistryAddress = networkConfig[chainId].keeperRegistry
        linkTokenAddress = networkConfig[chainId].linkToken
        linkTokenWhale = networkConfig[chainId].linkTokenWhale

        // get a address from polygon mainnet with a lot of LINK tokens

        const linkToken = await ethers.getContractAt("LinkToken", linkTokenAddress)

        const accounts = await ethers.getSigners()
        const signer = accounts[0]

        const balance = await linkToken.balanceOf(signer.address)
        console.log(balance)

        const keeperRegistry = await ethers.getContractAt(
            "KeeperRegistryInterface",
            keeperRegistryAddress
        )

        //TODO: Try to register the campaign contract via script
    } else {
        console.log("Wrong network... Switch to Mumbai (Polygon)")
    }
}

registerUpkeep()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
