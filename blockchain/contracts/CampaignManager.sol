//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "./Interfaces/ICampaignFactory.sol";
import "./Interfaces/ICampaign.sol";
import "./Interfaces/IERC20.sol";

error CampaignManager__AmountIsZero();
error CampaignManager__CampaignDoesNotExist();

contract CampaignManager is AutomationCompatible {
    /** State Variables */
    ICampaignFactory private campaignFactory;

    address private stableToken;

    /** Events */

    event ContributorsUpdated(
        address indexed contributor,
        uint256 indexed amount,
        address indexed campaign
    );

    /** Modifiers */
    modifier requireNonZeroAmount(uint256 _amount) {
        if (_amount == 0) {
            revert CampaignManager__AmountIsZero();
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

    function createNewCampaign(uint256 _deadline, uint256 _minFund) external {
        campaignFactory.deployNewContract(
            _deadline,
            _minFund,
            msg.sender,
            stableToken
        );
    }

    function contributeCampaign(uint256 _amount, address _campaignAddress)
        external
        requireNonZeroAmount(_amount)
        campaignExists(_campaignAddress)
    {
        ICampaign _campaign = ICampaign(_campaignAddress);

        require(
            IERC20(stableToken).transferFrom(
                msg.sender,
                _campaignAddress,
                _amount
            )
        );

        _campaign.addContributor(msg.sender, _amount);

        emit ContributorsUpdated(msg.sender, _amount, _campaignAddress);
    }

    /** Automatisation Functions */

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
            uint256 _deadline = _campaign.ViewDeadline();

            if (block.timestamp >= _deadline) {
                _counter += 1;
            }
        }

        // initialize array of elements requiring increments as long as the increments
        address[] memory _finishedCampaigns = new address[](_counter);
        uint256 _arrayIncrement = 0;

        for (uint256 i = 0; i < _campaigns.length; i++) {
            ICampaign _campaign = ICampaign(_campaigns[i]);
            uint256 _deadline = _campaign.ViewDeadline();

            if (block.timestamp >= _deadline) {
                upkeepNeeded = true;
                _finishedCampaigns[_arrayIncrement] = _campaigns[i];
                _arrayIncrement += 1;
            }
        }

        //save all update needed campaigns
        performData = abi.encode(_finishedCampaigns);

        return (upkeepNeeded, performData);
    }

    function performUpkeep(bytes calldata performData) external override {
        address[] memory _finishedCampaigns = abi.decode(
            performData,
            (address[])
        );

        for (uint256 i = 0; i < _finishedCampaigns.length; i++) {
            ICampaign _campaign = ICampaign(_finishedCampaigns[i]);

            // set the status
            _campaign.sendToSubmitter();
        }
    }
}
