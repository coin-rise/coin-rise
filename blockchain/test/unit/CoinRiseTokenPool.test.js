const { expect, assert } = require("chai")
const { ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("CoinRiseTokenPool unit test", () => {
          async function deployCoinRiseTokenPoolFixture() {
              const [deployer, managerContract, badActor, withdrawer, submitter, contributor] =
                  await ethers.getSigners()

              const MockToken = await ethers.getContractFactory("MockToken")
              const mockToken = await MockToken.deploy("DAI", "DAI")

              const CoinRiseTokenPool = await ethers.getContractFactory("CoinRiseTokenPool")
              const coinRiseTokenPool = await CoinRiseTokenPool.deploy(
                  mockToken.address,
                  managerContract.address
              )

              const Campaign = await ethers.getContractFactory("Campaign")

              const implementCampaign = await Campaign.deploy()

              const CampaignFactory = await ethers.getContractFactory(
                  "CampaignFactory",
                  managerContract
              )
              const campaignFactory = await CampaignFactory.deploy(implementCampaign.address)

              await campaignFactory.deployNewContract(
                  100,
                  submitter.address,
                  mockToken.address,
                  ethers.constants.AddressZero,
                  ethers.constants.One,
                  "test",
                  [0, 0, 0],
                  false
              )

              const _newCampaignAddress = await campaignFactory.getLastDeployedCampaign()
              const campaign = await ethers.getContractAt("Campaign", _newCampaignAddress)

              return {
                  deployer,
                  managerContract,
                  campaign,
                  coinRiseTokenPool,
                  mockToken,
                  badActor,
                  withdrawer,
                  contributor,
                  submitter,
              }
          }

          let totalAmount, fees
          beforeEach(async () => {
              totalAmount = ethers.utils.parseEther("10")
              fees = ethers.utils.parseEther("0.1")
          })

          describe("#contructor", () => {
              it("successfully deploy the contract and initialize the contract correct", async () => {
                  const { managerContract, coinRiseTokenPool, mockToken } = await loadFixture(
                      deployCoinRiseTokenPoolFixture
                  )

                  const _managerAddress = await coinRiseTokenPool.getCampaignManagerAddress()
                  const _stableTokenAddress = await coinRiseTokenPool.getStableTokenAddress()

                  assert.equal(_managerAddress, managerContract.address)
                  assert.equal(_stableTokenAddress, mockToken.address)

                  // check the roles
                  const _managerRole = await coinRiseTokenPool.MANAGER_ROLE()

                  const _hasManagerRole = await coinRiseTokenPool.hasRole(
                      _managerRole,
                      managerContract.address
                  )

                  assert(_hasManagerRole)
              })
          })

          describe("setNewTotalSupplies", () => {
              it("successfully set the correct total supplies", async () => {
                  const { managerContract, coinRiseTokenPool, mockToken } = await loadFixture(
                      deployCoinRiseTokenPoolFixture
                  )

                  // mint tokens to pool
                  await mockToken.mint(coinRiseTokenPool.address, totalAmount)

                  await coinRiseTokenPool
                      .connect(managerContract)
                      .setNewTotalSupplies(totalAmount, fees)

                  const _freeSupply = await coinRiseTokenPool.getFreeTotalStableTokenSupply()
                  const _lockedSupply = await coinRiseTokenPool.getLockedTotalStableTokenSupply()

                  const _expectedLockedSupply = totalAmount.sub(fees)

                  assert(_expectedLockedSupply.eq(_lockedSupply))

                  assert(_freeSupply.eq(fees))
              })

              it("successfully emit an event after updating the supply", async () => {
                  const { coinRiseTokenPool, managerContract, mockToken } = await loadFixture(
                      deployCoinRiseTokenPoolFixture
                  )

                  // mint tokens to pool
                  await mockToken.mint(coinRiseTokenPool.address, totalAmount)

                  const _lockedSupply = totalAmount.sub(fees)

                  await expect(
                      coinRiseTokenPool
                          .connect(managerContract)
                          .setNewTotalSupplies(totalAmount, fees)
                  )
                      .to.emit(coinRiseTokenPool, "StableTokensUpdated")
                      .withArgs(_lockedSupply, fees, ethers.constants.Zero)
              })

              it("fails if the sender does not have the manager role", async () => {
                  const { badActor, coinRiseTokenPool } = await loadFixture(
                      deployCoinRiseTokenPoolFixture
                  )

                  const _managerRole = await coinRiseTokenPool.MANAGER_ROLE()

                  const _expectedRevertMsg = `AccessControl: account ${badActor.address.toLowerCase()} is missing role ${_managerRole}`
                  await expect(
                      coinRiseTokenPool.connect(badActor).setNewTotalSupplies(totalAmount, fees)
                  ).to.be.revertedWith(_expectedRevertMsg)
              })

              it("fails if not the right amount of tokens were sent to the pool", async () => {
                  const { coinRiseTokenPool, managerContract } = await loadFixture(
                      deployCoinRiseTokenPoolFixture
                  )

                  await expect(
                      coinRiseTokenPool
                          .connect(managerContract)
                          .setNewTotalSupplies(totalAmount, fees)
                  ).to.be.revertedWithCustomError(
                      coinRiseTokenPool,
                      "CoinRiseTokenPool__NoTokensSent"
                  )
              })
          })

          describe("#sendFundsToCampaignContract", () => {
              it("successfully send the fund to the campaign contract", async () => {
                  const { managerContract, mockToken, coinRiseTokenPool, campaign, contributor } =
                      await loadFixture(deployCoinRiseTokenPoolFixture)

                  await mockToken.mint(coinRiseTokenPool.address, totalAmount)
                  await campaign
                      .connect(managerContract)
                      .addContributor(contributor.address, totalAmount.sub(fees))

                  await coinRiseTokenPool
                      .connect(managerContract)
                      .setNewTotalSupplies(totalAmount, fees)

                  const _lockedSupply = await coinRiseTokenPool.getLockedTotalStableTokenSupply()

                  await coinRiseTokenPool
                      .connect(managerContract)
                      .sendFundsToCampaignContract(campaign.address)

                  const _balanceCampaign = await mockToken.balanceOf(campaign.address)

                  assert(_balanceCampaign.eq(_lockedSupply))
              })

              it("successfully emit an event after sending the funds to the campaign", async () => {
                  const { managerContract, mockToken, coinRiseTokenPool, campaign, contributor } =
                      await loadFixture(deployCoinRiseTokenPoolFixture)

                  await mockToken.mint(coinRiseTokenPool.address, totalAmount)
                  await campaign
                      .connect(managerContract)
                      .addContributor(contributor.address, totalAmount.sub(fees))

                  await coinRiseTokenPool
                      .connect(managerContract)
                      .setNewTotalSupplies(totalAmount, fees)

                  const _lockedSupply = await coinRiseTokenPool.getLockedTotalStableTokenSupply()

                  await expect(
                      coinRiseTokenPool
                          .connect(managerContract)
                          .sendFundsToCampaignContract(campaign.address)
                  )
                      .to.emit(coinRiseTokenPool, "FundingsSentToCampaign")
                      .withArgs(campaign.address, _lockedSupply)
              })

              it("fails if the sender does not have the manager role", async () => {
                  const { managerContract, mockToken, coinRiseTokenPool, campaign, badActor } =
                      await loadFixture(deployCoinRiseTokenPoolFixture)

                  await mockToken.mint(coinRiseTokenPool.address, totalAmount)

                  await coinRiseTokenPool
                      .connect(managerContract)
                      .setNewTotalSupplies(totalAmount, fees)

                  const _lockedSupply = await coinRiseTokenPool.getLockedTotalStableTokenSupply()

                  const _managerRole = await coinRiseTokenPool.MANAGER_ROLE()

                  const _expectedRevertMsg = `AccessControl: account ${badActor.address.toLowerCase()} is missing role ${_managerRole}`

                  await expect(
                      coinRiseTokenPool
                          .connect(badActor)
                          .sendFundsToCampaignContract(campaign.address)
                  ).to.be.revertedWith(_expectedRevertMsg)
              })
          })

          describe("#sendFundsToSubmitter", () => {
              it("successfully send the funds to the submitter", async () => {
                  const {
                      campaign,
                      submitter,
                      coinRiseTokenPool,
                      managerContract,
                      mockToken,
                      contributor,
                  } = await loadFixture(deployCoinRiseTokenPoolFixture)

                  await mockToken.mint(coinRiseTokenPool.address, totalAmount)

                  await coinRiseTokenPool
                      .connect(managerContract)
                      .setNewTotalSupplies(totalAmount, fees)

                  await campaign
                      .connect(managerContract)
                      .addContributor(contributor.address, totalAmount.sub(fees))

                  const _balanceBefore = await mockToken.balanceOf(submitter.address)

                  await coinRiseTokenPool
                      .connect(managerContract)
                      .sendFundsToSubmitter(campaign.address)

                  const _balanceAfter = await mockToken.balanceOf(submitter.address)

                  assert(_balanceAfter.gt(_balanceBefore))
              })

              it("successfully emit an event after send the funds to the submitter", async () => {
                  const {
                      campaign,
                      submitter,
                      coinRiseTokenPool,
                      managerContract,
                      mockToken,
                      contributor,
                  } = await loadFixture(deployCoinRiseTokenPoolFixture)

                  await mockToken.mint(coinRiseTokenPool.address, totalAmount)

                  await coinRiseTokenPool
                      .connect(managerContract)
                      .setNewTotalSupplies(totalAmount, fees)

                  await campaign
                      .connect(managerContract)
                      .addContributor(contributor.address, totalAmount.sub(fees))

                  const _submitter = await campaign.getSubmitter()
                  const _amount = totalAmount.sub(fees)

                  await expect(
                      coinRiseTokenPool
                          .connect(managerContract)
                          .sendFundsToSubmitter(campaign.address)
                  )
                      .to.emit(coinRiseTokenPool, "FundingsSentToSubmitter")
                      .withArgs(_submitter, campaign.address, _amount)
              })

              it("successfully update the token supplies after sending funds to submitter", async () => {
                  const { campaign, coinRiseTokenPool, managerContract, mockToken, contributor } =
                      await loadFixture(deployCoinRiseTokenPoolFixture)

                  await mockToken.mint(coinRiseTokenPool.address, totalAmount)

                  await coinRiseTokenPool
                      .connect(managerContract)
                      .setNewTotalSupplies(totalAmount, fees)

                  await campaign
                      .connect(managerContract)
                      .addContributor(contributor.address, totalAmount.sub(fees))

                  await coinRiseTokenPool
                      .connect(managerContract)
                      .sendFundsToSubmitter(campaign.address)

                  const _lockedSupply = await coinRiseTokenPool.getLockedTotalStableTokenSupply()
                  const _freeSupply = await coinRiseTokenPool.getFreeTotalStableTokenSupply()

                  assert(_lockedSupply.eq(ethers.constants.Zero))
                  assert(_freeSupply.eq(fees))
              })

              it("fails if the sender does not have the manager role", async () => {
                  const { coinRiseTokenPool, managerContract, mockToken, badActor, campaign } =
                      await loadFixture(deployCoinRiseTokenPoolFixture)

                  await mockToken.mint(coinRiseTokenPool.address, totalAmount)
                  await coinRiseTokenPool
                      .connect(managerContract)
                      .setNewTotalSupplies(totalAmount, fees)

                  const _managerRole = await coinRiseTokenPool.MANAGER_ROLE()

                  const _expectedRevertMsg = `AccessControl: account ${badActor.address.toLowerCase()} is missing role ${_managerRole}`

                  await expect(
                      coinRiseTokenPool.connect(badActor).sendFundsToSubmitter(campaign.address)
                  ).to.be.revertedWith(_expectedRevertMsg)
              })
          })

          describe("#transferStableTokensToContributorPool", () => {})
      })
