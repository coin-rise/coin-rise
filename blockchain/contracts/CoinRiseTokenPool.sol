//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./Interfaces/ICampaign.sol";

error CoinRiseTokenPool__NotEnoughFreeStableTokens();
error CoinRiseTokenPool__NotEnoughLockedStableCoins();
error CoinRiseTokenPool__TokensAlreadyTransfered();
error CoinRiseTokenPool__NotEnoughContributorStableTokens();
error CoinRiseTokenPool__NoTokensSent();

contract CoinRiseTokenPool is AccessControl {
    /* ====== Constants ====== */
    bytes32 public constant WITHDRAW_ROLE = keccak256("WITHDRAW_ROLE");
    bytes32 public constant SENDER_ROLE = keccak256("SENDER_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    /* ====== State Variables ====== */

    IERC20 private stableToken;

    address private campaignManagerAddress;

    // Information about the distributed tokens
    uint256 private lockedTotalStableTokenSupply;

    uint256 private freeTotalStableTokenSupply;

    uint256 private contributorTokenSupply;

    // Overview of whether a campaign has already been sent its funds
    mapping(address => bool) private transferedTokens;

    /* ====== Events ====== */

    event FundingsSentToCampaign(address campaign, uint256 amount);

    event FundingsSentToSubmitter(
        address submitter,
        address campaign,
        uint256 amount
    );

    event StableTokensUpdated(
        uint256 lockedTotalSupply,
        uint256 freeTotalSupply,
        uint256 contributorSupply
    );

    event WithdrawFreeStableTokenFunds(address to, uint256 amount);

    event RegistryAddressUpdated(address newAddress);

    /* ====== Modifier ====== */

    modifier hasFunds(uint256 _amount) {
        uint256 _totalSupply = stableToken.balanceOf(address(this));

        uint256 _sumSupply = freeTotalStableTokenSupply +
            lockedTotalStableTokenSupply +
            contributorTokenSupply +
            _amount;
        if (_totalSupply != _sumSupply) {
            revert CoinRiseTokenPool__NoTokensSent();
        }
        _;
    }

    /* ====== Functions ====== */

    /**
     * @dev - construcor function for setting up the roles and initialize the variables
     * @param _stableToken - the address of the used stable token (e.g. DAI)
     * @param _campaignManagerAddress - the address of the campaign manager
     * @notice - the most function are only callable by the manager contract
     */
    constructor(address _stableToken, address _campaignManagerAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, _campaignManagerAddress);

        stableToken = IERC20(_stableToken);

        freeTotalStableTokenSupply = 0;
        contributorTokenSupply = 0;
        lockedTotalStableTokenSupply = 0;

        campaignManagerAddress = _campaignManagerAddress;
    }

    /* ====== Public/External Functions */

    /**
     * @dev - send the locked stable tokens of the campaign to the campaign contract
     * @param _campaignAddress - the address of the campaign
     */
    function sendFundsToCampaignContract(address _campaignAddress)
        external
        onlyRole(MANAGER_ROLE)
    {
        uint256 _amount = ICampaign(_campaignAddress).getTotalSupply();

        _transferFundsSafe(_campaignAddress, _amount, _campaignAddress);

        emit FundingsSentToCampaign(_campaignAddress, _amount);
    }

    /**
     * @dev - send the locked stable tokens of the campaign without voting system after finished successful to the submitter
     * @param _campaignAddress - the address of the campaign
     */
    function sendFundsToSubmitter(address _campaignAddress)
        external
        onlyRole(MANAGER_ROLE)
    {
        address _submitter = ICampaign(_campaignAddress).getSubmitter();
        uint256 _amount = ICampaign(_campaignAddress).getTotalSupply();

        _transferFundsSafe(_submitter, _amount, _campaignAddress);

        emit FundingsSentToSubmitter(_submitter, _campaignAddress, _amount);
    }

    /**
     * @dev - update the total supplies after the manager contract transfered the stable tokens to the pool
     * @param _amount - the total amount sent including fees
     * @param _fees - the amount of collected fees
     */
    function setNewTotalSupplies(uint256 _amount, uint256 _fees)
        external
        onlyRole(MANAGER_ROLE)
        hasFunds(_amount)
    {
        lockedTotalStableTokenSupply += _amount - _fees;
        freeTotalStableTokenSupply += _fees;

        emit StableTokensUpdated(
            lockedTotalStableTokenSupply,
            freeTotalStableTokenSupply,
            contributorTokenSupply
        );
    }

    /**
     * @dev - after a not successfull campaign the supply of the campaign will go to the contributer pool
     * @param _amount - the total supply of the campaign to send
     * @param _campaignAddress - the address of the campaign with the funds
     */
    function transferStableTokensToContributorPool(
        uint256 _amount,
        address _campaignAddress
    ) external onlyRole(MANAGER_ROLE) {
        bool _transfered = transferedTokens[_campaignAddress];

        if (_transfered) {
            revert CoinRiseTokenPool__TokensAlreadyTransfered();
        }

        if (lockedTotalStableTokenSupply < _amount) {
            revert CoinRiseTokenPool__NotEnoughLockedStableCoins();
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

    /**
     * @dev - send the tokens of the contributor from the pool to the contributor
     * @param _amount - the total amount to send to the contributor
     * @param _to - the address of the contributor
     */
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

    /**
     * @dev - withdraw the free supply to an authorized wallet
     * @param _amount - amount of tokens to withdraw
     */
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

    /* ====== Internal Functions ====== */

    function _transferFundsSafe(
        address _to,
        uint256 _amount,
        address _campaignAddress
    ) internal {
        bool _transfered = transferedTokens[_campaignAddress];

        if (_transfered) {
            revert CoinRiseTokenPool__TokensAlreadyTransfered();
        }

        if (lockedTotalStableTokenSupply < _amount) {
            revert CoinRiseTokenPool__NotEnoughLockedStableCoins();
        }

        require(stableToken.transfer(_to, _amount));

        lockedTotalStableTokenSupply -= _amount;

        transferedTokens[_campaignAddress] = true;
    }

    /* ====== Pure/View Functions ====== */

    function getLockedTotalStableTokenSupply() external view returns (uint256) {
        return lockedTotalStableTokenSupply;
    }

    function getFreeTotalStableTokenSupply() external view returns (uint256) {
        return freeTotalStableTokenSupply;
    }

    function getContributorStableTokenSupply() external view returns (uint256) {
        return contributorTokenSupply;
    }

    function getCampaignManagerAddress() external view returns (address) {
        return campaignManagerAddress;
    }

    function getStableTokenAddress() external view returns (address) {
        return address(stableToken);
    }
}
