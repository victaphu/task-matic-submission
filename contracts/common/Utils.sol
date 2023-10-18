// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

enum TaskStatus {
    INIT,
    STARTED,
    IN_PROGRESS,
    VERIFYING,
    COMPLETED
}

enum AgentStatus {
    INIT,
    IN_PROGRESS,
    SUBMITTED,
    ACCEPTED,
    REJECTED
}

struct AgentProgress {
    AgentStatus status;
    uint256 agentId;
    string responseData;
    uint256 verifierAccepted; // number of accepted verifiers
    uint256 verifierRejected; // number of rejected verifiers
}