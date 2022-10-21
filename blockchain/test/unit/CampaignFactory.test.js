const { expect, assert } = require("chai")
const { ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Campaign Unit Test", () => {
          let campaignFactory, campaignImplementation, owner

          beforeEach(async () => {
              const [address] = await ethers.getSigners()

              owner = address

              const campaign = await ethers.getContractFactory("Campaign")

              campaignImplementation = await campaign.deploy()

              const factoryCampaignFactory = await ethers.getContractFactory("CampaignFactory")

              campaignFactory = await factoryCampaignFactory.deploy(campaignImplementation.address)
          })

          describe("#constructor", () => {
              it("deploy the campaign factory contract", async () => {})
          })
      })
