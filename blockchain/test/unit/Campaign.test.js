const { expect, assert } = require("chai")
const { ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Campaign Unit Test", () => {
          async function deployCampaignFixture() {
              const [owner, submitter, contributor1, contributor2] = await ethers.getSigners()

              const Campaign = await ethers.getContractFactory("Campaign")
              const campaign = await Campaign.deploy()

              const CampaignFactory = await ethers.getContractFactory("CampaignFactory")

              const campaignFactory = await CampaignFactory.deploy(campaign.address)

              const StableMockToken = await ethers.getContractFactory("MockToken")
              const _name = "MockDUSD"
              const _symbol = "MUSD"
              const stableMockToken = await StableMockToken.deploy(_name, _symbol)

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

              return {
                  _newCampaign,
                  campaign,
                  stableMockToken,
                  owner,
                  submitter,
                  contributor1,
                  contributor2,
                  campaignFactory,
              }
          }

          describe("#initialize", () => {
              it("reverts after trying to initialize the contract again", async () => {
                  const { campaign, stableMockToken, submitter } = await loadFixture(
                      deployCampaignFixture
                  )

                  await expect(
                      campaign.initialize(
                          30,
                          ethers.utils.parseEther("2"),
                          submitter.address,
                          stableMockToken.address
                      )
                  ).to.be.revertedWith("Initializable: contract is already initialized")
              })
          })

          describe("#add Contributor", () => {
              it("Successfully adds Contributor", async () => {
                  const {
                      _newCampaign,
                      owner,
                      campaign,
                      stableMockToken,
                      submitter,
                      contributor1,
                  } = await loadFixture(deployCampaignFixture)

                  await _newCampaign.connect(owner).addContributor(contributor1.address, 55)
                  const contribution = await _newCampaign.ViewContribustion(contributor1.address)

                  assert.equal(contribution, 55)
              })
          })

          describe("#send to submitter", () => {})
      })
