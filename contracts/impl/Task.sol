// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../iface/ITask.sol";
import "../common/Utils.sol";
import "../iface/ITaskManager.sol";
contract Task is ITask {
    // Contract state variables
    uint256 public totalVerifierBids;
    uint256 public totalAgentBids;
    uint256 public verifierFee;
    uint256 public agentFee;
    string public proposalText;
    uint256 public taskId;

    uint256 public maxAgents;
    uint256 public maxVerifiers;

    AgentProgress[] private agentStatus;

    mapping(uint256 => address) public verifiers;
    mapping(uint256 => address) public agents;
    mapping(uint256 => bool) public agentSubmitted;
    mapping(uint256 => bool) public verifierSubmitted;

    TaskStatus public taskStatus;
    ITaskManager public taskManager;

    // Constructor to initialize the contract
    constructor(
        uint256 _taskId,
        uint256 _verifierFee,
        uint256 _agentFee,
        uint256 _maxAgents,
        uint256 _maxVerifiers,
        address _taskManager,
        string memory _proposal
    ) {
        require(_maxAgents > 0 && _verifierFee > 0 && _agentFee > 0 && _maxVerifiers > 0, "Invalid configuration");
        require(_maxAgents < 10 && _maxVerifiers < 10, "No more than 10 verifiers or agents");
        verifierFee = _verifierFee;
        agentFee = _agentFee;
        proposalText = _proposal;
        maxAgents = _maxAgents;
        maxVerifiers = _maxVerifiers;
        taskId = _taskId;
        taskStatus = TaskStatus.INIT;
        taskManager = ITaskManager(_taskManager);
    }

    /**
     * @dev Get the proposal text for the task.
     * @return The proposal text as a string.
     */
    function proposal() external view override returns (string memory) {
        return proposalText;
    }

    /**
     * @dev Allow an agent to complete the task and submit the result.
     * @param _agentId The ID of the agent completing the task.
     * @param _data The result data provided by the agent.
     */
    function completeTask(
        uint256 _agentId,
        string memory _data
    ) external override {
        require(
            msg.sender == agents[_agentId],
            "Only the assigned agents can complete the task"
        );
        require(
            !agentSubmitted[_agentId], "Agent submitted already"
        );

        agentSubmitted[_agentId] = true;
        agentStatus.push(AgentProgress(AgentStatus.SUBMITTED, _agentId, _data, 0, 0));
        emit TaskUpdated(taskId, _agentId, _data);

        if (agentStatus.length >= totalAgentBids) {
            taskStatus = TaskStatus.VERIFYING;
            taskManager.taskVerifying(taskId);
            return;
        }
        taskStatus = TaskStatus.IN_PROGRESS;
    }

    /**
     * @dev Allow a verifier to verify the task result and provide a rating.
     * @param _verifierId The ID of the verifier providing the rating.
     * @param _statusSlot The index of the agent's progress in the array.
     * @param _data Verifier feedback data.
     * @param _rating The rating given by the verifier (0-100).
     */
    function taskVerified(
        uint256 _verifierId,
        uint256 _statusSlot,
        string memory _data,
        uint8 _rating
    ) external override {
        // Implement verification logic here
        require(taskStatus == TaskStatus.VERIFYING, "Not all agents submitted");
        require(_statusSlot < agentStatus.length, "Invalid task slot");
        require(
            _rating >= 0 && _rating <= 100,
            "Rating must be between 0 and 100"
        );
        require(verifiers[_verifierId] == msg.sender, "Not verifier");
        require(verifierSubmitted[_verifierId] == false, "Verifier already submitted");
        taskManager.taskVerified(taskId, _verifierId, _rating >= 85, _data);
        if (_rating < 85) {
            // Rejected task
            agentStatus[_statusSlot].verifierRejected++;
        }
        else {
            agentStatus[_statusSlot].verifierAccepted++;
        }
        emit VerifierUpdated(taskId, _verifierId, _rating >= 85, _data);

        bool allVerified = true;
        for (uint256 i = 0; i < agentStatus.length; ++i) {
            if (agentStatus[i].verifierRejected + agentStatus[i].verifierAccepted < maxVerifiers) {
                allVerified = false;
                break;
            }
        }

        if (allVerified) {
            emit TaskCompleted(taskId);
            taskStatus = TaskStatus.COMPLETED;
            taskManager.taskCompleted(taskId);
        }
    }

    /**
     * @dev Allow an agent to bid for the task.
     * @param agentId The ID of the agent bidding.
     */
    function agentBid(uint256 agentId) external override {
        require(totalAgentBids < maxAgents, "No more agent slots");
        require(taskStatus == TaskStatus.INIT, "Task already started");
        agents[agentId] = msg.sender;
        taskManager.agentAccepted(taskId, agentId);
        totalAgentBids++;
        if (totalAgentBids == maxAgents) {
            taskStatus = TaskStatus.STARTED;
            taskManager.taskStarted(taskId);
        }
        emit AgentAccepted(agentId);
    }

    /**
     * @dev Allow a verifier to bid for the task.
     * @param verifierId The ID of the verifier bidding.
     */
    function verifierBid(uint256 verifierId) external override {
        require(totalVerifierBids < maxVerifiers, "No more verifier slots");
        verifiers[verifierId] = msg.sender;
        totalVerifierBids++;
        taskManager.verifierAccepted(taskId, verifierId);
        emit VerifierAccepted(verifierId);
    }

    /**
     * @dev Start the task when an agent accepts it.
     */
    function acceptTask() external override {
        require(taskStatus == TaskStatus.INIT, "Task started already");
        require(totalAgentBids > 0, "Need at least 1 agent to start");
        
        emit TaskStarted(taskId);
        taskManager.taskStarted(taskId);
        taskStatus = TaskStatus.STARTED; // Force start
    }

    /**
     * @dev Get the address of a verifier by ID.
     * @param id The ID of the verifier.
     * @return _verifier The address of the verifier.
     */
    function verifier(uint256 id) external view override returns (address _verifier) {
        _verifier = verifiers[id];
    }

    /**
     * @dev Get the address of an agent by ID.
     * @param id The ID of the agent.
     * @return _agent The address of the agent.
     */
    function agent(uint256 id) external view override returns (address _agent) {
        _agent = agents[id];
    }
    
    /**
     * @dev Get the progress of agents in the task.
     * @return An array containing the progress of each agent.
     */
    function agentProgress() external view override returns (AgentProgress[] memory) {
        return agentStatus;
    }
}
