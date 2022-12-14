const { expect, assert } = require("chai")
const { ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("CampaignFactory Unit Test", () => {
          async function deployCampaignFactoryFixture() {
              const [owner, submitter, badActor] = await ethers.getSigners()

              const Campaign = await ethers.getContractFactory("Campaign")
              const campaign = await Campaign.deploy()

              const CampaignFactory = await ethers.getContractFactory("CampaignFactory")

              const campaignFactory = await CampaignFactory.deploy(campaign.address)

              const StableMockToken = await ethers.getContractFactory("MockToken")
              const _name = "MockDUSD"
              const _symbol = "MUSD"
              const stableMockToken = await StableMockToken.deploy(_name, _symbol)

              const CoinRiseNFT = await ethers.getContractFactory("CoinRiseNFT")
              const coinRiseNft = await CoinRiseNFT.deploy()

              return {
                  owner,
                  campaign,
                  campaignFactory,
                  stableMockToken,
                  submitter,
                  badActor,
                  coinRiseNft,
              }
          }

          describe("#constructor", () => {
              it("Successfully set the implementaion contract", async () => {
                  const { campaignFactory, campaign } = await loadFixture(
                      deployCampaignFactoryFixture
                  )

                  const _implementationContractAddress =
                      await campaignFactory.getImplementationContract()

                  assert.equal(_implementationContractAddress, campaign.address)
              })
          })

          describe("#deployNewContract", () => {
              it("Successfully creates a Campaign", async () => {
                  const { campaignFactory, submitter, stableMockToken, coinRiseNft } =
                      await loadFixture(deployCampaignFactoryFixture)

                  const _deadline = 30
                  const _minAmount = ethers.utils.parseEther("2")
                  const _campaignURI = "test"

                  const _tierOne = ethers.utils.parseEther("2")
                  const _tierTwo = ethers.utils.parseEther("4")
                  const _tierThree = ethers.utils.parseEther("6")

                  const _tokenTiers = [_tierOne, _tierTwo, _tierThree]

                  const _requestingPayouts = false

                  await campaignFactory.deployNewContract(
                      _deadline,
                      submitter.address,
                      stableMockToken.address,
                      coinRiseNft.address,
                      _minAmount,
                      _campaignURI,
                      _tokenTiers,
                      _requestingPayouts
                  )

                  const _numberOfContracts = (await campaignFactory.getDeployedCampaignContracts())
                      .length

                  assert.equal(_numberOfContracts, 1)
              })

              it("Successfully initialize the new Campaign", async () => {
                  const { campaignFactory, submitter, stableMockToken, coinRiseNft } =
                      await loadFixture(deployCampaignFactoryFixture)

                  const _deadline = 30
                  const _minAmount = ethers.utils.parseEther("2")
                  const _campaignURI = "test"

                  const _tierOne = ethers.utils.parseEther("2")
                  const _tierTwo = ethers.utils.parseEther("4")
                  const _tierThree = ethers.utils.parseEther("6")

                  const _tokenTiers = [_tierOne, _tierTwo, _tierThree]

                  const _requestingPayouts = false

                  await campaignFactory.deployNewContract(
                      _deadline,
                      submitter.address,
                      stableMockToken.address,
                      coinRiseNft.address,
                      _minAmount,
                      _campaignURI,
                      _tokenTiers,
                      _requestingPayouts
                  )
                  const _start = await time.latest()
                  const _newCampaignAddress = await campaignFactory.getLastDeployedCampaign()

                  const _newCampaign = await ethers.getContractAt("Campaign", _newCampaignAddress)

                  const _startDate = await _newCampaign.getStartDate()

                  assert.equal(_startDate, _start)
              })

              it("successfully transfer the ownership of the campaign to the sender", async () => {
                  const { owner, campaignFactory, submitter, stableMockToken, coinRiseNft } =
                      await loadFixture(deployCampaignFactoryFixture)

                  const _deadline = 30
                  const _minAmount = ethers.utils.parseEther("2")
                  const _campaignURI = "test"

                  const _tierOne = ethers.utils.parseEther("2")
                  const _tierTwo = ethers.utils.parseEther("4")
                  const _tierThree = ethers.utils.parseEther("6")

                  const _tokenTiers = [_tierOne, _tierTwo, _tierThree]

                  const _requestingPayouts = false

                  await campaignFactory.deployNewContract(
                      _deadline,
                      submitter.address,
                      stableMockToken.address,
                      coinRiseNft.address,
                      _minAmount,
                      _campaignURI,
                      _tokenTiers,
                      _requestingPayouts
                  )

                  const _newCampaignAddress = await campaignFactory.getLastDeployedCampaign()

                  const _newCampaign = await ethers.getContractAt("Campaign", _newCampaignAddress)

                  const _owner = await _newCampaign.owner()

                  assert.equal(owner.address, _owner)
              })

              it("failed to create a new campaign when the sender is not the owner", async () => {
                  const { campaignFactory, badActor, stableMockToken, coinRiseNft } =
                      await loadFixture(deployCampaignFactoryFixture)

                  const _deadline = 30
                  const _minAmount = ethers.utils.parseEther("2")
                  const _campaignURI = "test"

                  const _tierOne = ethers.utils.parseEther("2")
                  const _tierTwo = ethers.utils.parseEther("4")
                  const _tierThree = ethers.utils.parseEther("6")

                  const _tokenTiers = [_tierOne, _tierTwo, _tierThree]

                  const _requestingPayouts = false

                  await expect(
                      campaignFactory
                          .connect(badActor)
                          .deployNewContract(
                              _deadline,
                              badActor.address,
                              stableMockToken.address,
                              coinRiseNft.address,
                              _minAmount,
                              _campaignURI,
                              _tokenTiers,
                              _requestingPayouts
                          )
                  ).to.be.revertedWith("Ownable: caller is not the owner")
              })
          })
      })
