//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface ICoinriseTokenPool {
    function sendFundsToCampaignContract(
        address _campaignAddress,
        uint256 _amount
    ) external;

    function transferStableTokensFromManager(
        uint256 _amount,
        uint256 _fees,
        address from
    ) external;

    function withdrawFreeStableTokens(uint256 _amount) external;
}
