//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface ICampaign {
    event TokensTransfered(address to, uint256 amount);
    event SubmitterAddressChanged(address newAddress);
    event UpdateContributor(address contributor, uint256 amount);

    function initialize(
        uint256 _duration,
        address _submitter,
        address _token,
        uint256 _minAmount,
        string memory _campaignURI
    ) external;

    function addContributor(address _contributor, uint256 _amount) external;

    function updateSubmitterAddress(address _submitter) external;

    /**
     * @dev - the submitter can transfer after the campaign is finished the tokens to an address
     * @param _to - the address to receive the tokens
     * @param _amount - the number of tokens to be transferred
     */
    function transferStableTokens(address _to, uint256 _amount) external;

    /**
     * @dev - set the status of the campaign to finished
     */
    function finishFunding() external returns (bool successful);

    function updateCampaignURI(string memory _newURI) external;

    function setContributionToZero(address _contributor)
        external
        returns (uint256);

    /* ========== View Functions ========== */
    function getEndDate() external view returns (uint256);

    function getStartDate() external view returns (uint256);

    function getDuration() external view returns (uint256);

    function getSubmitter() external view returns (address);

    function isFundingActive() external view returns (bool);

    function getRemainingFundingTime() external view returns (uint256);

    function getContributor(address _contributor)
        external
        view
        returns (uint256);

    function getNumberOfContributor() external view returns (uint256);

    function getTotalSupply() external view returns (uint256);

    function getMinAmount() external view returns (uint256);

    function getCampaignURI() external view returns (string memory);
}
