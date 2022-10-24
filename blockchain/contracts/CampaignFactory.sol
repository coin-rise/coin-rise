//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Campaign.sol";

contract CampaignFactory is Ownable {
    /** State variables */
    address private implementationContract;

    address[] private deployedCampaignContracts;

    /** Events */
    event CampaignCreated(address campaign, uint256 deadline, uint256 minFund);

    constructor(address _implementationContract) {
        implementationContract = _implementationContract;
    }

    /** Functions */

    /**
     * @dev create and setup a new crowdfunding campaign
     * @param _deadline - duration till the campaign has to be funded
     * @param _minFund - minimum Amount for a sucessfull funded campaign
     */
    function deployNewContract(
        uint256 _deadline,
        uint256 _minFund,
        address _submitter,
        address _token
    ) external onlyOwner {
        address _clone = Clones.clone(implementationContract);

        Campaign(_clone).initialize(_deadline, _minFund, _submitter, _token);
        Campaign(_clone).transferOwnership(msg.sender);

        deployedCampaignContracts.push(_clone);

        emit CampaignCreated(_clone, _deadline, _minFund);
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
