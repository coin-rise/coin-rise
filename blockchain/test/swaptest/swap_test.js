const { expect } = require("chai")
const { ethers } = require("hardhat")

const DAI =  process.env.DAI;
const WMATIC = process.env.WMATIC;
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
    swapToken = await SwapToken.deploy(SwapRouter, wMatic, dai)
    await swapToken.deployed()

    
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

    // Swap
    await swapToken.swapExactOutputSingle(daiAmountOut, wMaticAmountInMax)

    console.log("DAI balance", await dai.balanceOf(accounts[0].address))
  })*/

})