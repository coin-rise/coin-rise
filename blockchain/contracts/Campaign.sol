//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Campaign is Initializable, Ownable {
    uint256 public deadline;
    uint256 public minFundAmount;
    uint256 public totalSupply;
    address public submitter;

    IERC20 token;

    struct Status {
        uint256 startDate; //starting date of the compaign in unix timestamp format
        uint256 endDate; //ending date of the compaign in unix timestamp format
        bool fundSent; //fund sent or not
    }

    Status public status;

    //keep track of supporters contribustion
    //mapping of supporters address to contribution;
    mapping(address => uint256) public contribution;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(uint256 _deadline, uint256 _minFundAmount, address _submitter, address _token)
        public
        initializer
    {
        deadline = _deadline;
        minFundAmount = _minFundAmount;
        submitter = _submitter;
        token = IERC20(_token);
        status.startDate = block.timestamp;
        status.endDate = status.startDate + _deadline;
        status.fundSent = false;
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
    function ViewContribustion(address _contributor) public view returns (uint256) {
        return contribution[_contributor];
    }

    /**
     * @dev keep track of supporters contribustion
     */
    function addContributor(address _contributor, uint256 _amount) public onlyOwner {
        require(_amount >= minFundAmount,"amount inferiour to the minimum amount");
        require(_contributor != address(0),"Invalid address");

        contribution[_contributor] = _amount;
        totalSupply += _amount;
    }

    /**
     * @dev update Submitter Address
     */
    function updateSubmitterAddress(address _submitter) public onlyOwner {
        require(_submitter != address(0),"Invalid address");

        submitter = _submitter;
    }

    /**
     * @dev send the collected funds to the submitter
     */
    function sendToSubmitter(address _to) public onlyOwner {
        require(status.fundSent == false,"fund has already been sent");

        token.transfer(_to, token.balanceOf(address(this)) );
        status.fundSent == true;
    }


}
