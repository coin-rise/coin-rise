// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Interfaces/ICampaign.sol";

error Voting_AmountExceedTotalSupply();
error Voting__NotTheManagerContract();
error Voting__InformationAlreadyInitialized();
error Voting__RequestNotVotable();

contract Voting {
    /* ====== Structures ====== */
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
        uint256 quorumPercentage;
        bool initialized;
    }

    /* ====== Variables ====== */
    mapping(address => mapping(uint256 => RequestInformation))
        private requestsFromCampaigns;

    mapping(address => VotingInformation) private campaignVotingInformations;

    mapping(address => mapping(uint256 => bool))
        private contributorVotedOnRequest;

    address private managerAddress;

    /* ====== Events ====== */
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

    /* ====== Modifiers ====== */

    modifier onlyManager() {
        if (msg.sender != managerAddress) {
            revert Voting__NotTheManagerContract();
        }
        _;
    }

    /* ====== Functions ====== */
    constructor(address _managerContractAddress) {
        managerAddress = _managerContractAddress;
    }

    function requestForTokenTransfer(
        address _to,
        uint256 _amount,
        uint256 _requestDuration
    ) external {
        uint256 _totalSupply = ICampaign(msg.sender).getTotalSupply();

        VotingInformation memory _info = campaignVotingInformations[msg.sender];

        if (_amount > _totalSupply - _info.totalRequestedAmount) {
            revert Voting_AmountExceedTotalSupply();
        }

        uint256 _endDate = _requestDuration;

        campaignVotingInformations[msg.sender].lastRequestId += 1;

        requestsFromCampaigns[msg.sender][
            campaignVotingInformations[msg.sender].lastRequestId
        ] = RequestInformation(_endDate, _amount, _to, 0, 0, 0, false, false);

        emit RequestSubmitted(
            msg.sender,
            campaignVotingInformations[msg.sender].lastRequestId,
            _to,
            _amount,
            _endDate
        );
    }

    function intializeCampaignVotingInformation(
        uint256 _quorumPercentage,
        address _campaignAddress
    ) external onlyManager {
        if (campaignVotingInformations[_campaignAddress].initialized) {
            revert Voting__InformationAlreadyInitialized();
        }

        campaignVotingInformations[_campaignAddress] = VotingInformation(
            0,
            0,
            _quorumPercentage,
            true
        );
    }

    /* ====== View / Pure Functions ====== */

    function getFinishedRequestsFromCampaign(address _campaignAddress)
        external
        view
        returns (RequestInformation[] memory)
    {
        uint256 _counter;

        for (
            uint256 index;
            index < campaignVotingInformations[_campaignAddress].lastRequestId;
            index++
        ) {
            RequestInformation memory _info = requestsFromCampaigns[
                _campaignAddress
            ][index];
            if (block.timestamp >= _info.endDate) {
                _counter++;
            }
        }

        RequestInformation[]
            memory _finishedRequests = new RequestInformation[](_counter);
        uint256 _arrayIndex = 0;

        for (
            uint256 index;
            index < campaignVotingInformations[_campaignAddress].lastRequestId;
            index++
        ) {
            RequestInformation memory _info = requestsFromCampaigns[
                _campaignAddress
            ][index];
            if (block.timestamp >= _info.endDate) {
                _finishedRequests[_arrayIndex] = _info;
                _arrayIndex++;
            }
        }

        return _finishedRequests;
    }

    function executeRequest(uint256 _requestId, address _campaignAddress)
        external
        onlyManager
    {}

    function voteOnRequest(
        address _contributor,
        uint256 _requestId,
        bool _approve
    ) external {
        address _campaign = msg.sender;

        RequestInformation memory _requestInfo = requestsFromCampaigns[
            _campaign
        ][_requestId];

        bool _votable = _isRequestVotable(
            _requestInfo,
            _contributor,
            _requestId
        );
        if (!_votable) {
            revert Voting__RequestNotVotable();
        }

        requestsFromCampaigns[_campaign][_requestId].totalVotes++;

        if (_approve) {
            requestsFromCampaigns[_campaign][_requestId].yesVotes++;
        } else {
            requestsFromCampaigns[_campaign][_requestId].noVotes++;
        }

        contributorVotedOnRequest[_contributor][_requestId] = true;

        emit RequestVotesUpdated(
            requestsFromCampaigns[_campaign][_requestId].totalVotes,
            requestsFromCampaigns[_campaign][_requestId].yesVotes,
            requestsFromCampaigns[_campaign][_requestId].noVotes,
            _contributor
        );
    }

    function _isRequestVotable(
        RequestInformation memory _info,
        address _contributor,
        uint256 _requestId
    ) internal view returns (bool) {
        if (
            !_info.approved &&
            !_info.executed &&
            block.timestamp >= _info.endDate &&
            !contributorVotedOnRequest[_contributor][_requestId]
        ) {
            return true;
        }

        return false;
    }
}
