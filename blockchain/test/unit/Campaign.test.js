const { expect, assert } = require("chai")
const { ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Campaign Unit Test", () => {
          async function deployCampaignFixture() {
              const [owner] = await ethers.getSigners()

              const Campaign = await ethers.getContractFactory("Campaign")
              const campaign = await Campaign.deploy()

              return { campaign, owner }
          }

          describe("#initialize", () => {
              it("reverts after trying to initialize the contract again", async () => {
                  const { campaign } = await loadFixture(deployCampaignFixture)

                  await expect(
                      campaign.initialize(30, ethers.utils.parseEther("2"))
                  ).to.be.revertedWith("Initializable: contract is already initialized")
              })
          })
      })
