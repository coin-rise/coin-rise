//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

struct Status {
    uint256 startDate; //starting date of the compaign in unix timestamp format
    uint256 endDate; //ending date of the compaign in unix timestamp format
    bool fundSent; //fund sent or not
}

interface ICampaign {
    /**
     * @dev View the campaign deadline
     */
    function ViewDeadline() external view returns (uint256);

    /**
     * @dev View the campaign totalSupply
     */
    function ViewTotalSupply() external view returns (uint256);

    /**
     * @dev View the campaign status
     */
    function ViewStatus() external view returns (Status memory);

    /**
     * @dev View the contributor contribustion
     */
    function ViewContribustion(address _contributor)
        external
        view
        returns (uint256);

    /**
     * @dev keep track of supporters contribustion
     */
    function addContributor(address _contributor, uint256 _amount) external;

    /**
     * @dev update Submitter Address
     */
    function updateSubmitterAddress(address _submitter) external;

    /**
     * @dev send the collected funds to the submitter
     */
    function sendToSubmitter() external;
}
