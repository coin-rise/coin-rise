//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "./Interfaces/ICampaignFactory.sol";
import "./Interfaces/ICampaign.sol";
import "./Interfaces/ICoinRiseTokenPool.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error CampaignManager__AmountIsZero();
error CampaignManager__CampaignDoesNotExist();
error CampaignManager__TokenPoolAlreadyDefined();
error CampaignManager__NoTokenPoolIsDefined();

contract CampaignManager is AutomationCompatible, Ownable {
    /** State Variables */
    ICampaignFactory private campaignFactory;

    uint256 private fees;

    address private stableToken;
    address private tokenPool;

    bool private tokenPoolDefined;

    /** Events */

    event ContributorsUpdated(
        address indexed contributor,
        uint256 indexed amount,
        address indexed campaign
    );

    event CampaignsFinished(address[] indexed campaign);

    event FeesUpdated(uint256 newFee);

    /** Modifiers */
    modifier requireNonZeroAmount(uint256 _amount) {
        if (_amount == 0) {
            revert CampaignManager__AmountIsZero();
        }
        _;
    }

    modifier requireDefinedTokenPool() {
        if (tokenPool == address(0)) {
            revert CampaignManager__NoTokenPoolIsDefined();
        }
        _;
    }

    modifier campaignExists(address _campaignAddress) {
        address[] memory _deployedCampaigns = campaignFactory
            .getDeployedCampaignContracts();
        bool exists;
        for (uint256 i = 0; i < _deployedCampaigns.length; i++) {
            if (_deployedCampaigns[i] == _campaignAddress) {
                exists = true;
                break;
            }
        }
        if (exists == false) {
            revert CampaignManager__CampaignDoesNotExist();
        }
        _;
    }

    constructor(address _campaignFactory, address _stableTokenAddress) {
        campaignFactory = ICampaignFactory(_campaignFactory);
        stableToken = _stableTokenAddress;
    }

    /** Functions */

    /**
     * @dev -create a new Campaign for funding non-profit projects
     * @param _deadline - duration of the funding process
     * @param _minFund - minimum Amount of USD to fund the project successfully
     * @notice the msg.sender will be the submitter and will be funded, if the project funding proccess succeed
     */
    function createNewCampaign(uint256 _deadline, uint256 _minFund) external {
        campaignFactory.deployNewContract(
            _deadline,
            _minFund,
            msg.sender,
            stableToken
        );
    }

    /**
     * @dev - contribute the campaign with stableTokens
     * @param _amount - amount of stableTokens want to send
     * @param _campaignAddress - the address of the campaign contract want to contribute
     * @notice - the function caller have to approve a tokentransfer to the campaign address before calling this function
     */
    function contributeCampaign(uint256 _amount, address _campaignAddress)
        external
        requireNonZeroAmount(_amount)
        campaignExists(_campaignAddress)
    {
        ICampaign _campaign = ICampaign(_campaignAddress);

        //calculate the fees for the protocol
        uint256 _fees = calculateFees(_amount);

        _transferStableTokensToPool(_amount, _fees);

        _campaign.addContributor(msg.sender, _amount);

        emit ContributorsUpdated(msg.sender, _amount, _campaignAddress);
    }

    /** Automatisation Functions */

    /**
     * @dev - chainlink keeper checks if an action has to be performed. If a campaign has expired, the chainlink keeper calls performUpkeep in the next block.
     */
    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        // get all campaigns and check if the deadline has been reached
        address[] memory _campaigns = campaignFactory
            .getDeployedCampaignContracts();
        uint256 _counter;
        for (uint256 i = 0; i < _campaigns.length; i++) {
            ICampaign _campaign = ICampaign(_campaigns[i]);
            ICampaign.Status memory _status = _campaign.ViewStatus();

            if (block.timestamp >= _status.endDate) {
                _counter += 1;
            }
        }

        // initialize array of elements requiring increments as long as the increments
        address[] memory _finishedCampaigns = new address[](_counter);
        uint256 _arrayIncrement = 0;

        for (uint256 i = 0; i < _campaigns.length; i++) {
            ICampaign _campaign = ICampaign(_campaigns[i]);
            ICampaign.Status memory _status = _campaign.ViewStatus();

            if (block.timestamp >= _status.endDate) {
                upkeepNeeded = true;
                _finishedCampaigns[_arrayIncrement] = _campaigns[i];
                _arrayIncrement += 1;
            }
        }

        //save all update needed campaigns
        performData = abi.encode(_finishedCampaigns);

        return (upkeepNeeded, performData);
    }

    /**
     * @dev - function which is executed by the chainlink keeper. Anyone is able to execute the function
     * @param performData - array converted to bytes with all expired campaign addresses
     */
    function performUpkeep(bytes calldata performData) external override {
        address[] memory _finishedCampaigns = abi.decode(
            performData,
            (address[])
        );

        for (uint256 i = 0; i < _finishedCampaigns.length; i++) {
            ICampaign _campaign = ICampaign(_finishedCampaigns[i]);
            // TODO: Set the status of the campaign to finished and  transfer the ownership to the submitter

            uint256 _funds = _campaign.ViewTotalSupply();

            _transferTotalFundsToCampaign(_funds, _finishedCampaigns[i]);
        }
        emit CampaignsFinished(_finishedCampaigns);
    }

    function setTokenPoolAddress(address _newAddress) external onlyOwner {
        _isTokenPoolNotDefined();
        tokenPoolDefined = true;
        tokenPool = _newAddress;
    }

    function setFees(uint256 _newFees) external onlyOwner {
        fees = _newFees;

        emit FeesUpdated(fees);
    }

    /** Internal Functions */

    function _transferStableTokensToPool(uint256 _amount, uint256 _fees)
        internal
        requireDefinedTokenPool
    {
        //TODO: Transfer the tokens from user to CoinriseTokenPool
        ICoinriseTokenPool(tokenPool).transferStableTokensFromManager(
            _amount,
            _fees,
            msg.sender
        );
    }

    function _transferTotalFundsToCampaign(
        uint256 _amount,
        address _campaignAddress
    ) internal requireDefinedTokenPool {
        ICoinriseTokenPool(tokenPool).sendFundsToCampaignContract(
            _campaignAddress,
            _amount
        );
    }

    function _isTokenPoolNotDefined() internal view {
        if (tokenPoolDefined) {
            revert CampaignManager__TokenPoolAlreadyDefined();
        }
    }

    /** View / Pure Functions */

    function calculateFees(uint256 _amount)
        public
        view
        returns (uint256 _fees)
    {
        _fees = (_amount * fees) / 10000;

        return _fees;
    }

    function getFees() external view returns (uint256) {
        return fees;
    }
}
