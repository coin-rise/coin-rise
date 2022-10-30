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

contract Campaign is Initializable, OwnableUpgradeable {
    uint256 public duration;
    uint256 public totalSupply;
    uint256 private startDate;
    uint256 private endDate;
    address public submitter;

    bool private fundingPhase;

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

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        uint256 _duration,
        address _submitter,
        address _token
    ) external initializer {
        duration = _duration;

        submitter = _submitter;
        token = IERC20(_token);
        startDate = block.timestamp;
        endDate = startDate + _duration;

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
    {
        require(_contributor != address(0), "Invalid address");
        if (fundingPhase == false) {
            revert Campaign__FundingFinished();
        }
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
    function finishFunding() external {
        if (block.timestamp >= endDate) {
            fundingPhase = false;
        } else {
            fundingPhase = true;
        }
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
}
