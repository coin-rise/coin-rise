const { expect, assert } = require("chai")
const { ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("CampaignManager Unit Test", () => {
          async function deployCampaignManagerFixture() {
              const [owner, contributor, submitter, keeper, badActor] = await ethers.getSigners()

              const Campaign = await ethers.getContractFactory("Campaign")
              const campaign = await Campaign.deploy()

              const CampaignFactory = await ethers.getContractFactory("CampaignFactory")

              const campaignFactory = await CampaignFactory.deploy(campaign.address)

              const MockToken = await ethers.getContractFactory("MockToken")
              const mockToken = await MockToken.deploy("MockStable", "MUSD")

              const CampaignManager = await ethers.getContractFactory("CampaignManager")
              const campaignManager = await CampaignManager.deploy(
                  campaignFactory.address,
                  mockToken.address
              )

              const CoinRiseTokenPool = await ethers.getContractFactory("CoinRiseTokenPool")
              const coinRiseTokenPool = await CoinRiseTokenPool.deploy(
                  mockToken.address,
                  campaignManager.address
              )

              await campaignManager.setTokenPoolAddress(coinRiseTokenPool.address)

              await campaignManager.setFees(100)

              await campaignFactory.transferOwnership(campaignManager.address)

              return {
                  campaignManager,
                  owner,
                  contributor,
                  mockToken,
                  submitter,
                  campaignFactory,
                  keeper,
                  coinRiseTokenPool,
                  badActor,
              }
          }

          describe("#setTokenPoolAddress", () => {
              it("failed to set the token pool address twice", async () => {
                  const { campaignManager, coinRiseTokenPool } = await loadFixture(
                      deployCampaignManagerFixture
                  )

                  await expect(
                      campaignManager.setTokenPoolAddress(coinRiseTokenPool.address)
                  ).to.be.revertedWithCustomError(
                      campaignManager,
                      "CampaignManager__TokenPoolAlreadyDefined"
                  )
              })

              it("failed if not the owner set a token pool address", async () => {
                  const { coinRiseTokenPool, badActor, campaignFactory, mockToken, owner } =
                      await loadFixture(deployCampaignManagerFixture)

                  const CampaignManager = await ethers.getContractFactory("CampaignManager")
                  const campaignManager = await CampaignManager.deploy(
                      campaignFactory.address,
                      mockToken.address
                  )

                  await expect(
                      campaignManager
                          .connect(badActor)
                          .setTokenPoolAddress(coinRiseTokenPool.address)
                  ).to.be.revertedWith("Ownable: caller is not the owner")
              })
          })

          describe("#setFees", () => {
              it("successfully set new Fees", async () => {
                  const { campaignManager } = await loadFixture(deployCampaignManagerFixture)

                  await campaignManager.setFees(20)

                  const _newFees = await campaignManager.getFees()

                  assert.equal(_newFees.toNumber(), 20)
              })

              it("can only the owner set new Fees", async () => {
                  const { campaignManager, badActor } = await loadFixture(
                      deployCampaignManagerFixture
                  )

                  await expect(campaignManager.connect(badActor).setFees(29)).to.be.revertedWith(
                      "Ownable: caller is not the owner"
                  )
              })
          })

          describe("#contributeCampaign", () => {
              it("successfully transfer the tokens to the campaign", async () => {
                  const {
                      campaignManager,
                      mockToken,
                      submitter,
                      contributor,
                      campaignFactory,
                      coinRiseTokenPool,
                  } = await loadFixture(deployCampaignManagerFixture)

                  //mint some tokens for the contributor
                  await mockToken.mint(contributor.address, ethers.utils.parseEther("1000"))

                  const _interval = 30
                  await campaignManager.connect(submitter).createNewCampaign(_interval)

                  const _campaignAddress = await campaignFactory.getLastDeployedCampaign()

                  const _tokenAmount = ethers.utils.parseEther("10")

                  await mockToken
                      .connect(contributor)
                      .approve(coinRiseTokenPool.address, _tokenAmount)

                  await campaignManager
                      .connect(contributor)
                      .contributeCampaign(_tokenAmount, _campaignAddress)

                  const _balanceCampaign = await mockToken.balanceOf(coinRiseTokenPool.address)

                  assert(_balanceCampaign.eq(_tokenAmount))
              })

              it("failed to contribute to a wrong campaign address", async () => {
                  const { campaignManager, contributor, submitter } = await loadFixture(
                      deployCampaignManagerFixture
                  )
                  const _tokenAmount = ethers.utils.parseEther("10")

                  const _interval = 30

                  await campaignManager.connect(submitter).createNewCampaign(_interval)

                  await expect(
                      campaignManager
                          .connect(contributor)
                          .contributeCampaign(
                              _tokenAmount,
                              "0x4803a2dEe73ad5657380A964e83c92a4323C1C70"
                          )
                  ).to.revertedWithCustomError(
                      campaignManager,
                      "CampaignManager__CampaignDoesNotExist"
                  )
              })

              it("failed to contribute with a zero token amount funding", async () => {
                  const { campaignManager, contributor, campaignFactory, submitter } =
                      await loadFixture(deployCampaignManagerFixture)
                  const _interval = 30

                  await campaignManager.connect(submitter).createNewCampaign(_interval)

                  const _campaignAddress = await campaignFactory.getLastDeployedCampaign()
                  const _tokenAmount = ethers.utils.parseEther("0")

                  await expect(
                      campaignManager
                          .connect(contributor)
                          .contributeCampaign(_tokenAmount, _campaignAddress)
                  ).to.revertedWithCustomError(campaignManager, "CampaignManager__AmountIsZero")
              })

              it("failed to contribute if no tokens are approved", async () => {
                  const { campaignManager, submitter, contributor, mockToken, campaignFactory } =
                      await loadFixture(deployCampaignManagerFixture)

                  await mockToken.mint(contributor.address, ethers.utils.parseEther("1000"))
                  const _interval = 30

                  await campaignManager.connect(submitter).createNewCampaign(_interval)

                  const _campaignAddress = await campaignFactory.getLastDeployedCampaign()

                  const _tokenAmount = ethers.utils.parseEther("10")

                  //   await mockToken
                  //       .connect(contributor)
                  //       .approve(campaignManager.address, _tokenAmount)

                  await expect(
                      campaignManager
                          .connect(contributor)
                          .contributeCampaign(_tokenAmount, _campaignAddress)
                  ).to.be.revertedWith("ERC20: insufficient allowance")
              })
          })

          describe("#checkUpkeep", () => {
              it("successfully returns true if some campaigns are finished ", async () => {
                  const { campaignManager, submitter, campaignFactory, keeper } = await loadFixture(
                      deployCampaignManagerFixture
                  )

                  const _interval = 30

                  await campaignManager.connect(submitter).createNewCampaign(_interval)

                  const _campaignAddress = await campaignFactory.getLastDeployedCampaign()

                  const campaign = await ethers.getContractAt("Campaign", _campaignAddress)

                  const endDate = await campaign.getEndDate()

                  //set the time to the endDate of the contract
                  const _newTime = parseInt(endDate.toString()) + 1
                  time.increaseTo(_newTime)

                  await campaignManager.connect(submitter).createNewCampaign(_interval)

                  const answer = await campaignManager.connect(keeper).checkUpkeep("0x")

                  assert.equal(answer.upkeepNeeded, true)
              })

              it("successfully returns a false upkeepNeeded if all campaigns are ongoing", async () => {
                  const { campaignManager, submitter } = await loadFixture(
                      deployCampaignManagerFixture
                  )

                  const _interval = 30

                  await campaignManager.connect(submitter).createNewCampaign(_interval)

                  const answer = await campaignManager.checkUpkeep("0x")

                  const _upkeepNeeded = answer.upkeepNeeded

                  assert.equal(_upkeepNeeded, false)
              })
          })

          describe("#performUpkeep", () => {
              it("successfully emit an event after call performUpkeep ", async () => {
                  const { campaignManager, submitter, campaignFactory, keeper } = await loadFixture(
                      deployCampaignManagerFixture
                  )

                  const _interval = 30

                  await campaignManager.connect(submitter).createNewCampaign(_interval)

                  const _campaignAddress = await campaignFactory.getLastDeployedCampaign()

                  const campaign = await ethers.getContractAt("Campaign", _campaignAddress)

                  const endDate = await campaign.getEndDate()

                  //set the time to the endDate of the contract
                  const _newTime = parseInt(endDate.toString()) + 1
                  time.increaseTo(_newTime)

                  await campaignManager.connect(submitter).createNewCampaign(_interval)

                  await expect(campaignManager.connect(keeper).performUpkeep("0x")).to.emit(
                      campaignManager,
                      "CampaignFinished"
                  )
              })

              it("successfully set the right status of the campaign", async () => {
                  const { campaignManager, submitter, campaignFactory } = await loadFixture(
                      deployCampaignManagerFixture
                  )

                  const _interval = 30

                  await campaignManager.connect(submitter).createNewCampaign(_interval)

                  const _campaignAddress = await campaignFactory.getLastDeployedCampaign()

                  const campaign = await ethers.getContractAt("Campaign", _campaignAddress)

                  const endDate = await campaign.getEndDate()

                  //set the time to the endDate of the contract
                  const _newTime = parseInt(endDate.toString()) + 1
                  time.increaseTo(_newTime)

                  await campaignManager.connect(submitter).createNewCampaign(_interval)

                  const answer = await campaignManager.checkUpkeep("0x")

                  await campaignManager.performUpkeep("0x")

                  const _fundingActive = await campaign.isFundingActive()

                  assert.equal(_fundingActive, false)
              })

              it("succesfully transfer the funds from the pool to the campaign contract", async () => {
                  const { campaignManager, contributor } = await loadFixture(
                      deployCampaignManagerFixture
                  )

                  //TODO: Writing the test!!!
              })
          })
      })
