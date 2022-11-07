//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IVoting {
    struct RequestInformation {
        uint256 endDate;
        uint256 tokenAmount;
        address to;
        uint256 totalVotes;
        uint256 yesVotes;
        uint256 noVotes;
        bool approved;
        bool executed;
    }

    struct VotingInformation {
        uint256 lastRequestId;
        uint256 totalRequestedAmount;
        uint256 totalRequests;
        uint256 quorumPercentage;
        bool initialized;
    }

    event RequestSubmitted(
        address campaign,
        uint256 requestId,
        address to,
        uint256 amount,
        uint256 requestEndDate
    );

    event RequestVotesUpdated(
        uint256 totalVotes,
        uint256 yesVotes,
        uint256 noVotes,
        address lastVoter
    );

    function requestForTokenTransfer(
        address _to,
        uint256 _amount,
        uint256 _requestDuration
    ) external;

    function intializeCampaignVotingInformation(
        uint256 _quorumPercentage,
        address _campaignAddress
    ) external;

    function voteOnRequest(
        address _contributor,
        uint256 _requestId,
        bool _approve
    ) external;

    function executeRequest(uint256 _requestId, address _campaignAddress)
        external
        returns (bool approved);

    function getVotingInformation(address _campaignAddress)
        external
        view
        returns (VotingInformation memory);

    function getRequestInformation(address _campaignAddress, uint256 _requestId)
        external
        view
        returns (RequestInformation memory);

    function getFinishedRequestsFromCampaign(address _campaignAddress)
        external
        view
        returns (uint256[] memory);
}
