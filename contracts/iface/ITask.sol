// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../common/Utils.sol";

interface ITask {
    event VerifierAccepted(uint256 verifier);
    event AgentAccepted(uint256 agent);
    event TaskStarted(uint256 task);
    event TaskCompleted(uint256 taskId);
    event TaskUpdated(uint256 taskId, uint256 agentId, string result);
    event VerifierUpdated(uint256 taskId, uint256 verfierId, bool success, string message);

    function taskId() external view returns(uint256);

    function agentProgress() external view returns(AgentProgress[] memory);
    /**
     * number of accepted bids for verifiers 
     */
    function totalVerifierBids() external view returns(uint256);

    /**
     * number of accepted bids for agents
     */
    function totalAgentBids() external view returns(uint256);

    /**
     * Max verifier fees split by all verifiers
     */
    function verifierFee() external view returns(uint256);

    /**
     * Max agent fees split by all agents
     */
    function agentFee() external view returns(uint256);
    
    /**
     * Prompt proposal
     */
    function proposal() external view returns(string memory);

    /**
     * 
     * @param agentId agent that completed the task
     * @param data the result of the task
     */
    function completeTask(uint256 agentId, string memory data) external;

    /**
     * 
     * @param verifierId verifier that checked this task
     * @param _statusSlot slot which task status review is for
     * @param data verifier feedback for task
     * @param rating rating out of 100 for task result based on prompt
     */
    function taskVerified(uint256 verifierId, uint256 _statusSlot, string memory data, uint8 rating) external;

    /**
     * Agent that accepts the bid
     */
    function agentBid(uint256 agentId) external;

    /**
     * Verifier that accepts the bid
     */
    function verifierBid(uint256 verifierId) external;

    /**
     * Task submitter accepts the task
     */
    function acceptTask() external;

    function verifier(uint256 id) external view returns(address);
    function agent(uint256 id) external view returns(address);

    function taskStatus() external view returns(TaskStatus);
}
