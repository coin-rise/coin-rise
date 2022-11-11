// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface ICoinRiseNFT {
    function setRoles(address _managerContract) external;

    function setMinterRole(address campaign) external;

    function safeMint(address to, uint256 uriId) external;

    function setNewTokenURIs(string[] memory _tokenURIs) external;
}
