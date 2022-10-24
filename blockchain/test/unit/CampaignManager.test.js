const { expect, assert } = require("chai")
const { ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("CampaignManager Unit Test", () => {
          async function deployCampaignManagerFixture() {
              const [owner, contributor, submitter] = await ethers.getSigners()

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

              return { campaignManager, owner, contributor, mockToken, submitter }
          }

          describe("#contributeCampaign", () => {
              it("successfully transfer the tokens to the campaign", async () => {
                  const { campaignManager, mockToken, submitter, contributor } = await loadFixture(
                      deployCampaignManagerFixture
                  )

                  //mint some tokens for the contributor
                  await mockToken.mint(contributor.address, ethers.utils.parseEther("1000"))
                  const _interval = 30
                  const _minFund = ethers.utils.parseEther("20")

                  const tx = await campaignManager
                      .connect(submitter)
                      .createNewCampaign(_interval, _minFund)

                  const txReceived = await tx.wait()
                  console.log(txReceived)

                  //   await campaignManager
                  //       .connect(contributor)
                  //       .contributeCampaign(ethers.utils.parseEther("10"))
              })
          })

          describe("#checkUpkeep", () => {
              it("successfully returns the Campaigns to be processed ", async () => {
                  const { campaignManager, owner } = await loadFixture(deployCampaignManagerFixture)
              })
          })
      })
