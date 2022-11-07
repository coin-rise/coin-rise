# Coin Rise Blockchain

crowdfunding platform with crypto for non-profit projects

the following graphic provides an overview of the project process

For the user:
![Flow Chart user coin-rise](./assets/UserExperience.jpg)

For the submitter:
![Flow Chart submitter coin-rise](./assets/SubmitterExperience.jpg)

## Roadmap

-   Testing Voting Feature (Unit Testing)
-   Testing Atomatisation from ChainlinKeeper (checkUpkeep,performUpkeep)
-   deploy new Contracts to polygon mumbai
-   writing staging tests for all possible scenarios

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`QUICKNODE_API_KEY_POLYGON`

`POLYGON_MUMBAI_API_KEY`

`PRIVATE_KEY`

`POLYGONSCAN_API_KEY`

`REPORT_GAS`

`COINMARKETCAP_API_KEY`

`FORKING_BLOCK_NUMBER`

`PRIVATE_KEY_CONTRIBUTOR`

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

For running on the test on the mumbai network run:

```bash
  npm run test-staging
```

or

```bash
  yarn test-staging
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

&emsp; `updateSubmitterAddress`

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
| Campaigns.sol         | 0xA711DD409b4deB723C327AA788be9bB067B77519 |
| CampaignManager.sol   | 0x02D7E5f45A7ae98d8aa572Db8df54165aD4bF88b |
| CampaignFactory.sol   | 0xd98458e022ac999a547D49f9da37DCc6F4d1f19F |
| CoinRiseTokenPool.sol | 0x52d1004F0F70B5b09cf6E8f10E168d5a95E34529 |
