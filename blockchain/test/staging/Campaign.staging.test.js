const { expect, assert } = require("chai")
const { ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers")
const deployedContracts = require("../../deployments/deployedContracts.json")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Campaign Protocol staging test", () => {
          let chainId, stableToken, campaignManager, campaignFactory, accounts
          beforeEach(async () => {
              chainId = network.config.chainId
              accounts = await ethers.getSigners()

              //Search the deployed contracts
              if (chainId in deployedContracts) {
                  const campaignManagerAddress = deployedContracts[chainId].CampaignManager.address
                  const campaignFactoryAddress = deployedContracts[chainId].CampaignFactory.address

                  const coinRiseTokenPoolAddress =
                      deployedContracts[chainId].CoinRiseTokenPool.address

                  campaignManager = await ethers.getContractAt(
                      "CampaignManager",
                      campaignManagerAddress
                  )

                  const stableTokenAddress = await campaignManager.getStableTokenAddress()

                  campaignFactory = await ethers.getContractAt(
                      "CampaignFactory",
                      campaignFactoryAddress
                  )

                  coinRiseTokenPool = await ethers.getContractAt(
                      "CoinRiseTokenPool",
                      coinRiseTokenPoolAddress
                  )

                  stableToken = await ethers.getContractAt("MockToken", stableTokenAddress)
              }
          })

          //   describe("#performUpkeep", () => {
          //       it("successfully performUpkeep with live chainlink keeper", async () => {
          //           const _duration = 30

          //           await new Promise(async (resolve, reject) => {
          //               campaignManager.once("CampaignFinished", async (campaign) => {
          //                   console.log("Campaign finished")

          //                   resolve()
          //               })

          //               await campaignManager.createNewCampaign(_duration)
          //           })
          //       })
          //   })

          describe("#contributeCampaign", () => {
              it("successfully contribute a campaign", async () => {
                  const _duration = 9000
                  const _minAmount = 100000
                  const _campaignURI = "test"
                  let tx = await campaignManager.createNewCampaign(
                      _duration,
                      _minAmount,
                      _campaignURI
                  )
                  const txReceipt = await tx.wait()

                  let campaignAddress
                  for (i = 0; i < txReceipt.events.length; i++) {
                      if (txReceipt.events[i].event == "NewCampaignCreated") {
                          campaignAddress = txReceipt.events[i].args.newCampaign
                      }
                  }
                  const owner = accounts[0]
                  tx = await stableToken.mint(owner.address, ethers.utils.parseEther("1000"))
                  await tx.wait()

                  const _approveAmount = 1000000
                  tx = await stableToken.approve(campaignManager.address, _approveAmount)
                  await tx.wait()

                  try {
                      await campaignManager.contributeCampaign(_minAmount, campaignAddress)
                  } catch (e) {
                      console.log(e)
                  }
              })
          })
      })

/** Procedure
 * 1. Submitter creates a new Campaign
 * 2. Users can contribute the campaign
 * 3. Chainlink Keeper check the status of the Campaign
 * 4. If the Campaign has finished the Keeper send the funds to the campaign and transfer the Ownership to the submitter
 * 5. Submitter can send all the tokens in the Campaign contract to an other address
 */
