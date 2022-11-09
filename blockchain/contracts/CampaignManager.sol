//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "./Interfaces/ICampaignFactory.sol";
import "./Interfaces/ICampaign.sol";
import "./Interfaces/IVoting.sol";
import "./Interfaces/ICoinRiseTokenPool.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error CampaignManager__AmountIsZero();
error CampaignManager__CampaignDoesNotExist();
error CampaignManager__TokenPoolAlreadyDefined();
error CampaignManager__NoTokenPoolIsDefined();
error CampaignManager__VotingContractAlreadyDefined();

contract CampaignManager is AutomationCompatible, Ownable {
    /* ====== State Variables ====== */

    ICampaignFactory private campaignFactory;

    uint256 private fees;

    address private stableToken;
    address private tokenPool;
    address private coinRiseTokenAddress;
    address private votingContractAddress;

    bool private tokenPoolDefined;
    bool private votingContractDefined;

    address[] private activeCampaigns;
    address[] private votableCampaigns;

    /* ====== Events ====== */

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

    /* ====== Modifiers ====== */

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

    /* ====== Functions ====== */

    constructor(
        address _campaignFactory,
        address _stableTokenAddress,
        address _coinRiseTokenAddress
    ) {
        campaignFactory = ICampaignFactory(_campaignFactory);
        stableToken = _stableTokenAddress;
        coinRiseTokenAddress = _coinRiseTokenAddress;
    }

    /**
     * @dev -create a new Campaign for funding non-profit projects without voting system
     * @param _deadline - duration of the funding process
     * @param _minAmount - minimum number of tokens required for successful funding
     * @param _campaignURI - resource of the stored information of the campaign on IPFS
     * @notice the msg.sender will be the submitter and will be funded, if the project funding proccess succeed
     */
    function createNewCampaign(
        uint256 _deadline,
        uint256 _minAmount,
        string memory _campaignURI,
        uint256[3] memory _tokenTiers
    ) public returns (address) {
        campaignFactory.deployNewContract(
            _deadline,
            msg.sender,
            stableToken,
            coinRiseTokenAddress,
            _minAmount,
            _campaignURI,
            _tokenTiers,
            false
        );

        address _newCampaign = campaignFactory.getLastDeployedCampaign();
        activeCampaigns.push(_newCampaign);

        emit NewCampaignCreated(_newCampaign, _deadline);

        return _newCampaign;
    }

    function createNewCampaignWithVoting(
        uint256 _deadline,
        uint256 _minAmount,
        string memory _campaignURI,
        uint256[3] memory _tokenTiers,
        uint256 _quorumPercentage
    ) external {
        address _newCampaign = _createNewCampaign(
            _deadline,
            _minAmount,
            _campaignURI,
            _tokenTiers,
            true
        );

        votableCampaigns.push(_newCampaign);

        IVoting(votingContractAddress).intializeCampaignVotingInformation(
            _quorumPercentage,
            _newCampaign
        );

        ICampaign(_newCampaign).updateVotingContractAddress(
            votingContractAddress
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

    /* ====== Automatisation Functions with ChainLink Keeper ====== */

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

        uint256 _campaignsWithFinishedRequests = 0;

        for (uint256 index = 0; index < votableCampaigns.length; index++) {
            uint256[] memory _infos = IVoting(votingContractAddress)
                .getFinishedRequestsFromCampaign(votableCampaigns[index]);
            if (_infos.length > 0) {
                _campaignsWithFinishedRequests++;
            }
        }

        address[]
            memory _campaignsAddressesWithFinishedRequests = new address[](
                _campaignsWithFinishedRequests
            );

        uint256 _arrayIndex;

        for (uint256 index = 0; index < votableCampaigns.length; index++) {
            uint256[] memory _infos = IVoting(votingContractAddress)
                .getFinishedRequestsFromCampaign(votableCampaigns[index]);
            if (_infos.length > 0) {
                _campaignsAddressesWithFinishedRequests[
                    _arrayIndex
                ] = votableCampaigns[index];
                _arrayIndex++;
            }
        }

        performData = abi.encode(
            counter,
            _campaignsAddressesWithFinishedRequests
        );
        return (upkeepNeeded, performData);
    }

    /**
     * @dev - function which is executed by the chainlink keeper. Anyone is able to execute the function
     */
    function performUpkeep(bytes calldata performData) external override {
        (
            uint256 _counter,
            address[] memory _campaignsWithFinishedRequests
        ) = abi.decode(performData, (uint256, address[]));

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
                    bool _voting = _campaign.isCampaignVotable();

                    if (_voting) {
                        _transferTotalFundsToCampaign(
                            _totalFunds,
                            _activeCampaigns[i]
                        );
                    } else {}
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

        for (
            uint256 index = 0;
            index < _campaignsWithFinishedRequests.length;
            index++
        ) {
            address _campaignAddress = _campaignsWithFinishedRequests[index];
            uint256[] memory _requestIds = IVoting(votingContractAddress)
                .getFinishedRequestsFromCampaign(_campaignAddress);

            if (_requestIds.length > 0) {
                for (
                    uint256 _requestIndex;
                    _requestIndex < _requestIds.length;
                    _requestIndex++
                ) {
                    IVoting.RequestInformation memory _info = IVoting(
                        votingContractAddress
                    ).getRequestInformation(
                            _campaignAddress,
                            _requestIds[_requestIndex]
                        );
                    if (_info.endDate <= block.timestamp) {
                        IVoting(votingContractAddress).executeRequest(
                            _requestIds[_requestIndex],
                            _campaignAddress
                        );
                    }
                }
            }
        }
    }

    /* ====== Functions for Setup the Contract ====== */

    function setFees(uint256 _newFees) external onlyOwner {
        fees = _newFees;

        emit FeesUpdated(fees);
    }

    function setTokenPoolAddress(address _newAddress) external onlyOwner {
        _isTokenPoolNotDefined();
        tokenPoolDefined = true;
        tokenPool = _newAddress;
    }

    function setVotingContractAddress(address _newAddress) external onlyOwner {
        _isVotingContractNotDefined();
        votingContractDefined = true;
        votingContractAddress = _newAddress;
    }

    /* ====== Internal Functions ====== */

    function _createNewCampaign(
        uint256 _deadline,
        uint256 _minAmount,
        string memory _campaignURI,
        uint256[3] memory _tokenTiers,
        bool _requestingPayouts
    ) public returns (address) {
        campaignFactory.deployNewContract(
            _deadline,
            msg.sender,
            stableToken,
            coinRiseTokenAddress,
            _minAmount,
            _campaignURI,
            _tokenTiers,
            _requestingPayouts
        );

        address _newCampaign = campaignFactory.getLastDeployedCampaign();
        activeCampaigns.push(_newCampaign);

        emit NewCampaignCreated(_newCampaign, _deadline);

        return _newCampaign;
    }

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

    function _transferTotalFundsToCampaign(
        uint256 _amount,
        address _campaignAddress
    ) internal requireDefinedTokenPool {
        ICoinRiseTokenPool(tokenPool).sendFundsToCampaignContract(
            _campaignAddress,
            _amount
        );
    }

    function _transferTotalFundsToSubmitter(
        uint256 _amount,
        address _submitter,
        address _campaignAddress
    ) internal {
        //TODO: Write a function in the coin rise token pool to send the funds directy to the submitter
    }

    function _executeFinishedRequest(address _campaign, uint256 requestId)
        internal
    {}

    function _isTokenPoolNotDefined() internal view {
        if (tokenPoolDefined) {
            revert CampaignManager__TokenPoolAlreadyDefined();
        }
    }

    function _isVotingContractNotDefined() internal view {
        if (votingContractDefined) {
            revert CampaignManager__VotingContractAlreadyDefined();
        }
    }

    /* ====== View / Pure Functions ====== */

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
