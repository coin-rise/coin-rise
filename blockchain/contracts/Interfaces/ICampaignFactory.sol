//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface ICampaignFactory {
    function deployNewContract(
        uint256 _deadline,
        address _submitter,
        address _token,
        address _coinRiseToken,
        uint256 _minAmount,
        string memory _campaignURI,
        uint256[3] memory _tokenTiers,
        bool _requestingPayouts
    ) external;

    function getDeployedCampaignContracts()
        external
        view
        returns (address[] memory);

    function getLastDeployedCampaign() external view returns (address);

    function getImplementationContract() external view returns (address);
}
