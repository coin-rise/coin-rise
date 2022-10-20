const { ethers, network } = require("hardhat")

async function mockKeepers() {
    const managerContract = await ethers.getContractAt("CampaignManager")
    const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""))
    const { upkeepNeeded } = await managerContract.callStatic.checkUpkeep(checkData)

    if (upkeepNeeded) {
        const tx = await managerContract.perfomUpkeep(checkData)
        const txReceipt = await tx.wait(1)
        console.log("Perform Upkeep")
    } else {
        console.log("No upkeep needed!")
    }
}

mockKeepers()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
