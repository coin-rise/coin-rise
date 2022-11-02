//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface ICoinRiseTokenPool {
    function sendFundsToCampaignContract(
        address _campaignAddress,
        uint256 _amount
    ) external;

    function withdrawFreeStableTokens(uint256 _amount) external;

    function setNewTotalSupplies(uint256 _amount, uint256 _fees) external;

    function sendTokensToContributor(uint256 _amount, address _to) external;

    function transferStableTokensToContributorPool(
        uint256 _amount,
        address _campaignAddress
    ) external;
}
