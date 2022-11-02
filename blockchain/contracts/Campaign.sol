//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error Campaign__NotTheSubmitter();
error Campaign_TokenAmountIsZero();
error Campaign__AddressIsZeroAddress();
error Campaign__FundingFinished();
error Campaign__FundingNotFinished();
error Campaign_AmountExceedTotalSupply();
error Campaign__NotSuccessfulFunded();
error Campaign_SuccessfulFunded();

contract Campaign is Initializable, OwnableUpgradeable {
    uint256 public duration;
    uint256 public totalSupply;
    uint256 private startDate;
    uint256 private endDate;
    uint256 private minAmount;
    address public submitter;

    string private campaignURI;

    bool private fundingPhase;
    bool private successfulFunded;

    IERC20 token;

    //keep track of supporters contribustion
    //mapping of supporters address to contribution;
    mapping(address => uint256) public contributor;
    uint256 private numContributors;

    event TokensTransfered(address to, uint256 amount);
    event SubmitterAddressChanged(address newAddress);
    event UpdateContributor(address contributor, uint256 amount);

    modifier onlySubmitter() {
        if (msg.sender != submitter) {
            revert Campaign__NotTheSubmitter();
        }
        _;
    }

    modifier fundingFinished() {
        if (fundingPhase == true) {
            revert Campaign__FundingNotFinished();
        }
        _;
    }

    modifier fundingNotFinished() {
        if (fundingPhase == false) {
            revert Campaign__FundingFinished();
        }
        _;
    }

    modifier isSuccessfulFunded() {
        if (successfulFunded == false) {
            revert Campaign__NotSuccessfulFunded();
        }
        _;
    }

    modifier notSuccessfulFunded() {
        if (successfulFunded) {
            revert Campaign_SuccessfulFunded();
        }
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        uint256 _duration,
        address _submitter,
        address _token,
        uint256 _minAmount,
        string memory _campaignURI
    ) external initializer {
        duration = _duration;

        submitter = _submitter;
        token = IERC20(_token);
        startDate = block.timestamp;
        endDate = startDate + _duration;
        minAmount = _minAmount;
        campaignURI = _campaignURI;

        fundingPhase = true;
        __Ownable_init();
    }

    /* ========== PUBLIC METHODS ========== */

    /**
     * @dev keep track of supporters contribustion
     */
    function addContributor(address _contributor, uint256 _amount)
        external
        onlyOwner
        fundingNotFinished
    {
        require(_contributor != address(0), "Invalid address");

        contributor[_contributor] = contributor[_contributor] + _amount;

        numContributors += 1;

        totalSupply += _amount;

        emit UpdateContributor(_contributor, contributor[_contributor]);
    }

    /**
     * @dev update Submitter Address
     */
    function updateSubmitterAddress(address _submitter) public onlyOwner {
        require(_submitter != address(0), "Invalid address");

        submitter = _submitter;

        emit SubmitterAddressChanged(_submitter);
    }

    /**
     * @dev - the submitter can transfer after the campaign is finished the tokens to an address
     * @param _to - the address to receive the tokens
     * @param _amount - the number of tokens to be transferred
     */
    function transferStableTokens(address _to, uint256 _amount)
        external
        onlySubmitter
        fundingFinished
        isSuccessfulFunded
    {
        if (_amount == 0) {
            revert Campaign_TokenAmountIsZero();
        }
        if (_to == address(0)) {
            revert Campaign__AddressIsZeroAddress();
        }

        uint256 _totalSupply = totalSupply;

        if (_totalSupply < _amount) {
            revert Campaign_AmountExceedTotalSupply();
        }

        require(token.transfer(_to, _amount));

        totalSupply -= _amount;

        emit TokensTransfered(_to, _amount);
    }

    /**
     * @dev - set the status of the campaign to finished
     */
    function finishFunding() external returns (bool successful) {
        if (block.timestamp >= endDate) {
            fundingPhase = false;
        } else {
            fundingPhase = true;
        }

        if (totalSupply < minAmount) {
            successfulFunded = false;
            successful = false;
        } else {
            successfulFunded = true;
            successful = true;
        }
    }

    function setContributionToZero(address _contributor)
        external
        onlyOwner
        fundingFinished
        notSuccessfulFunded
        returns (uint256)
    {
        uint256 _contributedAmount = contributor[_contributor];
        contributor[_contributor] = 0;

        return _contributedAmount;
    }

    function updateCampaignURI(string memory _newURI)
        external
        onlyOwner
        fundingNotFinished
    {
        campaignURI = _newURI;
    }

    /* ========== View Functions ========== */
    function getEndDate() external view returns (uint256) {
        return endDate;
    }

    function getStartDate() external view returns (uint256) {
        return startDate;
    }

    function getDuration() external view returns (uint256) {
        return duration;
    }

    function getSubmitter() external view returns (address) {
        return submitter;
    }

    function isFundingActive() external view returns (bool) {
        return fundingPhase;
    }

    function getRemainingFundingTime() external view returns (uint256) {
        uint256 _remainingTime = endDate > block.timestamp
            ? endDate - block.timestamp
            : 0;
        return _remainingTime;
    }

    function getContributor(address _contributor)
        external
        view
        returns (uint256)
    {
        return contributor[_contributor];
    }

    function getNumberOfContributor() external view returns (uint256) {
        return numContributors;
    }

    function getTotalSupply() external view returns (uint256) {
        return totalSupply;
    }

    function getMinAmount() external view returns (uint256) {
        return minAmount;
    }

    function getCampaignURI() external view returns (string memory) {
        return campaignURI;
    }

    function getFundingStatus() external view returns (bool) {
        return successfulFunded;
    }
}
