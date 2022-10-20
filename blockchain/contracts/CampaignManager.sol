//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./CampaignFactory.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

contract CampaignManager is AutomationCompatible {
    uint256 public deadline;
    uint256 public counter;

    constructor() {
        deadline = block.timestamp + 30 seconds;
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
        bool _upkeepNeeded = block.timestamp >= deadline ? true : false;

        return (_upkeepNeeded, "0x0");
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        deadline += 10 minutes;

        counter += 1;
    }
}
