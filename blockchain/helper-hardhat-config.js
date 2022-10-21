const networkConfig = {
    default: {
        name: "hardhat",
    },
    31337: {
        name: "localhost",
    },
    80001: {
        name: "mumbai",
        swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        wMatic: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
        USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    },
    137: {
        name: "polygon",
        linkToken: "0xb0897686c545045afc77cf20ec7a532e3120e0f1",
    },
}

const developmentChains = ["hardhat", "localhost"]
const VERIFICATION_BLOCK_CONFIRMATIONS = 6
const deployedContractsPath = "./deployments/deployedContracts.json"
module.exports = {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
    deployedContractsPath,
}
