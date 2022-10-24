const { expect, assert } = require("chai")
const { ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Campaign Unit Test", () => {
          async function deployCampaignFixture() {
              const [owner, submitter, contributer1] = await ethers.getSigners()

              const Campaign = await ethers.getContractFactory("Campaign")
              const campaign = await Campaign.deploy()

              const StableMockToken = await ethers.getContractFactory("MockToken")
              const _name = "MockDUSD"
              const _symbol = "MUSD"
              const stableMockToken = await StableMockToken.deploy(_name, _symbol)

              return { campaign, stableMockToken, owner, submitter, contributer1 }
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
      })
