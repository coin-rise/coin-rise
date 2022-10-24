const { expect, assert } = require("chai")
const { ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("CampaignFactory Unit Test", () => {
          async function deployCampaignFactoryFixture() {
              const [owner, submitter] = await ethers.getSigners()

              const Campaign = await ethers.getContractFactory("Campaign")
              const campaign = await Campaign.deploy()

              const CampaignFactory = await ethers.getContractFactory("CampaignFactory")

              const campaignFactory = await CampaignFactory.deploy(campaign.address)

              const StableMockToken = await ethers.getContractFactory("MockToken")
              const _name = "MockDUSD"
              const _symbol = "MUSD"
              const stableMockToken = await StableMockToken.deploy(_name, _symbol)

              return { owner, campaign, campaignFactory, stableMockToken, submitter }
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
                  const { campaignFactory, submitter, stableMockToken } = await loadFixture(
                      deployCampaignFactoryFixture
                  )

                  const _deadline = 30

                  const _minFund = ethers.utils.parseEther("2")

                  await campaignFactory.deployNewContract(
                      _deadline,
                      _minFund,
                      submitter.address,
                      stableMockToken.address
                  )

                  const _numberOfContracts = (await campaignFactory.getDeployedCampaignContracts())
                      .length

                  assert.equal(_numberOfContracts, 1)
              })

              it("Successfully initialize the new Campaign", async () => {
                  const { campaignFactory, submitter, stableMockToken } = await loadFixture(
                      deployCampaignFactoryFixture
                  )

                  const _deadline = 30
                  const _minFund = ethers.utils.parseEther("2")

                  await campaignFactory.deployNewContract(
                      _deadline,
                      _minFund,
                      submitter.address,
                      stableMockToken.address
                  )
                  const _start = await time.latest()
                  const _newCampaignAddress = await campaignFactory.getLastDeployedCampaign()

                  const _newCampaign = await ethers.getContractAt("Campaign", _newCampaignAddress)

                  const _status = await _newCampaign.status()

                  assert.equal(_status.startDate, _start)
              })

              it("successfully transfer the ownership of the campaign to the sender", async () => {
                  const { owner, campaignFactory, submitter, stableMockToken } = await loadFixture(
                      deployCampaignFactoryFixture
                  )

                  const _deadline = 30
                  const _minFund = ethers.utils.parseEther("2")

                  await campaignFactory.deployNewContract(
                      _deadline,
                      _minFund,
                      submitter.address,
                      stableMockToken.address
                  )
                  const _start = await time.latest()
                  const _newCampaignAddress = await campaignFactory.getLastDeployedCampaign()

                  const _newCampaign = await ethers.getContractAt("Campaign", _newCampaignAddress)

                  const _owner = await _newCampaign.owner()

                  assert.equal(owner.address, _owner)
              })

              it("successfully emit an event when creating a new campaign", async () => {
                  const { campaignFactory, submitter, stableMockToken } = await loadFixture(
                      deployCampaignFactoryFixture
                  )

                  const _deadline = 30
                  const _minFund = ethers.utils.parseEther("2")
                  await expect(
                      campaignFactory.deployNewContract(
                          _deadline,
                          _minFund,
                          submitter.address,
                          stableMockToken.address
                      )
                  ).to.emit(campaignFactory, "CampaignCreated")
              })
          })
      })
