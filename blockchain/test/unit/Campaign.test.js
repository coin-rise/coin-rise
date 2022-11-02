const { expect, assert } = require("chai")
const { ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Campaign Unit Test", () => {
          async function deployCampaignFixture() {
              const [owner, submitter, contributor1, contributor2, newSubmitter, badActor] =
                  await ethers.getSigners()

              const Campaign = await ethers.getContractFactory("Campaign")
              const campaign = await Campaign.deploy()

              const CampaignFactory = await ethers.getContractFactory("CampaignFactory")

              const campaignFactory = await CampaignFactory.deploy(campaign.address)

              const StableMockToken = await ethers.getContractFactory("MockToken")
              const _name = "MockDUSD"
              const _symbol = "MUSD"
              const stableMockToken = await StableMockToken.deploy(_name, _symbol)

              const _deadline = 30
              const minAmount = ethers.utils.parseEther("2")
              const campaignURI = "test"

              await campaignFactory.deployNewContract(
                  _deadline,
                  submitter.address,
                  stableMockToken.address,
                  minAmount,
                  campaignURI
              )

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
                  campaignURI,
                  minAmount,
                  newSubmitter,
                  badActor,
              }
          }

          describe("#initialize", () => {
              it("reverts after trying to initialize the contract again", async () => {
                  const { campaign, stableMockToken, submitter, minAmount, campaignURI } =
                      await loadFixture(deployCampaignFixture)

                  await expect(
                      campaign.initialize(
                          30,
                          submitter.address,
                          stableMockToken.address,
                          minAmount,
                          campaignURI
                      )
                  ).to.be.revertedWith("Initializable: contract is already initialized")
              })
          })

          describe("#add Contributor", () => {
              it("Successfully adds Contributor", async () => {
                  const { _newCampaign, owner, contributor1 } = await loadFixture(
                      deployCampaignFixture
                  )

                  await _newCampaign.connect(owner).addContributor(contributor1.address, 55)
                  const contribution = await _newCampaign.getContributor(contributor1.address)

                  assert.equal(contribution, 55)
              })
          })

          describe("#updateSubmitterAddress", () => {
              it("successfully update the address of the submitter", async () => {
                  const { _newCampaign, owner, newSubmitter } = await loadFixture(
                      deployCampaignFixture
                  )

                  await _newCampaign.connect(owner).updateSubmitterAddress(newSubmitter.address)

                  const _updatedSubmitter = await _newCampaign.getSubmitter()

                  assert.equal(_updatedSubmitter, newSubmitter.address)
              })

              it("successfully emit an event after updating a new submitter of the campaign", async () => {
                  const { _newCampaign, newSubmitter } = await loadFixture(deployCampaignFixture)

                  await expect(_newCampaign.updateSubmitterAddress(newSubmitter.address))
                      .to.emit(_newCampaign, "SubmitterAddressChanged")
                      .withArgs(newSubmitter.address)
              })

              it("failed update the submitter to a zero address", async () => {
                  const { _newCampaign, owner } = await loadFixture(deployCampaignFixture)
                  const _zeroAddress = ethers.constants.AddressZero

                  await expect(
                      _newCampaign.connect(owner).updateSubmitterAddress(_zeroAddress)
                  ).to.be.revertedWith("Invalid address")
              })

              it("failed if not the owner call the update function", async () => {
                  const { _newCampaign, badActor } = await loadFixture(deployCampaignFixture)

                  await expect(
                      _newCampaign.connect(badActor).updateSubmitterAddress(badActor.address)
                  ).to.be.revertedWith("Ownable: caller is not the owner")
              })
          })

          describe("#finishFunding", () => {
              it("successfully change the state of the campaign to successfull funded", async () => {
                  const { _newCampaign, contributor1, submitter, stableMockToken } =
                      await loadFixture(deployCampaignFixture)

                  const _amount = ethers.utils.parseEther("100")

                  await _newCampaign.addContributor(contributor1.address, _amount)

                  const _duration = await _newCampaign.getDuration()

                  await time.increase(_duration)
                  await stableMockToken.mint(_newCampaign.address, _amount)
                  await _newCampaign.finishFunding()

                  const _finished = await _newCampaign.isFundingActive()
                  const _success = await _newCampaign.getFundingStatus()

                  assert(!_finished)
                  assert(_success)
              })
          })

          describe("#transferStableTokens", () => {
              it("successfully transfer the stable tokens to an other address", async () => {
                  const { _newCampaign, contributor1, contributor2, submitter, stableMockToken } =
                      await loadFixture(deployCampaignFixture)

                  const _amount = ethers.utils.parseEther("100")

                  await _newCampaign.addContributor(contributor1.address, _amount)

                  const _duration = await _newCampaign.getDuration()

                  await time.increase(_duration)

                  await _newCampaign.finishFunding()

                  await stableMockToken.mint(_newCampaign.address, _amount)
                  await _newCampaign
                      .connect(submitter)
                      .transferStableTokens(contributor1.address, _amount)
              })
          })
      })
