const { expect, assert } = require("chai")
const { ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Voting Unit Test", () => {
          async function deployVotingFixture() {
              const [owner, submitter, contributor, fundsReceiver] = await ethers.getSigners()

              const MockToken = await ethers.getContractFactory("MockToken")
              const mockToken = await MockToken.deploy("MockStable", "MUSD")

              const CoinRiseNFT = await ethers.getContractFactory("CoinRiseNFT")
              const coinRiseNft = await CoinRiseNFT.deploy()

              const Campaign = await ethers.getContractFactory("Campaign")
              const campaign = await Campaign.deploy()

              const CampaignFactory = await ethers.getContractFactory("CampaignFactory")
              const campaignFactory = await CampaignFactory.deploy(campaign.address)

              const CampaignManager = await ethers.getContractFactory("CampaignManager")
              const campaignManager = await CampaignManager.deploy(
                  campaignFactory.address,
                  mockToken.address,
                  coinRiseNft.address
              )

              const CoinRiseTokenPool = await ethers.getContractFactory("CoinRiseTokenPool")
              const coinRiseTokenPool = await CoinRiseTokenPool.deploy(
                  mockToken.address,
                  campaignManager.address
              )

              const Voting = await ethers.getContractFactory("Voting")
              const voting = await Voting.deploy(campaignManager.address)

              //Setups
              await campaignFactory.transferOwnership(campaignManager.address)
              await campaignManager.setVotingContractAddress(voting.address)
              await campaignManager.setTokenPoolAddress(coinRiseTokenPool.address)

              const _deadline = 30
              const _minAmount = ethers.utils.parseEther("1")
              const _campaignURI = "IPFS LINK"
              const _tokenTiers = [
                  ethers.utils.parseEther("0.1"),
                  ethers.utils.parseEther("0.2"),
                  ethers.utils.parseEther("0.3"),
              ]
              const _qorumpercentage = 4

              const tx = await campaignManager
                  .connect(submitter)
                  .createNewCampaignWithVoting(
                      _deadline,
                      _minAmount,
                      _campaignURI,
                      _tokenTiers,
                      _qorumpercentage
                  )

              const txReceipt = await tx.wait()
              let votingCampaign
              for (let index = 0; index < txReceipt.events.length; index++) {
                  if (txReceipt.events[index].event == "NewCampaignCreated") {
                      const _address = txReceipt.events[index].args.newCampaign

                      votingCampaign = await ethers.getContractAt("Campaign", _address)
                  }
              }

              return {
                  voting,
                  votingCampaign,
                  submitter,
                  fundsReceiver,
                  contributor,
                  campaignManager,
                  mockToken,
              }
          }

          describe("#requestForTokenTransfer", () => {
              it("successfully create a request for token transfer", async () => {
                  const {
                      voting,
                      votingCampaign,
                      campaignManager,
                      contributor,
                      fundsReceiver,
                      mockToken,
                      submitter,
                  } = await loadFixture(deployVotingFixture)

                  /**
                   * 1. Mint tokens and approve the manager
                   * 2. Contribute with the minimum amount
                   * 3. Waiting for finish the funding
                   * 4. Request the token transfer
                   */

                  const _minAmount = await votingCampaign.getMinAmount()

                  await mockToken.mint(contributor.address, _minAmount)
                  await mockToken.connect(contributor).approve(campaignManager.address, _minAmount)

                  await campaignManager
                      .connect(contributor)
                      .contributeCampaign(_minAmount, votingCampaign.address)

                  const _remainingTime = await votingCampaign.getRemainingFundingTime()
                  time.increase(_remainingTime)

                  const _checkUpkeep = await campaignManager.checkUpkeep("0x")

                  await campaignManager.performUpkeep(_checkUpkeep.performData)

                  //request as submitter for a token transfer

                  const _supply = await votingCampaign.getTotalSupply()

                  await votingCampaign
                      .connect(submitter)
                      .transferStableTokensWithRequest(fundsReceiver.address, _supply, 90, "xx")

                  const _campaignVotingInfo = await voting.getVotingInformation(
                      votingCampaign.address
                  )

                  assert(_campaignVotingInfo.lastRequestId.eq(ethers.constants.One))
              })

              it("failed when the amount of request is greater then the actual supply", async () => {
                  const {
                      voting,
                      votingCampaign,
                      submitter,
                      contributor,
                      mockToken,
                      campaignManager,
                      fundsReceiver,
                  } = await loadFixture(deployVotingFixture)

                  await finishCampaignSuccessfull(
                      votingCampaign,
                      mockToken,
                      contributor,
                      campaignManager
                  )

                  const _totalSupply = await votingCampaign.getTotalSupply()
                  const _amount = _totalSupply.mul(ethers.constants.Two)

                  //TODO: Write new test

                  await expect(
                      votingCampaign.transferStableTokensWithRequest(
                          fundsReceiver.address,
                          _amount,
                          30,
                          "xx"
                      )
                  ).to.be.reverted
                  //   await votingCampaign
                  //       .connect(submitter)
                  //       .transferStableTokensWithRequest(fundsReceiver.address, _amount, 30)
              })
          })

          describe("#voteOnRequest", () => {
              it("successfully vote as contributor on a request", async () => {
                  const {
                      voting,
                      votingCampaign,
                      campaignManager,
                      contributor,
                      fundsReceiver,
                      mockToken,
                      submitter,
                  } = await loadFixture(deployVotingFixture)

                  const _minAmount = await votingCampaign.getMinAmount()

                  await mockToken.mint(contributor.address, _minAmount)
                  await mockToken.connect(contributor).approve(campaignManager.address, _minAmount)

                  await campaignManager
                      .connect(contributor)
                      .contributeCampaign(_minAmount, votingCampaign.address)

                  const _remainingTime = await votingCampaign.getRemainingFundingTime()
                  time.increase(_remainingTime)

                  const _checkUpkeep = await campaignManager.checkUpkeep("0x")

                  await campaignManager.performUpkeep(_checkUpkeep.performData)

                  //request as submitter for a token transfer

                  const _supply = await votingCampaign.getTotalSupply()

                  await votingCampaign
                      .connect(submitter)
                      .transferStableTokensWithRequest(fundsReceiver.address, _supply, 90, "xx")

                  const _info = await voting.getVotingInformation(votingCampaign.address)

                  const _requestId = _info.lastRequestId

                  await votingCampaign.connect(contributor).voteOnTransferRequest(_requestId, true)

                  const _requestInfo = await voting.getRequestInformation(
                      votingCampaign.address,
                      _requestId
                  )

                  assert(_requestInfo.totalVotes.eq(ethers.constants.One))

                  assert(_requestInfo.yesVotes.eq(ethers.constants.One))

                  assert(_requestInfo.noVotes.eq(ethers.constants.Zero))
              })

              it("failed when a contributor trys to vote twice on the same request", async () => {
                  const {
                      voting,
                      votingCampaign,
                      campaignManager,
                      contributor,
                      fundsReceiver,
                      mockToken,
                      submitter,
                  } = await loadFixture(deployVotingFixture)

                  const _minAmount = await votingCampaign.getMinAmount()

                  await mockToken.mint(contributor.address, _minAmount)
                  await mockToken.connect(contributor).approve(campaignManager.address, _minAmount)

                  await campaignManager
                      .connect(contributor)
                      .contributeCampaign(_minAmount, votingCampaign.address)

                  const _remainingTime = await votingCampaign.getRemainingFundingTime()
                  time.increase(_remainingTime)

                  const _checkUpkeep = await campaignManager.checkUpkeep("0x")

                  await campaignManager.performUpkeep(_checkUpkeep.performData)

                  //request as submitter for a token transfer

                  const _supply = await votingCampaign.getTotalSupply()

                  await votingCampaign
                      .connect(submitter)
                      .transferStableTokensWithRequest(fundsReceiver.address, _supply, 90, "xx")

                  const _info = await voting.getVotingInformation(votingCampaign.address)

                  const _requestId = _info.lastRequestId

                  await votingCampaign.connect(contributor).voteOnTransferRequest(_requestId, true)

                  await expect(
                      votingCampaign.connect(contributor).voteOnTransferRequest(_requestId, true)
                  ).to.be.revertedWithCustomError(voting, "Voting__RequestNotVotable")
              })
          })
      })

async function finishCampaignSuccessfull(campaign, mockToken, contributor, campaignManager) {
    const _minAmount = await campaign.getMinAmount()

    await mockToken.mint(contributor.address, _minAmount)
    await mockToken.connect(contributor).approve(campaignManager.address, _minAmount)

    await campaignManager.connect(contributor).contributeCampaign(_minAmount, campaign.address)

    const _remainingTime = await campaign.getRemainingFundingTime()
    await time.increase(_remainingTime)

    const _data = await campaignManager.checkUpkeep("0x")
    await campaignManager.performUpkeep(_data.performData)
}
