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

              await campaignFactory.transferOwnership(campaignManager.address)

              return { campaignManager, owner, contributor, mockToken, submitter, campaignFactory }
          }

          describe("#contributeCampaign", () => {
              it("successfully transfer the tokens to the campaign", async () => {
                  const { campaignManager, mockToken, submitter, contributor, campaignFactory } =
                      await loadFixture(deployCampaignManagerFixture)

                  //mint some tokens for the contributor
                  await mockToken.mint(contributor.address, ethers.utils.parseEther("1000"))
                  const _interval = 30
                  const _minFund = ethers.utils.parseEther("20")

                  await campaignManager.connect(submitter).createNewCampaign(_interval, _minFund)

                  const _campaignAddress = await campaignFactory.getLastDeployedCampaign()

                  const _tokenAmount = ethers.utils.parseEther("10")

                  await mockToken
                      .connect(contributor)
                      .approve(campaignManager.address, _tokenAmount)

                  await campaignManager
                      .connect(contributor)
                      .contributeCampaign(_tokenAmount, _campaignAddress)

                  const _balanceCampaign = await mockToken.balanceOf(_campaignAddress)

                  assert(_balanceCampaign.eq(_tokenAmount))
              })

              it("failed to contribute to a wrong campaign address", async () => {
                  const { campaignManager, contributor, submitter } = await loadFixture(
                      deployCampaignManagerFixture
                  )
                  const _tokenAmount = ethers.utils.parseEther("10")

                  const _interval = 30
                  const _minFund = ethers.utils.parseEther("20")

                  await campaignManager.connect(submitter).createNewCampaign(_interval, _minFund)

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
                  const _minFund = ethers.utils.parseEther("20")

                  await campaignManager.connect(submitter).createNewCampaign(_interval, _minFund)

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
                  const _minFund = ethers.utils.parseEther("20")

                  await campaignManager.connect(submitter).createNewCampaign(_interval, _minFund)

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
              it("successfully returns the Campaigns to be processed ", async () => {
                  const { campaignManager, owner } = await loadFixture(deployCampaignManagerFixture)
              })
          })
      })
