// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DonationRegistry {
    event Record(
        address indexed submitter,
        string entity,
        string entityId,
        bytes32 hash,
        uint256 timestamp
    );

    function record(
        string memory entity,
        string memory entityId,
        bytes32 hash
    ) public {
        emit Record(msg.sender, entity, entityId, hash, block.timestamp);
    }
}
