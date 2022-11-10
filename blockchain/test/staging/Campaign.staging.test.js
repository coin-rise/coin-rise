const { expect, assert } = require("chai")
const { ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

const deployedContracts = require("../../deployments/deployedContracts.json")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Campaign Protocol staging test", () => {
          let chainId,
              stableToken,
              campaignManager,
              campaignFactory,
              accounts,
              duration,
              minAmount,
              campaignURI,
              tokenTiers
          beforeEach(async () => {
              chainId = network.config.chainId
              accounts = await ethers.getSigners()

              //#1 Search the deployed contracts
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

              if (chainId in networkConfig) {
                  duration = networkConfig[chainId].duration
                  minAmount = networkConfig[chainId].minAmount
                  campaignURI = networkConfig[chainId].campaignURI
                  tokenTiers = networkConfig[chainId].tokenTiers
              } else {
              }
          })

          describe("#contributeCampaign", () => {
              it("#Scenario 1 : successfully contribute a campaign and send the funds from the campaign", async () => {
                  const _duration = 90
                  const _minAmount = ethers.utils.parseEther("200")
                  const _campaignURI = "test"

                  const _tierOne = ethers.utils.parseEther("2")
                  const _tierTwo = ethers.utils.parseEther("4")
                  const _tierThree = ethers.utils.parseEther("6")

                  const _tokenTiers = [_tierOne, _tierTwo, _tierThree]
                  let tx = await campaignManager.createNewCampaign(
                      _duration,
                      _minAmount,
                      _campaignURI,
                      _tokenTiers
                  )
                  const txReceipt = await tx.wait()

                  let campaignAddress
                  for (i = 0; i < txReceipt.events.length; i++) {
                      if (txReceipt.events[i].event == "NewCampaignCreated") {
                          campaignAddress = txReceipt.events[i].args.newCampaign
                      }
                  }
                  console.log(
                      `New Campaign was created with an adress ${campaignAddress} on ${network.name}`
                  )
                  const owner = accounts[0]

                  tx = await stableToken.mint(owner.address, ethers.utils.parseEther("400"))
                  await tx.wait()

                  const _approveAmount = ethers.utils.parseEther("400")
                  tx = await stableToken.approve(campaignManager.address, _approveAmount)
                  await tx.wait()

                  try {
                      console.log(
                          `Conribute to the campaign ${campaignAddress} with ${ethers.utils.formatEther(
                              _approveAmount
                          )} CRDAI`
                      )
                      await campaignManager.contributeCampaign(_approveAmount, campaignAddress)
                  } catch (e) {
                      console.log(e)
                  }
                  console.log("Waiting for the campaign to end... ")
                  await new Promise(async (resolve, reject) => {
                      campaignManager.once("CampaignFinished", async (campaign) => {
                          console.log("Campaign finished")

                          try {
                              const campaignContract = await ethers.getContractAt(
                                  "Campaign",
                                  campaignAddress
                              )

                              const _success = await campaignContract.getFundingStatus()

                              assert(_success)

                              if (_success) {
                                  console.log("The campaign was succesful funded!")
                                  const _supply = await campaignContract.getTotalSupply()
                                  console.log(
                                      `Transfer the funded ${ethers.utils.formatEther(
                                          _supply
                                      )} CRDAI to ${owner.address}`
                                  )

                                  const _balanceBeforeSending = await stableToken.balanceOf(
                                      owner.address
                                  )

                                  const _expectedBalance = _balanceBeforeSending.add(_supply)

                                  const tx = await campaignContract.transferStableTokens(
                                      owner.address,
                                      _supply
                                  )

                                  const txReceipt = await tx.wait(1)

                                  const _balanceAfterSending = await stableToken.balanceOf(
                                      owner.address
                                  )

                                  assert(_balanceAfterSending.eq(_expectedBalance))

                                  console.log(
                                      `Fundings Sent -> to: ${
                                          txReceipt.events[1].args.to
                                      } ; amount: ${ethers.utils.formatEther(
                                          txReceipt.events[1].args.amount
                                      )} CRDAI `
                                  )
                              }

                              resolve()
                          } catch (e) {
                              console.error(e)
                              reject(e)
                          }
                      })
                  })
              })

              it("#Scenario 2: The campaign is not completed as required and the contributors can get the funds back.", async () => {
                  const contributor = accounts.length == 2 ? accounts[1] : ""

                  if (accounts.length > 1) {
                      const balanceOfMatic = await ethers.provider.getBalance(contributor.address)

                      if (balanceOfMatic.gt(ethers.utils.parseEther("0.05"))) {
                          console.log("Ready for testing")

                          const _duration = 90
                          const _minAmount = ethers.utils.parseEther("200")
                          const _campaignURI = "test"

                          const _tierOne = ethers.utils.parseEther("2")
                          const _tierTwo = ethers.utils.parseEther("4")
                          const _tierThree = ethers.utils.parseEther("6")

                          const _tokenTiers = [_tierOne, _tierTwo, _tierThree]

                          let tx = await campaignManager.createNewCampaign(
                              _duration,
                              _minAmount,
                              _campaignURI,
                              _tokenTiers
                          )
                          const txReceipt = await tx.wait()

                          let campaignAddress
                          for (i = 0; i < txReceipt.events.length; i++) {
                              if (txReceipt.events[i].event == "NewCampaignCreated") {
                                  campaignAddress = txReceipt.events[i].args.newCampaign
                              }
                          }
                          console.log(
                              `New Campaign was created with an adress ${campaignAddress} on ${network.name}`
                          )

                          tx = await stableToken.mint(
                              contributor.address,
                              ethers.utils.parseEther("100")
                          )
                          await tx.wait()

                          const _approveAmount = ethers.utils.parseEther("100")
                          tx = await stableToken
                              .connect(contributor)
                              .approve(campaignManager.address, _approveAmount)
                          await tx.wait()

                          try {
                              console.log(
                                  `Conribute to the campaign ${campaignAddress} with ${ethers.utils.formatEther(
                                      _approveAmount
                                  )} CRDAI (Contributor: ${contributor.address})`
                              )
                              await campaignManager
                                  .connect(contributor)
                                  .contributeCampaign(_approveAmount, campaignAddress)
                          } catch (e) {
                              console.log(e)
                          }

                          console.log("Waiting for the campaign to end... ")
                          await new Promise(async (resolve, reject) => {
                              campaignManager.once("CampaignFinished", async (campaign) => {
                                  console.log("Campaign finished")
                                  try {
                                      const campaignContract = await ethers.getContractAt(
                                          "Campaign",
                                          campaignAddress
                                      )

                                      const _success = await campaignContract.getFundingStatus()

                                      if (!_success) {
                                          console.log("The campaign was not succesful funded!")
                                          const _supply = await campaignContract.getContributor(
                                              contributor.address
                                          )
                                          console.log(
                                              `${ethers.utils.formatEther(
                                                  _supply
                                              )} CRDAI tokens can be claimed by the contract ${campaignAddress}`
                                          )

                                          const _balanceBefore = await stableToken.balanceOf(
                                              contributor.address
                                          )
                                          const _expectedBalance = _balanceBefore.add(_supply)

                                          const tx = await campaignManager
                                              .connect(contributor)
                                              .claimTokensFromUnsuccessfulCampaigns([
                                                  campaignAddress,
                                              ])
                                          await tx.wait()

                                          const _balanceAfterSending = await stableToken.balanceOf(
                                              contributor.address
                                          )
                                          console.log(
                                              `New balance of the contributor ${ethers.utils.formatEther(
                                                  _balanceAfterSending
                                              )} CRDAI`
                                          )

                                          assert(_balanceAfterSending.eq(_expectedBalance))
                                      }

                                      resolve()
                                  } catch (e) {
                                      console.error(e)
                                      reject(e)
                                  }
                              })
                          })
                      }
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
