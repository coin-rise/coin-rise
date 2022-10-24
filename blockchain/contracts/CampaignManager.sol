//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./CampaignFactory.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "./Interfaces/ICampaignFactory.sol";
import "./Interfaces/ICampaign.sol";

contract CampaignManager is AutomationCompatible {
    /** State Variables */
    ICampaignFactory private campaignFactory;

    /** Events */

    constructor(address _campaignFactory) {
        campaignFactory = ICampaignFactory(_campaignFactory);
    }

    /** Functions */

    function createNewCampaign(uint256 _deadline, uint256 _minFund) external {
        campaignFactory.deployNewContract(_deadline, _minFund);
    }

    /** Automatisation Functions */

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        bool _upkeepNeeded;

        // address[] memory _campaigns = campaignFactory
        //     .getDeployedCampaignContracts();

        // get all campaigns and check if the deadline has been reached

        return (_upkeepNeeded, "0x0");
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override {}
}
