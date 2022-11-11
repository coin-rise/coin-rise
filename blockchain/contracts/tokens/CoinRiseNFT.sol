// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

error CoinRiseNFT__TokenURIsNotFound();

contract CoinRiseNFT is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    AccessControl
{
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    Counters.Counter private _tokenIdCounter;

    address private managerContractAddress;

    string[] private tokenURIs;

    constructor() ERC721("CoinRiseNFT", "CRT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setRoles(address _managerContract)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _grantRole(MANAGER_ROLE, _managerContract);
    }

    function setMinterRole(address campaign) external onlyRole(MANAGER_ROLE) {
        _grantRole(MINTER_ROLE, campaign);
    }

    function safeMint(address to, uint256 uriId) public onlyRole(MINTER_ROLE) {
        if (uriId >= tokenURIs.length) {
            revert CoinRiseNFT__TokenURIsNotFound();
        }
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURIs[uriId]);
    }

    function setNewTokenURIs(string[] memory _tokenURIs)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        tokenURIs = _tokenURIs;
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
