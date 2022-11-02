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

    address[] private activeCampaigns;

    /** Events */

    event ContributorsUpdated(
        address indexed contributor,
        uint256 indexed amount,
        address indexed campaign
    );

    event CampaignFinished(
        address indexed campaign,
        uint256 funds,
        bool successful
    );

    event TokenTransferedToContributor(
        address indexed contributor,
        uint256 indexed totalAmount
    );

    event NewCampaignCreated(address newCampaign, uint256 duration);

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
     * @param _minAmount - minimum number of tokens required for successful funding
     * @param _campaignURI - resource of the stored information of the campaign on IPFS
     * @notice the msg.sender will be the submitter and will be funded, if the project funding proccess succeed
     */
    function createNewCampaign(
        uint256 _deadline,
        uint256 _minAmount,
        string memory _campaignURI
    ) external {
        campaignFactory.deployNewContract(
            _deadline,
            msg.sender,
            stableToken,
            _minAmount,
            _campaignURI
        );

        address _newCampaign = campaignFactory.getLastDeployedCampaign();
        activeCampaigns.push(_newCampaign);

        emit NewCampaignCreated(_newCampaign, _deadline);
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

        // _transferStableTokensToPool(_amount, _fees, msg.sender);

        bool sent = IERC20(stableToken).transferFrom(
            msg.sender,
            address(this),
            _amount
        );

        if (sent) {
            //calculate the fees for the protocol
            uint256 _tokenBalance = IERC20(stableToken).balanceOf(
                address(this)
            );
            uint256 _fees = calculateFees(_tokenBalance);

            uint256 _campaignTokenAmount = _tokenBalance - _fees;

            IERC20(stableToken).transfer(tokenPool, _tokenBalance);

            ICoinRiseTokenPool(tokenPool).setNewTotalSupplies(
                _tokenBalance,
                _fees
            );

            _campaign.addContributor(msg.sender, _campaignTokenAmount);

            emit ContributorsUpdated(
                msg.sender,
                _campaignTokenAmount,
                _campaignAddress
            );
        }
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
        upkeepNeeded = false;

        uint256 counter = 0;
        for (uint256 i = 0; i < activeCampaigns.length; i++) {
            ICampaign _campaign = ICampaign(activeCampaigns[i]);
            uint256 _endDate = _campaign.getEndDate();
            bool _fundingActive = _campaign.isFundingActive();

            if (block.timestamp >= _endDate && _fundingActive) {
                upkeepNeeded = true;
                counter += 1;
            }
        }

        performData = abi.encode(counter);
        return (upkeepNeeded, performData);
    }

    /**
     * @dev - function which is executed by the chainlink keeper. Anyone is able to execute the function
     */
    function performUpkeep(bytes calldata performData) external override {
        uint256 _counter = abi.decode(performData, (uint256));

        address[] memory _newActiveCampaigns = new address[](
            activeCampaigns.length - _counter
        );
        uint256 _arrayIndex = 0;

        address[] memory _activeCampaigns = activeCampaigns;

        for (uint256 i = 0; i < _activeCampaigns.length; i++) {
            ICampaign _campaign = ICampaign(_activeCampaigns[i]);

            uint256 _endDate = _campaign.getEndDate();
            bool _fundingActive = _campaign.isFundingActive();

            if (block.timestamp >= _endDate && _fundingActive) {
                bool _successfulFunded = _campaign.finishFunding();

                uint256 _totalFunds = _campaign.getTotalSupply();
                if (_totalFunds > 0 && _successfulFunded) {
                    _transferTotalFundsToCampaign(
                        _totalFunds,
                        _activeCampaigns[i]
                    );
                } else {
                    _transferStableTokensToContributorPool(
                        _totalFunds,
                        _activeCampaigns[i]
                    );
                }

                emit CampaignFinished(
                    _activeCampaigns[i],
                    _totalFunds,
                    _successfulFunded
                );
            } else {
                _newActiveCampaigns[_arrayIndex] = _activeCampaigns[i];
                _arrayIndex += 1;
            }
        }

        activeCampaigns = _newActiveCampaigns;
    }

    function setTokenPoolAddress(address _newAddress) external onlyOwner {
        _isTokenPoolNotDefined();
        tokenPoolDefined = true;
        tokenPool = _newAddress;
    }

    function claimTokensFromUnsuccessfulCampaigns(
        address[] memory _campaignAddresses
    ) external {
        uint256 _totalAmount;

        for (uint256 index = 0; index < _campaignAddresses.length; index++) {
            uint256 _amount = ICampaign(_campaignAddresses[index])
                .setContributionToZero(msg.sender);

            _totalAmount += _amount;
        }

        _trasnferStableTokensToContributor(_totalAmount, msg.sender);
    }

    function setFees(uint256 _newFees) external onlyOwner {
        fees = _newFees;

        emit FeesUpdated(fees);
    }

    /** Internal Functions */

    function _transferStableTokensToContributorPool(
        uint256 _amount,
        address _campaignAddress
    ) internal requireDefinedTokenPool {
        ICoinRiseTokenPool(tokenPool).transferStableTokensToContributorPool(
            _amount,
            _campaignAddress
        );
    }

    function _trasnferStableTokensToContributor(uint256 _amount, address _to)
        internal
        requireDefinedTokenPool
    {
        ICoinRiseTokenPool(tokenPool).sendTokensToContributor(_amount, _to);
    }

    // function _transferStableTokensToPool(
    //     uint256 _amount,
    //     uint256 _fees,
    //     address _contributor
    // ) internal requireDefinedTokenPool {
    //     IERC20(stableToken).transferFrom()
    // }

    function _transferTotalFundsToCampaign(
        uint256 _amount,
        address _campaignAddress
    ) internal requireDefinedTokenPool {
        ICoinRiseTokenPool(tokenPool).sendFundsToCampaignContract(
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

    function getActiveCampaigns() external view returns (address[] memory) {
        return activeCampaigns;
    }

    function getStableTokenAddress() external view returns (address) {
        return stableToken;
    }
}
