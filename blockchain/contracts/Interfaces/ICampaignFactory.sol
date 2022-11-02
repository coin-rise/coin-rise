//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface ICampaignFactory {
    function deployNewContract(
        uint256 _deadline,
        address _submitter,
        address _token,
        uint256 _minAmount,
        string memory _campaignURI
    ) external;

    function getDeployedCampaignContracts()
        external
        view
        returns (address[] memory);

    function getLastDeployedCampaign() external view returns (address);

    function getImplementationContract() external view returns (address);
}
