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
    uint256 public deadline;
    uint256 public minFundAmount;
    uint256 public totalSupply;
    address public submitter;

    IERC20 token;

    struct Status {
        uint256 startDate; //starting date of the compaign in unix timestamp format
        uint256 endDate; //ending date of the compaign in unix timestamp format
        bool fundSent; //fund sent or not
        bool fundingFinished;
    }

    Status public status;

    //keep track of supporters contribustion
    //mapping of supporters address to contribution;
    mapping(address => uint256) public contribution;
    address[] private contributorAddressList;

    event TokensTransfered(address to, uint256 amount);
    event SubmitterAddressChanged(address newAddress);

    modifier onlySubmitter() {
        if (msg.sender != submitter) {
            revert Campaign__NotTheSubmitter();
        }
        _;
    }

    modifier fundingFinished() {
        if (status.fundingFinished == false) {
            revert Campaign__FundingNotFinished();
        }
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        uint256 _deadline,
        uint256 _minFundAmount,
        address _submitter,
        address _token
    ) public initializer {
        deadline = _deadline;
        minFundAmount = _minFundAmount;
        submitter = _submitter;
        token = IERC20(_token);
        status.startDate = block.timestamp;
        status.endDate = status.startDate + _deadline;
        status.fundSent = false;
        status.fundingFinished = false;
        __Ownable_init();
    }

    /* ========== PUBLIC METHODS ========== */

    /**
     * @dev View the campaign deadline
     */
    function ViewDeadline() public view returns (uint256) {
        return deadline;
    }

    /**
     * @dev View the campaign totalSupply
     */
    function ViewTotalSupply() public view returns (uint256) {
        return totalSupply;
    }

    /**
     * @dev View the campaign status
     */
    function ViewStatus() public view returns (Status memory) {
        return status;
    }

    /**
     * @dev View the contributor contribustion
     */
    function ViewContribustion(address _contributor)
        public
        view
        returns (uint256)
    {
        return contribution[_contributor];
    }

    /**
     * @dev keep track of supporters contribustion
     */
    function addContributor(address _contributor, uint256 _amount)
        public
        onlyOwner
    {
        require(_contributor != address(0), "Invalid address");

        contribution[_contributor] = contribution[_contributor] + _amount;
        contributorAddressList.push(_contributor);
        totalSupply += _amount;
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
     * @dev send the collected funds to the submitter
     */
    function sendToSubmitter() public onlyOwner {
        require(status.fundSent == false, "fund has already been sent");
        require(
            block.timestamp >= status.endDate,
            "campaign date is not over yet"
        );

        if (totalSupply >= minFundAmount) {
            token.transfer(submitter, token.balanceOf(address(this)));
        } else {
            returnFunds();
        }
        status.fundSent = true;
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
    function finishFunding() external onlyOwner {
        if (status.fundingFinished) {
            revert Campaign__FundingFinished();
        }

        status.fundingFinished = true;
    }

    /* ========== INTERNAL METHODS ========== */

    /**
     * @dev return funds to contributors;
     */
    function returnFunds() internal {
        uint256 amount = 0;

        for (uint256 i = 0; i < contributorAddressList.length; i++) {
            amount = contribution[contributorAddressList[i]];
            token.transfer(contributorAddressList[i], amount);
            //To DO we should fund this contract to manage the gas fee
        }
    }
}
