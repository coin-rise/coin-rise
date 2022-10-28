const networkConfig = {
    default: {
        name: "hardhat",
        keeperRegistry: "0x02777053d6764996e594c3E88AF1D58D5363a2e6",
        linkToken: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
        linkTokenWhale: "0x22951f1D74839e96c4cC57D15da0c5c2bd27a868",
        DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        wMatic: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        wMaticWhale: "0xc74aeDAA57D96c6f2e2566552b3dea3a0345Fa46",
        daiWhale: "0xb2a33ae0E07fD2ca8DBdE9545F6ce0b3234dc4e8",
        registryContract: "0x02777053d6764996e594c3E88AF1D58D5363a2e6",
    },
    31337: {
        name: "localhost",
        keeperRegistry: "0x02777053d6764996e594c3E88AF1D58D5363a2e6",
        linkToken: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
        linkTokenWhale: "0x22951f1D74839e96c4cC57D15da0c5c2bd27a868",
        DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        wMatic: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        wMaticWhale: "0xc74aeDAA57D96c6f2e2566552b3dea3a0345Fa46",
        daiWhale: "0xb2a33ae0E07fD2ca8DBdE9545F6ce0b3234dc4e8",
    },
    80001: {
        name: "mumbai",
        swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        wMatic: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        DAI: "0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747", // Attention: This is official the USDC token
        keeperRegistry: "0x02777053d6764996e594c3E88AF1D58D5363a2e6",
        linkToken: "0x326c977e6efc84e512bb9c30f76e30c160ed06fb",
        registryContract: "0x02777053d6764996e594c3E88AF1D58D5363a2e6",
    },
    137: {
        name: "polygon",
        linkToken: "0xb0897686c545045afc77cf20ec7a532e3120e0f1",
        swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        wMatic: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        keeperRegistry: "0x02777053d6764996e594c3E88AF1D58D5363a2e6",
        wMaticWhale: "0xc74aeDAA57D96c6f2e2566552b3dea3a0345Fa46",
        daiWhale: "0xb2a33ae0E07fD2ca8DBdE9545F6ce0b3234dc4e8",
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
