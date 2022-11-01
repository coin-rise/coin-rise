// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CampaignToken.sol";

contract CampaignTokenFactory is Ownable {
    address private implementationContract;

    address[] private deployedCampaignTokenContracts;

    constructor(address _implementationContract) {
        implementationContract = _implementationContract;
    }

    /** Functions */

    function deployNewCampaignToken(
        string memory _tokenName,
        string memory _tokenSymbol,
        address _campaignContractAddress
    ) external onlyOwner {
        address _clone = Clones.clone(implementationContract);

        CampaignToken(_clone).initialize(_tokenName, _tokenSymbol);

        bytes32 _minterRole = CampaignToken(_clone).MINTER_ROLE();

        CampaignToken(_clone).grantRole(_minterRole, _campaignContractAddress);

        deployedCampaignTokenContracts.push(_clone);
    }
}
