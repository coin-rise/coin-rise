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
              tokenTiers,
              decimals
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
                  decimals = await stableToken.decimals()
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
                  const _powDecimals = ethers.BigNumber.from("10").pow(decimals)

                  const _duration = 90
                  const _minAmount = ethers.BigNumber.from("20").mul(_powDecimals)
                  const _campaignURI = "test"

                  const _tierOne = ethers.BigNumber.from("5").mul(_powDecimals)
                  const _tierTwo = ethers.BigNumber.from("10").mul(_powDecimals)
                  const _tierThree = ethers.BigNumber.from("15").mul(_powDecimals)

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

                  const _approveAmount = ethers.BigNumber.from("25").mul(_powDecimals)

                  tx = await stableToken.approve(campaignManager.address, _approveAmount)
                  await tx.wait()

                  try {
                      console.log(
                          `Conribute to the campaign ${campaignAddress} with ${ethers.utils.formatUnits(
                              _approveAmount,
                              decimals
                          )} USDC`
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
                                      `Transfer the funded ${ethers.utils.formatUnits(
                                          _supply,
                                          decimals
                                      )} USDC to ${owner.address}`
                                  )

                                  const _balanceAfterSending = await stableToken.balanceOf(
                                      owner.address
                                  )

                                  assert(_balanceAfterSending.eq(_supply))
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

                          const _powDecimals = ethers.BigNumber.from("10").pow(decimals)

                          const _duration = 90
                          const _minAmount = ethers.BigNumber.from("20").mul(_powDecimals)
                          const _campaignURI = "test"

                          const _tierOne = ethers.BigNumber.from("5").mul(_powDecimals)
                          const _tierTwo = ethers.BigNumber.from("10").mul(_powDecimals)
                          const _tierThree = ethers.BigNumber.from("15").mul(_powDecimals)

                          const _tokenTiers = [_tierOne, _tierTwo, _tierThree]

                          let tx = await campaignManager.createNewCampaign(
                              _duration,
                              _minAmount,
                              _campaignURI,
                              _tokenTiers
                          )
                          await tx.wait()

                          const campaignAddress = await campaignFactory.getLastDeployedCampaign()
                          console.log(
                              `New Campaign was created with an adress ${campaignAddress} on ${network.name}`
                          )

                          const _approveAmount = ethers.BigNumber.from("15").mul(_powDecimals)
                          tx = await stableToken
                              .connect(contributor)
                              .approve(campaignManager.address, _approveAmount)
                          await tx.wait()

                          try {
                              console.log(
                                  `Conribute to the campaign ${campaignAddress} with ${ethers.utils.formatUnits(
                                      _approveAmount,
                                      6
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
                                              `${ethers.utils.formatUnits(
                                                  _supply,
                                                  decimals
                                              )} USDC tokens can be claimed by the contract ${campaignAddress}`
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
                                              `New balance of the contributor ${ethers.utils.formatUnits(
                                                  _balanceAfterSending,
                                                  decimals
                                              )} USDC`
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
