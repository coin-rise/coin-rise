//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./Campaign.sol";

contract CampaignFactory {
    address private implementationContract;

    address[] private deployedCampaignContracts;

    constructor(address _implementationContract) {
        implementationContract = _implementationContract;
    }

    /** Functions */

    function deployNewContract(uint256 _deadline, uint256 _minFund) external {
        address _clone = Clones.clone(implementationContract);

        Campaign(_clone).initialize(_deadline, _minFund);

        deployedCampaignContracts.push(_clone);
    }

    /** View Functions */
    function getDeployedCampaignContracts()
        external
        view
        returns (address[] memory)
    {
        return deployedCampaignContracts;
    }

    function getLastDeployedCampaign() external view returns (address) {
        return deployedCampaignContracts[deployedCampaignContracts.length - 1];
    }

    function getImplementationContract() external view returns (address) {
        return implementationContract;
    }
}
