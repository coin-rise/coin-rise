//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Campaign is Initializable, Ownable {
    uint256 public deadline;
    uint256 public minFund;
    uint256 public totalSupply;

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

    function initialize(uint256 _deadline, uint256 _minFund)
        public
        initializer
    {
        deadline = _deadline;
        minFund = _minFund;
        status.startDate = block.timestamp;
        status.endDate = status.startDate + _deadline;
        status.fundSent = false;
    }
}
