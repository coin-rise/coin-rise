//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

error CoinRiseTokenPool__NotEnoughFreeStableTokens();
error CoinRiseTokenPool__NotEnoughLockedStableCoins();
error CoinRiseTokenPool__TokensAlreadyTransfered();
error CoinRiseTokenPool__NotEnoughContributorStableTokens();

contract CoinRiseTokenPool is AccessControl {
    bytes32 public constant WITHDRAW_ROLE = keccak256("WITHDRAW_ROLE");
    bytes32 public constant SENDER_ROLE = keccak256("SENDER_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    /** State Variables */

    IERC20 private stableToken;

    address private campaignManagerAddress;

    // address private chainlinkRegistryAddress;

    uint256 private lockedTotalStableTokenSupply;

    uint256 private freeTotalStableTokenSupply;

    uint256 private contributorTokenSupply;

    mapping(address => bool) private transferedTokens;

    /** Events */
    event FundingsSentToCampaign(address campaign, uint256 amount);
    event StableTokensUpdated(
        uint256 lockedTotalSupply,
        uint256 freeTotalSupply,
        uint256 contributorSupply
    );

    event WithdrawFreeStableTokenFunds(address to, uint256 amount);

    event RegistryAddressUpdated(address newAddress);

    constructor(address _stableToken, address _campaignManagerAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, _campaignManagerAddress);

        stableToken = IERC20(_stableToken);

        freeTotalStableTokenSupply = 0;
        contributorTokenSupply = 0;
        lockedTotalStableTokenSupply = 0;
    }

    /** Functions */

    function sendFundsToCampaignContract(
        address _campaignAddress,
        uint256 _amount
    ) external onlyRole(MANAGER_ROLE) {
        bool _transfered = transferedTokens[_campaignAddress];

        if (_transfered) {
            revert CoinRiseTokenPool__TokensAlreadyTransfered();
        }

        if (lockedTotalStableTokenSupply < _amount) {
            revert CoinRiseTokenPool__NotEnoughLockedStableCoins();
        }

        require(stableToken.transfer(_campaignAddress, _amount));

        lockedTotalStableTokenSupply -= _amount;

        transferedTokens[_campaignAddress] = true;

        emit FundingsSentToCampaign(_campaignAddress, _amount);
    }

    function setNewTotalSupplies(uint256 _amount, uint256 _fees)
        external
        onlyRole(MANAGER_ROLE)
    {
        lockedTotalStableTokenSupply += _amount - _fees;
        freeTotalStableTokenSupply += _fees;

        emit StableTokensUpdated(
            lockedTotalStableTokenSupply,
            freeTotalStableTokenSupply,
            contributorTokenSupply
        );
    }

    function transferStableTokensToContributorPool(
        uint256 _amount,
        address _campaignAddress
    ) external onlyRole(MANAGER_ROLE) {
        bool _transfered = transferedTokens[_campaignAddress];

        if (_transfered) {
            revert CoinRiseTokenPool__TokensAlreadyTransfered();
        }

        contributorTokenSupply += _amount;

        lockedTotalStableTokenSupply -= _amount;

        transferedTokens[_campaignAddress] = true;

        emit StableTokensUpdated(
            lockedTotalStableTokenSupply,
            freeTotalStableTokenSupply,
            contributorTokenSupply
        );
    }

    function sendTokensToContributor(uint256 _amount, address _to)
        external
        onlyRole(MANAGER_ROLE)
    {
        if (contributorTokenSupply < _amount) {
            revert CoinRiseTokenPool__NotEnoughContributorStableTokens();
        }

        contributorTokenSupply -= _amount;
        require(stableToken.transfer(_to, _amount));

        emit StableTokensUpdated(
            lockedTotalStableTokenSupply,
            freeTotalStableTokenSupply,
            contributorTokenSupply
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

    function getLockedTotalStableTokenSupply() external view returns (uint256) {
        return lockedTotalStableTokenSupply;
    }

    function getFreeTotalStableTokenSupply() external view returns (uint256) {
        return freeTotalStableTokenSupply;
    }
}
