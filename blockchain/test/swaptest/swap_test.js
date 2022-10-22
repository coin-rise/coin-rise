const { expect } = require("chai")
const { ethers } = require("hardhat")

const DAI =  process.env.DAI; //0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063
const WMATIC = process.env.WMATIC;//0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270
const SwapRouter = process.env.SWAPROUTER;

describe("SwapToken", () => {
  let SwapToken
  let accounts
  let wMatic
  let dai
  let swapRouter

  before(async () => {
    accounts = await ethers.getSigners(1)

    wMatic = await ethers.getContractAt("IWMATIC", WMATIC)
    dai = await ethers.getContractAt("IERC20", DAI)
    swapRouter = await ethers.getContractAt("ISwapRouter", SwapRouter)

    const SwapToken = await ethers.getContractFactory("SwapToken")
    swapToken = await SwapToken.deploy(swapRouter.address, wMatic.address, dai.address)
    await swapToken.deployed()
    console.log("SwapTonen deployed");

    
  })

  it("swapExactInputSingle", async () => {
    const amountIn = 10n ** 18n

    // Deposit wMatic
    await wMatic.deposit({ value: amountIn })
    await wMatic.approve(swapToken.address, amountIn)

    // Swap
    await swapToken.swapExactInputSingle(amountIn)

    console.log("DAI balance", await dai.balanceOf(accounts[0].address))
  })

 /* it("swapExactOutputSingle", async () => {
    const wMaticAmountInMax = 10n ** 18n
    const daiAmountOut = 100n * 10n ** 18n

    // Deposit wMatic
    await wMatic.deposit({ value: wMaticAmountInMax })
    await wMatic.approve(swapToken.address, wMaticAmountInMax)
    console.log("kl ");
    // Swap
    await swapToken.swapExactOutputSingle(daiAmountOut, wMaticAmountInMax)

    console.log("DAI balance", await dai.balanceOf(accounts[0].address))
  })*/

})