//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Campaign.sol";

contract CampaignFactory is Ownable {
    /* ====== State variables ====== */
    address private implementationContract;

    address[] private deployedCampaignContracts;

    constructor(address _implementationContract) {
        implementationContract = _implementationContract;
    }

    /* ====== Events ====== */

    event deployedNewCloneContract(address newContract);

    /* ====== Functions ====== */

    /**
     * @dev create and setup a new crowdfunding campaign
     * @param _deadline - duration till the campaign has to be funded
     * @param _submitter - the address of the submitter of the campaign
     * @param _token - the used stable token for funding
     * @param _minAmount - minimum Amount of tokens that have to be funded
     */
    function deployNewContract(
        uint256 _deadline,
        address _submitter,
        address _token,
        address _coinRiseToken,
        uint256 _minAmount,
        string memory _campaignURI,
        uint256[3] memory _tokenTiers,
        bool _requestingPayouts
    ) external onlyOwner {
        address _clone = Clones.clone(implementationContract);

        Campaign(_clone).initialize(
            _deadline,
            _submitter,
            _token,
            _coinRiseToken,
            _minAmount,
            _campaignURI,
            _tokenTiers,
            _requestingPayouts
        );
        Campaign(_clone).transferOwnership(msg.sender);

        deployedCampaignContracts.push(_clone);

        emit deployedNewCloneContract(_clone);
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
