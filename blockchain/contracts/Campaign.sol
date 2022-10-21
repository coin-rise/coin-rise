//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol"; 
import "@openzeppelin/contracts/access/Ownable.sol";
import "./swap.sol";
contract Campaign is Initializable, Ownable, SwapExamples {
    uint256 public deadline;
    uint256 public MinFund ;
    uint256 public total_supply;

    struct Status {
        uint256 start_date;         //starting date of the compaign in unix timestamp format
        uint256 end_date;           //ending date of the compaign in unix timestamp format
        
        bool fund_sent;             //fund sent or not
    }

    Status public status;

    //keep track of supporters contribustion
    //mapping of supporters address to contribution;
    mapping(address => uint) public contribution;
    
    function initialize(uint256 _deadline,  uint256 _MinFund) public initializer {
        deadline = _deadline;
        MinFund = _MinFund;
        status.start_date = block.timestamp;
        status.end_date = status.start_date + _deadline;
        status.fund_sent = false;
    }

}
