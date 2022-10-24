//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

contract Manager is AutomationCompatible {
    uint256 public counter;
    uint256 public endDate;

    uint256 constant INTERVAL = 15 minutes;

    event UpdateCounter(uint256 counter);

    constructor() {
        endDate = block.timestamp + INTERVAL;
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

        if (block.timestamp >= endDate) {
            _upkeepNeeded = true;
        }

        return (_upkeepNeeded, "0x0");
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        counter += 1;
        endDate = block.timestamp + INTERVAL;

        emit UpdateCounter(counter);
    }
}
