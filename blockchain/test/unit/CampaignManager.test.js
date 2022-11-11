const { expect, assert } = require("chai")
const { ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("CampaignManager Unit Test", () => {
          async function deployCampaignManagerFixture() {
              const [owner, contributor, submitter, keeper, badActor, receiver] =
                  await ethers.getSigners()

              const Campaign = await ethers.getContractFactory("Campaign")
              const campaign = await Campaign.deploy()

              const CoinRiseNFT = await ethers.getContractFactory("CoinRiseNFT")
              const coinRiseNft = await CoinRiseNFT.deploy()

              const CampaignFactory = await ethers.getContractFactory("CampaignFactory")

              const campaignFactory = await CampaignFactory.deploy(campaign.address)

              const MockToken = await ethers.getContractFactory("MockToken")
              const mockToken = await MockToken.deploy("MockStable", "MUSD")

              const CampaignManager = await ethers.getContractFactory("CampaignManager")
              const campaignManager = await CampaignManager.deploy(
                  campaignFactory.address,
                  mockToken.address,
                  coinRiseNft.address
              )

              const Voting = await ethers.getContractFactory("Voting")
              const voting = await Voting.deploy(campaignManager.address)

              const CoinRiseTokenPool = await ethers.getContractFactory("CoinRiseTokenPool")
              const coinRiseTokenPool = await CoinRiseTokenPool.deploy(
                  mockToken.address,
                  campaignManager.address
              )

              await campaignManager.setTokenPoolAddress(coinRiseTokenPool.address)
              await campaignManager.setVotingContractAddress(voting.address)
              const fees = 100
              await campaignManager.setFees(fees)

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
                  fees,
                  coinRiseNft,
                  receiver,
                  voting,
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
                  const { coinRiseTokenPool, badActor, campaignFactory, mockToken, coinRiseNft } =
                      await loadFixture(deployCampaignManagerFixture)

                  const CampaignManager = await ethers.getContractFactory("CampaignManager")
                  const campaignManager = await CampaignManager.deploy(
                      campaignFactory.address,
                      mockToken.address,
                      coinRiseNft.address
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

                  await createNewCampaign(campaignManager, submitter)

                  const _campaignAddress = await campaignFactory.getLastDeployedCampaign()

                  const _tokenAmount = ethers.utils.parseEther("10")

                  await mockToken
                      .connect(contributor)
                      .approve(campaignManager.address, _tokenAmount)

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
                  await createNewCampaign(campaignManager, submitter)

                  const _tokenAmount = ethers.utils.parseEther("10")
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

                  await createNewCampaign(campaignManager, submitter)

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

                  await createNewCampaign(campaignManager, submitter)

                  const _campaignAddress = await campaignFactory.getLastDeployedCampaign()

                  const _tokenAmount = ethers.utils.parseEther("10")

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

                  await createNewCampaign(campaignManager, submitter)

                  const _campaignAddress = await campaignFactory.getLastDeployedCampaign()

                  const campaign = await ethers.getContractAt("Campaign", _campaignAddress)

                  const endDate = await campaign.getEndDate()

                  //set the time to the endDate of the contract
                  const _newTime = parseInt(endDate.toString()) + 1
                  time.increaseTo(_newTime)

                  await createNewCampaign(campaignManager, submitter)

                  const answer = await campaignManager.connect(keeper).checkUpkeep("0x")

                  assert.equal(answer.upkeepNeeded, true)
              })

              it("successfully returns a false upkeepNeeded if all campaigns are ongoing", async () => {
                  const { campaignManager, submitter } = await loadFixture(
                      deployCampaignManagerFixture
                  )

                  await createNewCampaign(campaignManager, submitter)

                  const answer = await campaignManager.checkUpkeep("0x")

                  const _upkeepNeeded = answer.upkeepNeeded

                  assert.equal(_upkeepNeeded, false)
              })

              it("sucessfully return true if requests are finished", async () => {
                  const {
                      campaignManager,
                      submitter,
                      contributor,
                      mockToken,
                      campaignFactory,
                      receiver,
                      voting,
                  } = await loadFixture(deployCampaignManagerFixture)

                  await createNewCampaignWithVotes(campaignManager, submitter)

                  const _campaignAddress = await campaignFactory.getLastDeployedCampaign()
                  const campaign = await ethers.getContractAt("Campaign", _campaignAddress)

                  const _amount = ethers.utils.parseEther("2.5")
                  await contributeCampaign(
                      campaignManager,
                      mockToken,
                      _amount,
                      contributor,
                      campaign
                  )

                  const _remainingTime = await campaign.getRemainingFundingTime()

                  await time.increase(_remainingTime)

                  await mockKeeperFunctions(campaignManager)

                  // request a transaction to the receiver
                  const _sendingAmount = ethers.utils.parseEther("2")
                  const _duration = 30
                  await campaign
                      .connect(submitter)
                      .transferStableTokensWithRequest(
                          receiver.address,
                          _sendingAmount,
                          _duration,
                          "xx"
                      )

                  //   const _requests = await campaign.getAllRequests()

                  await campaign.connect(contributor).voteOnTransferRequest(1, true)

                  const _balanceBefore = await mockToken.balanceOf(receiver.address)

                  await time.increase(_duration + 1)

                  await mockKeeperFunctions(campaignManager)

                  const _balanceAfter = await mockToken.balanceOf(receiver.address)

                  assert(_balanceAfter.gt(_balanceBefore))
              })
          })

          describe("#performUpkeep", () => {
              it("successfully emit an event after call performUpkeep ", async () => {
                  const { campaignManager, submitter, campaignFactory, keeper } = await loadFixture(
                      deployCampaignManagerFixture
                  )

                  await createNewCampaign(campaignManager, submitter)

                  const _campaignAddress = await campaignFactory.getLastDeployedCampaign()

                  const campaign = await ethers.getContractAt("Campaign", _campaignAddress)

                  const endDate = await campaign.getEndDate()

                  //set the time to the endDate of the contract
                  const _newTime = parseInt(endDate.toString()) + 1
                  time.increaseTo(_newTime)

                  await createNewCampaign(campaignManager, submitter)

                  const answer = await campaignManager.checkUpkeep("0x")
                  await expect(
                      campaignManager.connect(keeper).performUpkeep(answer.performData)
                  ).to.emit(campaignManager, "CampaignFinished")
              })

              it("successfully set the right status of the campaign", async () => {
                  const { campaignManager, submitter, campaignFactory } = await loadFixture(
                      deployCampaignManagerFixture
                  )

                  await createNewCampaign(campaignManager, submitter)

                  const _campaignAddress = await campaignFactory.getLastDeployedCampaign()

                  const campaign = await ethers.getContractAt("Campaign", _campaignAddress)

                  const endDate = await campaign.getEndDate()

                  //set the time to the endDate of the contract
                  const _newTime = parseInt(endDate.toString()) + 1
                  time.increaseTo(_newTime)

                  await createNewCampaign(campaignManager, submitter)

                  const answer = await campaignManager.checkUpkeep("0x")

                  await campaignManager.performUpkeep(answer.performData)

                  const _fundingActive = await campaign.isFundingActive()

                  assert.equal(_fundingActive, false)
              })

              it("succesfully transfer the funds from the pool to the submitter with non voting campaign", async () => {
                  const {
                      campaignManager,
                      contributor,
                      mockToken,
                      submitter,
                      keeper,
                      campaignFactory,
                  } = await loadFixture(deployCampaignManagerFixture)
                  const _tokenAmount = ethers.utils.parseEther("10")
                  await mockToken.mint(contributor.address, ethers.utils.parseEther("1000"))

                  await mockToken
                      .connect(contributor)
                      .approve(campaignManager.address, _tokenAmount)

                  await createNewCampaign(campaignManager, submitter)

                  const _campaignAddress = await campaignFactory.getLastDeployedCampaign()

                  await campaignManager
                      .connect(contributor)
                      .contributeCampaign(_tokenAmount, _campaignAddress)

                  const campaign = await ethers.getContractAt("Campaign", _campaignAddress)

                  const endDate = await campaign.getEndDate()

                  //set the time to the endDate of the contract
                  const _newTime = parseInt(endDate.toString()) + 1
                  time.increaseTo(_newTime)

                  const answer = await campaignManager.connect(keeper).checkUpkeep("0x")

                  await campaignManager.connect(keeper).performUpkeep(answer.performData)

                  const _submitterBalance = await mockToken.balanceOf(submitter.address)
                  const _expectedBalance = ethers.utils.parseEther("9.9")

                  assert(_submitterBalance.eq(_expectedBalance))
              })
          })

          describe("#claimTokensFromUnsuccessfulCampaigns", () => {
              it("successfully send back the tokens to the contributor after failing campaign", async () => {
                  const { campaignManager, submitter, contributor, mockToken, campaignFactory } =
                      await loadFixture(deployCampaignManagerFixture)

                  await createNewCampaign(campaignManager, submitter)

                  const _campaignAddress = await campaignFactory.getLastDeployedCampaign()

                  const _newCampaign = await ethers.getContractAt("Campaign", _campaignAddress)

                  const _minAmount = await _newCampaign.getMinAmount()

                  const _tokenAmount = _minAmount.div(ethers.constants.Two)

                  await contributeCampaign(
                      campaignManager,
                      mockToken,
                      _tokenAmount,
                      contributor,
                      _newCampaign
                  )

                  const _remainingTime = await _newCampaign.getRemainingFundingTime()

                  time.increase(_remainingTime)

                  const _checkUpkeepNeeded = await campaignManager.checkUpkeep("0x")

                  await campaignManager.performUpkeep(_checkUpkeepNeeded.performData)

                  const _active = await _newCampaign.isFundingActive()
                  assert(!_active)
                  if (!_active) {
                      const _amountBefore = await mockToken.balanceOf(contributor.address)

                      await campaignManager
                          .connect(contributor)
                          .claimTokensFromUnsuccessfulCampaigns([_newCampaign.address])

                      const _amountAfter = await mockToken.balanceOf(contributor.address)

                      assert(_amountAfter.gt(_amountBefore))
                  }
              })
          })
      })

