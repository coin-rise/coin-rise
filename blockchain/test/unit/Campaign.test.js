const { expect, assert } = require("chai")
const { ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Campaign Unit Test", () => {
          describe("Campaign successfull initialize", () => {
              it("deploy the campaign contract", async () => {
                  const [owner] = await ethers.getSigners()

                  const campaign = await ethers.getContractFactory("Campaign")

                  const deployedCampaign = await campaign.deploy()
              })
          })
      })
