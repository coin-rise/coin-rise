//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

error CoinRiseTokenPool__NotCampaignManager();
error CoinRiseTokenPool__NotEnoughFreeStableTokens();

contract CoinRiseTokenPool is AccessControl {
    bytes32 public constant WITHDRAW_ROLE = keccak256("WITHDRAW_ROLE");
    bytes32 public constant SENDER_ROLE = keccak256("SENDER_ROLE");

    /** State Variables */

    IERC20 private stableToken;

    address private campaignManagerAddress;

    uint256 private lockedTotalStableTokenSupply;

    uint256 private freeTotalStableTokenSupply;

    /** Events */
    event FundingsSentToCampaign(address campaign, uint256 amount);
    event StableTokensUpdated(
        uint256 lockedTotalSupply,
        uint256 freeTotalSupply
    );

    event WithdrawFreeStableTokenFunds(address to, uint256 amount);

    /** Modifiers */

    modifier isManagerContract(address _contractAddress) {
        if (campaignManagerAddress != _contractAddress) {
            revert CoinRiseTokenPool__NotCampaignManager();
        }
        _;
    }

    constructor(address _stableToken, address _campaignManagerAddress) {
        stableToken = IERC20(_stableToken);
        campaignManagerAddress = _campaignManagerAddress;
    }

    /** Functions */

    function sendFundsToCampaignContract(
        address _campaignAddress,
        uint256 _amount
    ) external isManagerContract(msg.sender) {
        require(stableToken.transfer(_campaignAddress, _amount));

        lockedTotalStableTokenSupply -= _amount;

        emit FundingsSentToCampaign(_campaignAddress, _amount);
    }

    function transferStableTokensFromManager(
        uint256 _amount,
        uint256 _fees,
        address from
    ) external isManagerContract(msg.sender) {
        require(stableToken.transferFrom(from, address(this), _amount));

        lockedTotalStableTokenSupply += _amount - _fees;
        freeTotalStableTokenSupply += _fees;

        emit StableTokensUpdated(
            lockedTotalStableTokenSupply,
            freeTotalStableTokenSupply
        );
    }

    function withdrawFreeStableTokens(uint256 _amount)
        external
        onlyRole(WITHDRAW_ROLE)
    {
        uint256 _freeTokenAmount = freeTotalStableTokenSupply;

        if (_freeTokenAmount < _amount) {
            revert CoinRiseTokenPool__NotEnoughFreeStableTokens();
        }

        _freeTokenAmount -= _amount;

        require(stableToken.transfer(msg.sender, _amount));

        freeTotalStableTokenSupply = _freeTokenAmount;

        emit WithdrawFreeStableTokenFunds(msg.sender, _amount);
    }
}
