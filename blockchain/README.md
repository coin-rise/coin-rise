# Coin Rise Blockchain

crowdfunding platform with crypto for non-profit projects.

the following graphic provides an overview of the project process

For the submitter:
![Flow Chart submitter coin-rise](./assets/SubmitterExperience.jpg)

For the user:
![Flow Chart user coin-rise](./assets/UserExperience.jpg)

## Roadmap

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

### 1. Campaign Creation (Submitter)

The creation of a campaign is carried out with CampaignManager Contract.

<ins>Create a campaign without voting system:</ins>

```
  createNewCampaign(
        uint256 _deadline,
        uint256 _minAmount,
        string memory _campaignURI,
        uint256[3] memory _tokenTiers
    )
```

| Parameter      | Type        | Description                                     |
| :------------- | :---------- | :---------------------------------------------- |
| `_deadline`    | `uint256`   | duration of the funding process                 |
| `_minAmount`   | `uint256`   | minimum Amount of Tokens for successful funding |
| `_campaignURI` | `string`    | IPFS link of the campaign data                  |
| `_tokenTiers`  | `uint256[]` | funding breakpoints for token tiers of the NFT  |

<ins>Create a campaign with voting system:</ins>

```
  createNewCampaignWithVoting(
        uint256 _deadline,
        uint256 _minAmount,
        string memory _campaignURI,
        uint256[3] memory _tokenTiers,
        uint256 _quorumPercentage
    )
```

| Parameter          | Type        | Description                                                                  |
| :----------------- | :---------- | :--------------------------------------------------------------------------- |
| `_deadline`        | `uint256`   | duration of the funding process                                              |
| `_minAmount`       | `uint256`   | minimum Amount of Tokens for successful funding                              |
| `_campaignURI`     | `string`    | IPFS link of the campaign data                                               |
| `_tokenTiers`      | `uint256[]` | funding breakpoints for token tiers of the NFT                               |
| `quorumPercentage` | `uint256`   | the required voting participation in percent points for a successful request |

### 2. Campaign Contributions (Users)

<ins>Contribute to a campaign as an user:</ins>

```
  contributeCampaign(uint256 _amount, address _campaignAddress)
```

| Parameter   | Type      | Description                                                                   |
| :---------- | :-------- | :---------------------------------------------------------------------------- |
| `_amount`   | `uint256` | amount of tokens want to spend                                                |
| `_campaign` | `address` | The address of the campaign. All campaigns can be viewed via campaign factory |

## Smart Contracts Mumbai Deployments

| Contracts              |                 Addresses                  |
| :--------------------- | :----------------------------------------: |
| Campaign.sol           | 0xA01F427F0F47eb73f5eefa98E2DD6F242530C97b |
| CampaignManager.sol    | 0x23674A05155e79d09946E669D330Dec65788B185 |
| CampaignFactory.sol    | 0xE96A7958569ce2683c1889CA8B9be87e15A7081d |
| CoinRiseTokenPool.sol  | 0x025804f16b7388A048B310A0b62E69368C15650d |
| Voting.sol             | 0x9c00062ac794ae698dfD75D0b0f005C055EC764C |
| CoinRiseNFT.sol        | 0x6E05D52E296a2eCfB444025F65c63872cFAEE310 |
| MockDAI Token (mumbai) | 0xDD5FC320b0188F92e15f10c739DcAE0bD93d5921 |
