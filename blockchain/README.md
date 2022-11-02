# Coin Rise Blockchain

crowdfunding platform with crypto for non-profit projects

the following graphic provides an overview of the project process

For the user:
![Flow Chart user coin-rise](./assets/UserExperience.jpg)

For the submitter:
![Flow Chart submitter coin-rise](./assets/SubmitterExperience.jpg)

## Roadmap

-   Adding Featuers like yield generating or NFT's creation for contributors

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`QUICKNODE_API_KEY_POLYGON`

`POLYGON_MUMBAI_API_KEY`

`PRIVATE_KEY`

`POLYGONSCAN_API_KEY`

`REPORT_GAS`

`COINMARKETCAP_API_KEY`

`FORKING_BLOCK_NUMBER`

`AUTO_FUND`

## Running Tests

To run tests, run the following command

```bash
  npm run test
```

or

```bash
  yarn test
```

To view the coverage of the smart contracts run

```bash
  npm run coverage
```

or

```bash
  yarn coverage
```

## Deployment

To deploy and verify all required smart contracts on my-network run

```bash
  npm run deploy --network my-network
```

or

```bash
  yarn deploy --network my-network
```

## Run local blockchain

For testing a front-end, it is possible to run a local blockchain and deploy all the necessary smart contracts. For testing run:

```bash
  npm run hardhat node --network hardhat
  npm run deploy --network localhost
```

or

```bash
  yarn hardhat node --network hardhat
  yarn deploy --network localhost
```

## Smart Contracts

All ABIs and addresses can be retrieved after deployment under "./deployments/deployedContracts.json".

Each campaign has its own smart contract. The addresses of the campaign can be found through the CampaignFactory.

In this section all necessary functions are listed to interact with the protcol.

1. CampaignManager

&emsp; `createNewCampaign`

&emsp; `contributeCampaign`

&emsp; `setFees`

&emsp; `calculateFees`

&emsp; `getFees`

&emsp; `getActiveCampaigns`

2. CampaignFactory

&emsp; `getDeployedCampaignContracts`

&emsp; `getLastDeployedCampaign`

3. Campaign "Clone"

&emsp; `transferStableTokens`

&emsp; `getEndDate`

&emsp; `getStartDate`

&emsp; `getDuration`

&emsp; `getSubmitter`

&emsp; `isFundingActive`

&emsp; `getRemainingFundingTime`

&emsp; `getContributor`

&emsp; `getNumberOfContributor`

&emsp; `getTotalSupply`

4. CoinRiseTokenPool

&emsp; `withdrawFreeStableTokens`

&emsp; `getLockedTotalStableTokenSupply`

&emsp; `getFreeTotalStableTokenSupply`

## Smart Contracts Mumbai Deployments

| Contracts             |                 Addresses                  |
| :-------------------- | :----------------------------------------: |
| Campaigns.sol         | 0xD78Ec97B73CB5DB5a5fe873Fe48A56340C6D937E |
| CampaignManager.sol   | 0xcae4F58562920BA482004735201C9eb1aCc4F9b1 |
| CampaignFactory.sol   | 0x4556C0eA17a98668FAA814290d226850d6876379 |
| CoinRiseTokenPool.sol | 0xcB98D79f376023b8b201fEde26E14f449B188434 |
