const { expect, assert } = require("chai")
const { ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers")
const helpers = require("@nomicfoundation/hardhat-network-helpers")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("SwapToken Unit Test", () => {
          async function deploySwapTokenFixture() {
              let swapRouterAddress, daiAddress, wMaticAddress, whaleAddressDAI, whaleAddressWMATIC

              const [owner, swapper] = await ethers.getSigners()

              const chainId = network.config.chainId

              if (chainId in networkConfig) {
                  swapRouterAddress = networkConfig[chainId].swapRouter
                  daiAddress = networkConfig[chainId].DAI
                  wMaticAddress = networkConfig[chainId].wMatic
                  whaleAddressDAI = networkConfig[chainId].daiWhale
                  whaleAddressWMATIC = networkConfig[chainId].wMaticWhale
              } else {
                  swapRouterAddress = networkConfig["default"].swapRouter
                  daiAddress = networkConfig["default"].DAI
                  wMaticAddress = networkConfig["default"].wMatic
                  whaleAddressDAI = networkConfig[chainId].daiWhale
                  whaleAddressWMATIC = networkConfig[chainId].wMaticWhale
              }
              const swapRouter = await ethers.getContractAt("ISwapRouter", swapRouterAddress)
              const DAI = await ethers.getContractAt("IERC20", daiAddress)
              const wMatic = await ethers.getContractAt("IERC20", wMaticAddress)

              //get the control of the whales
              await helpers.impersonateAccount(whaleAddressDAI)

              const whaleDAI = await ethers.getSigner(whaleAddressDAI)

              await helpers.impersonateAccount(whaleAddressWMATIC)

              const whaleWMATIC = await ethers.getSigner(whaleAddressWMATIC)

              //give the swapper account tokens
              await DAI.connect(whaleDAI).transfer(swapper.address, ethers.utils.parseEther("100"))

              await wMatic
                  .connect(whaleWMATIC)
                  .transfer(swapper.address, ethers.utils.parseEther("100"))

              const SwapToken = await ethers.getContractFactory("SwapToken")
              const swapTokenContract = await SwapToken.deploy(
                  swapRouterAddress,
                  wMaticAddress,
                  daiAddress
              )

              return {
                  swapRouter,
                  DAI,
                  wMatic,
                  owner,
                  swapper,
                  whaleDAI,
                  whaleWMATIC,
                  swapTokenContract,
              }
          }

          describe("#swapExactInputSingle", () => {
              it("test the whales", async () => {
                  const { DAI, swapper } = await loadFixture(deploySwapTokenFixture)

                  const _balance = await DAI.balanceOf(swapper.address)
              })
          })
      })
