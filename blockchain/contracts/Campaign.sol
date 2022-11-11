//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./tokens/CoinRiseNFT.sol";
import "./Interfaces/IVoting.sol";

error Campaign__NotTheSubmitter();
error Campaign_TokenAmountIsZero();
error Campaign__AddressIsZeroAddress();
error Campaign__FundingFinished();
error Campaign__FundingNotFinished();
error Campaign_AmountExceedTotalSupply();
error Campaign__NotSuccessfulFunded();
error Campaign_SuccessfulFunded();
error Campaign__PayoutsNeedSuccessfulApproved();
error Campaign__SenderIsNotContributor();
error Campaign__SenderIsNotVotingContract();
error Campaign__TokenTiersNotAccepted();

contract Campaign is Initializable, OwnableUpgradeable {
    enum TokenTier {
        bronze,
        silver,
        gold
    }

    struct ContributorInfo {
        TokenTier tier;
        uint256 contributionAmount;
        bool tokenMinted;
        bool allowableToMint;
    }

    /* ====== State Variables ====== */

    uint256 private duration;
    uint256 private totalSupply;
    uint256 private startDate;
    uint256 private endDate;
    uint256 private minAmount;
    bool private requestingPayouts;

    address private submitter;
    string private campaignURI;

    bool private fundingPhase;
    bool private successfulFunded;

    address private votingContractAddress;

    uint256[] private tokenTiers = new uint256[](3);

    CoinRiseNFT coinRiseToken;
    IERC20 token;

    //keep track of supporters contribustion
    //mapping of supporters address to contribution;
    mapping(address => ContributorInfo) public contributors;
    uint256 private numContributors;

    /* ====== Events ====== */

    event TokensTransfered(address to, uint256 amount);
    event SubmitterAddressChanged(address newAddress);
    event UpdateContributor(
        address contributor,
        uint256 amount,
        TokenTier tier
    );

    /* ====== Modifier ====== */

    modifier onlySubmitter() {
        if (msg.sender != submitter) {
            revert Campaign__NotTheSubmitter();
        }
        _;
    }

    modifier onlyContributor() {
        uint256 _contribution = contributors[msg.sender].contributionAmount;
        if (_contribution == 0) {
            revert Campaign__SenderIsNotContributor();
        }
        _;
    }

    modifier fundingFinished() {
        if (fundingPhase == true) {
            revert Campaign__FundingNotFinished();
        }
        _;
    }

    modifier fundingNotFinished() {
        if (fundingPhase == false) {
            revert Campaign__FundingFinished();
        }
        _;
    }

    modifier isSuccessfulFunded() {
        if (successfulFunded == false) {
            revert Campaign__NotSuccessfulFunded();
        }
        _;
    }

    modifier notSuccessfulFunded() {
        if (successfulFunded) {
            revert Campaign_SuccessfulFunded();
        }
        _;
    }

    modifier isVotingContract() {
        if (msg.sender != votingContractAddress) {
            revert Campaign__SenderIsNotVotingContract();
        }
        _;
    }

    /* ====== Functions ====== */

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev - function has to be called after the contract was cloned
     * @param _duration - the duration of the campaign until it's finished
     * @param _submitter - the address of the campaign submitter
     * @param _token - the address of the used stable token
     * @param _coinRiseToken - the address of the NFT tokens for the contributors
     * @param _minAmount -
     * @param _campaignURI -
     * @param _tokenTiers -
     * @param _requestingPayouts -
     */
    function initialize(
        uint256 _duration,
        address _submitter,
        address _token,
        address _coinRiseToken,
        uint256 _minAmount,
        string memory _campaignURI,
        uint256[3] memory _tokenTiers,
        bool _requestingPayouts
    ) external initializer {
        bool _tiersChecked = checkForAccepatbleTokenTiers(_tokenTiers);

        if (!_tiersChecked) {
            revert Campaign__TokenTiersNotAccepted();
        }
        duration = _duration;

        submitter = _submitter;

        token = IERC20(_token);
        startDate = block.timestamp;
        endDate = startDate + _duration;
        minAmount = _minAmount;
        campaignURI = _campaignURI;

        fundingPhase = true;
        requestingPayouts = _requestingPayouts;

        coinRiseToken = CoinRiseNFT(_coinRiseToken);

        _initializeTokenTiers(_tokenTiers);
        __Ownable_init();
    }

    /**
     * @dev - transfer the tokens to a receiver address
     * @notice - only possible to call this function in a voting campaign
     * @param _to - the address of the tokens receiver
     * @param _amount - the amount of tokens to send
     */
    function transferStableTokensAfterRequest(address _to, uint256 _amount)
        external
        isSuccessfulFunded
        fundingFinished
        isVotingContract
    {
        _transferStableTokens(_to, _amount, true);
    }

    function transferStableTokensWithRequest(
        address _to,
        uint256 _amount,
        uint256 _requestDuration,
        string memory _storedInformation
    ) external onlySubmitter isSuccessfulFunded fundingFinished {
        IVoting(votingContractAddress).requestForTokenTransfer(
            _to,
            _amount,
            _requestDuration,
            _storedInformation
        );
    }

    function voteOnTransferRequest(uint256 _requestId, bool _approve)
        external
        onlyContributor
    {
        IVoting(votingContractAddress).voteOnRequest(
            msg.sender,
            _requestId,
            _approve
        );
    }

    function mintCampaignNFT()
        external
        onlyContributor
        isSuccessfulFunded
        fundingFinished
    {
        ContributorInfo memory _info = contributors[msg.sender];
        (TokenTier _tier, bool _allowable) = checkForTokenTier(
            _info.contributionAmount
        );

        if (_allowable) {
            contributors[msg.sender].tier = _tier;
            contributors[msg.sender].allowableToMint = true;

            coinRiseToken.safeMint(msg.sender, uint256(_info.tier));
        }
    }

    /**
     * @dev - set the status of the campaign to finished
     */
    function finishFunding() external returns (bool successful) {
        if (block.timestamp >= endDate) {
            fundingPhase = false;
        } else {
            fundingPhase = true;
        }

        if (totalSupply < minAmount) {
            successfulFunded = false;
            successful = false;
        } else {
            successfulFunded = true;
            successful = true;
        }
    }

    /* ========== Functions CampaignManager ========== */

    /**
     * @dev keep track of supporters contribustion
     */
    function addContributor(address _contributor, uint256 _amount)
        external
        onlyOwner
        fundingNotFinished
    {
        require(_contributor != address(0), "Invalid address");

        contributors[_contributor].contributionAmount =
            contributors[_contributor].contributionAmount +
            _amount;

        (TokenTier _tier, bool _allowable) = checkForTokenTier(
            contributors[_contributor].contributionAmount
        );

        contributors[_contributor].allowableToMint = _allowable;
        contributors[_contributor].tier = _tier;

        numContributors += 1;

        totalSupply += _amount;

        emit UpdateContributor(
            _contributor,
            contributors[_contributor].contributionAmount,
            _tier
        );
    }

    /**
     * @dev update Submitter Address
     */
    function updateSubmitterAddress(address _submitter) public onlyOwner {
        require(_submitter != address(0), "Invalid address");

        submitter = _submitter;

        emit SubmitterAddressChanged(_submitter);
    }

    function setContributionToZero(address _contributor)
        external
        onlyOwner
        fundingFinished
        notSuccessfulFunded
        returns (uint256)
    {
        uint256 _contributedAmount = contributors[_contributor]
            .contributionAmount;
        contributors[_contributor].contributionAmount = 0;

        return _contributedAmount;
    }

    function updateCampaignURI(string memory _newURI)
        external
        onlyOwner
        fundingNotFinished
    {
        campaignURI = _newURI;
    }

    function updateVotingContractAddress(address _newAddress)
        external
        onlyOwner
    {
        votingContractAddress = _newAddress;
    }

    /* ========== Internal Functions ========= */

    function _initializeTokenTiers(uint256[3] memory _tokenTiers) internal {
        tokenTiers = _tokenTiers;
    }

    function _transferStableTokens(
        address _to,
        uint256 _amount,
        bool _voting
    ) internal {
        if (_amount == 0) {
            revert Campaign_TokenAmountIsZero();
        }
        if (_to == address(0)) {
            revert Campaign__AddressIsZeroAddress();
        }

        if (requestingPayouts && !_voting) {
            revert Campaign__PayoutsNeedSuccessfulApproved();
        }

        uint256 _totalSupply = totalSupply;

        if (_totalSupply < _amount) {
            revert Campaign_AmountExceedTotalSupply();
        }

        require(token.transfer(_to, _amount));

        totalSupply -= _amount;

        emit TokensTransfered(_to, _amount);
    }

    /* ========== View Functions ========== */

    function checkForAccepatbleTokenTiers(uint256[3] memory _tokenTiers)
        public
        pure
        returns (bool)
    {
        if (_tokenTiers[1] < _tokenTiers[0]) {
            return false;
        } else {
            if (_tokenTiers[2] < _tokenTiers[1]) {
                return false;
            } else {
                return true;
            }
        }
    }

    function checkForTokenTier(uint256 _amount)
        public
        view
        returns (TokenTier, bool)
    {
        TokenTier _tier;
        bool _allowable;
        if (_amount >= tokenTiers[1]) {
            if (_amount >= tokenTiers[2]) {
                _tier = TokenTier.gold;
            } else {
                _tier = TokenTier.silver;
            }
            _allowable = true;
        } else {
            if (_amount >= tokenTiers[0]) {
                _tier = TokenTier.bronze;
                _allowable = true;
            } else {
                _allowable = false;
            }
        }

        return (_tier, _allowable);
    }

    function getEndDate() external view returns (uint256) {
        return endDate;
    }

    function getStartDate() external view returns (uint256) {
        return startDate;
    }

    function getDuration() external view returns (uint256) {
        return duration;
    }

    function getSubmitter() external view returns (address) {
        return submitter;
    }

    function isFundingActive() external view returns (bool) {
        return fundingPhase;
    }

    function getRemainingFundingTime() external view returns (uint256) {
        uint256 _remainingTime = endDate > block.timestamp
            ? endDate - block.timestamp
            : 0;
        return _remainingTime;
    }

    function getContributor(address _contributor)
        external
        view
        returns (uint256)
    {
        return contributors[_contributor].contributionAmount;
    }

    function getNumberOfContributor() external view returns (uint256) {
        return numContributors;
    }

    function getTotalSupply() external view returns (uint256) {
        return totalSupply;
    }

    function getMinAmount() external view returns (uint256) {
        return minAmount;
    }

    function getCampaignURI() external view returns (string memory) {
        return campaignURI;
    }

    function getFundingStatus() external view returns (bool) {
        return successfulFunded;
    }

    function getTokenTiers() external view returns (uint256[] memory) {
        return tokenTiers;
    }

    function isCampaignVotable() external view returns (bool) {
        return requestingPayouts;
    }

    function getVotingContractAddress() external view returns (address) {
        return votingContractAddress;
    }

    function getContributorInfo(address _contributor)
        external
        view
        returns (ContributorInfo memory)
    {
        return contributors[_contributor];
    }

    function getAllRequests()
        external
        view
        returns (IVoting.RequestInformation[] memory)
    {
        IVoting.VotingInformation memory _campaignInfo = IVoting(
            votingContractAddress
        ).getVotingInformation(address(this));

        uint256 _numRequests = _campaignInfo.totalRequests;
        IVoting.RequestInformation[]
            memory _requests = new IVoting.RequestInformation[](_numRequests);

        for (uint256 index = 1; index <= _numRequests; index++) {
            IVoting.RequestInformation memory _info = IVoting(
                votingContractAddress
            ).getRequestInformation(address(this), index);

            _requests[index - 1] = _info;
        }

        return _requests;
    }
}
