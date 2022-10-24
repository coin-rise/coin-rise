//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface ICampaignFactory {
    event CampaignCreated(address campaign, uint256 deadline, uint256 minFund);

    function deployNewContract(
        uint256 _deadline,
        uint256 _minFund,
        address _submitter,
        address _token
    ) external;

    function getDeployedCampaignContracts()
        external
        view
        returns (address[] memory);

    function getLastDeployedCampaign() external view returns (address);

    function getImplementationContract() external view returns (address);
}