async function createNewCampaign(managerContract, functionCaller) {
    const _interval = 30
    const _minAmount = ethers.utils.parseEther("2")
    const _campaignURI = "test"

    const _tierOne = ethers.utils.parseEther("2")
    const _tierTwo = ethers.utils.parseEther("4")
    const _tierThree = ethers.utils.parseEther("6")

    const _tokenTiers = [_tierOne, _tierTwo, _tierThree]

    await managerContract
        .connect(functionCaller)
        .createNewCampaign(_interval, _minAmount, _campaignURI, _tokenTiers)
}

async function contributeCampaign(campaignManager, mockToken, _amount, contributor, campaign) {
    await mockToken.mint(contributor.address, _amount)

    await mockToken.connect(contributor).approve(campaignManager.address, _amount)

    await campaignManager.connect(contributor).contributeCampaign(_amount, campaign.address)
}

async function createNewCampaignWithVotes(campaignManager, caller) {
    const _interval = 30
    const _minAmount = ethers.utils.parseEther("2")
    const _campaignURI = "test"

    const _tierOne = ethers.utils.parseEther("2")
    const _tierTwo = ethers.utils.parseEther("4")
    const _tierThree = ethers.utils.parseEther("6")

    const _tokenTiers = [_tierOne, _tierTwo, _tierThree]

    const _quorumPercentage = 10

    await campaignManager
        .connect(caller)
        .createNewCampaignWithVoting(
            _interval,
            _minAmount,
            _campaignURI,
            _tokenTiers,
            _quorumPercentage
        )
}

async function mockKeeperFunctions(campaignManager) {
    const _answer = await campaignManager.checkUpkeep("0x")

    // const data = ethers.utils.defaultAbiCoder.decode(["uint256", "address[]"], _answer.performData)

    await campaignManager.performUpkeep(_answer.performData)
}
