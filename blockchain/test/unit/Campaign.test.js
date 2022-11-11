const { expect, assert } = require("chai")
const { ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers")
const { duration } = require("@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Campaign Unit Test", () => {
          async function deployCampaignFixture() {
              const [
                  deployer,
                  submitter,
                  contributor1,
                  contributor2,
                  badActor,
                  managerContract,
                  receiver,
                  mockVoting,
              ] = await ethers.getSigners()

              const Campaign = await ethers.getContractFactory("Campaign")
              const implementedCampaign = await Campaign.deploy()

              const CampaignFactory = await ethers.getContractFactory("CampaignFactory", deployer)
              const campaignFactory = await CampaignFactory.deploy(implementedCampaign.address)

              const MockToken = await ethers.getContractFactory("MockToken")
              const mockToken = await MockToken.deploy("DAI", "DAI")

              const CoinRiseNFT = await ethers.getContractFactory("CoinRiseNFT")
              const coinRiseNft = await CoinRiseNFT.deploy()

              const CampaignManager = await ethers.getContractFactory("CampaignManager")
              const campaignManager = await CampaignManager.deploy(
                  campaignFactory.address,
                  mockToken.address,
                  coinRiseNft.address
              )

              await coinRiseNft.setRoles(campaignManager.address)

              await coinRiseNft.setNewTokenURIs(["1", "2", "3"])

              const CoinRiseTokenPool = await ethers.getContractFactory("CoinRiseTokenPool")
              const coinRiseTokenPool = await CoinRiseTokenPool.deploy(
                  mockToken.address,
                  campaignManager.address
              )

              const Voting = await ethers.getContractFactory("Voting")
              const voting = await Voting.deploy(campaignManager.address)

              await campaignManager.setTokenPoolAddress(coinRiseTokenPool.address)
              await campaignManager.setVotingContractAddress(voting.address)

              return {
                  deployer,
                  submitter,
                  contributor1,
                  contributor2,
                  badActor,
                  managerContract,
                  campaignFactory,
                  mockToken,
                  coinRiseNft,
                  voting,
                  receiver,
                  mockVoting,
                  campaignManager,
              }
          }

          let deadline, minAmount, tokenTiers
          beforeEach(() => {
              deadline = 30 //30 seconds
              minAmount = ethers.utils.parseEther("2")
              tokenTiers = [
                  ethers.utils.parseEther("0.1"),
                  ethers.utils.parseEther("0.2"),
                  ethers.utils.parseEther("0.3"),
              ]
          })

          describe("#initialize", () => {
              it("initialize the clone successfully", async () => {
                  const { campaignFactory, submitter, coinRiseNft, mockToken } = await loadFixture(
                      deployCampaignFixture
                  )

                  const tx = await campaignFactory.deployNewContract(
                      deadline,
                      submitter.address,
                      mockToken.address,
                      coinRiseNft.address,
                      minAmount,
                      "xx",
                      tokenTiers,
                      false
                  )

                  const txReceipt = await tx.wait()
                  let campaignAddress
                  for (i = 0; i < txReceipt.events.length; i++) {
                      if (txReceipt.events[i].event == "deployedNewCloneContract") {
                          campaignAddress = txReceipt.events[i].args.newContract
                      }
                  }

                  const campaign = await ethers.getContractAt("Campaign", campaignAddress)

                  const _duration = await campaign.getDuration()

                  assert.equal(_duration.toNumber(), deadline)
              })

              it("failed to initialize the campaign twice", async () => {
                  const { campaignFactory, submitter, coinRiseNft, mockToken } = await loadFixture(
                      deployCampaignFixture
                  )

                  const tx = await campaignFactory.deployNewContract(
                      deadline,
                      submitter.address,
                      mockToken.address,
                      coinRiseNft.address,
                      minAmount,
                      "xx",
                      tokenTiers,
                      false
                  )

                  const txReceipt = await tx.wait()
                  let campaignAddress
                  for (i = 0; i < txReceipt.events.length; i++) {
                      if (txReceipt.events[i].event == "deployedNewCloneContract") {
                          campaignAddress = txReceipt.events[i].args.newContract
                      }
                  }

                  const campaign = await ethers.getContractAt("Campaign", campaignAddress)

                  await expect(
                      campaign.initialize(
                          deadline,
                          submitter.address,
                          mockToken.address,
                          coinRiseNft.address,
                          minAmount,
                          "xx",
                          tokenTiers,
                          false
                      )
                  ).to.revertedWith("Initializable: contract is already initialized")
              })
          })

          describe("#transferStableTokensAfterRequest", () => {
              it("successfully transfer the tokens to the receiver address", async () => {
                  const {
                      campaignFactory,
                      deployer,
                      submitter,
                      coinRiseNft,
                      mockToken,
                      mockVoting,
                      receiver,
                      contributor1,
                      campaignManager,
                  } = await loadFixture(deployCampaignFixture)

                  await campaignFactory.connect(deployer).transferOwnership(campaignManager.address)
                  await campaignManager
                      .connect(submitter)
                      .createNewCampaignWithVoting(deadline, minAmount, "xx", tokenTiers, 4)
                  const campaignAddress = await campaignFactory.getLastDeployedCampaign()
                  const campaign = await ethers.getContractAt("Campaign", campaignAddress)

                  await fundSuccessfulCampaign(campaign, campaignManager, mockToken, contributor1)

                  const _balanceBefore = await mockToken.balanceOf(receiver.address)

                  await successfullFinishRequest(
                      campaign,
                      submitter,
                      receiver,
                      contributor1,
                      campaignManager
                  )

                  const _balanceAfter = await mockToken.balanceOf(receiver.address)

                  assert(_balanceAfter.gt(_balanceBefore))
              })
          })

          describe("#mintCampaignNFT", () => {
              it("successfully mint a NFT for the contributor", async () => {
                  const {
                      campaignManager,
                      deployer,
                      submitter,
                      campaignFactory,
                      mockToken,
                      contributor1,
                  } = await loadFixture(deployCampaignFixture)
                  await campaignFactory.connect(deployer).transferOwnership(campaignManager.address)
                  await campaignManager
                      .connect(submitter)
                      .createNewCampaignWithVoting(deadline, minAmount, "xx", tokenTiers, 4)
                  const campaignAddress = await campaignFactory.getLastDeployedCampaign()
                  const campaign = await ethers.getContractAt("Campaign", campaignAddress)
                  await fundSuccessfulCampaign(campaign, campaignManager, mockToken, contributor1)

                  await campaign.connect(contributor1).mintCampaignNFT()
              })
          })
      })

async function fundSuccessfulCampaign(campaign, campaignManager, mockToken, contributor) {
    const _minAmount = await campaign.getMinAmount()

    await mockToken.mint(contributor.address, _minAmount)
    await mockToken.connect(contributor).approve(campaignManager.address, _minAmount)

    await campaignManager.connect(contributor).contributeCampaign(_minAmount, campaign.address)

    const _remainingTime = await campaign.getRemainingFundingTime()

    await time.increase(_remainingTime)

    const _answer = await campaignManager.checkUpkeep("0x")

    await campaignManager.performUpkeep(_answer.performData)
}

async function successfullFinishRequest(
    campaign,
    submitter,
    receiver,
    contributor1,
    campaignManager
) {
    const _supply = await campaign.getTotalSupply()
    await campaign
        .connect(submitter)
        .transferStableTokensWithRequest(receiver.address, _supply, 90, "xx")

    const _requests = await campaign.getAllRequests()

    await campaign.connect(contributor1).voteOnTransferRequest(_requests[0].id, true)

    await time.increaseTo(_requests[0].endDate.toNumber())
    const _answer = await campaignManager.checkUpkeep("0x")

    await campaignManager.performUpkeep(_answer.performData)
}
