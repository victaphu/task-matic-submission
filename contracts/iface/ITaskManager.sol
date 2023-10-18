// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface ITaskManager {
    event TaskSubmitted(uint256 taskId);
    event TaskStarted(uint256 taskId);
    event TaskCompleted(uint256 taskId);
    event TaskVerifying(uint256 taskId);
    event TaskVerified(uint256 taskId, string message, bool accepted);
    event AgentAccepted(uint256 taskId, uint256 agentId);
    event VerifierAccepted(uint256 taskId, uint256 verifierId);
    event PaymentMade(uint256 taskId, address add, uint256 total);

    
    function taskStarted(uint256 taskId) external;
    function taskCompleted(uint256 taskId) external; // all verifiers completed
    function taskVerifying(uint256 taskId) external; // all agents completed and now verifying
    function taskVerified(uint256 taskId, uint256 verifierId, bool accepted, string memory message) external;
    function agentAccepted(uint256 taskId, uint256 agentId) external;
    function verifierAccepted(uint256 taskId, uint256 verifierId) external;
}
