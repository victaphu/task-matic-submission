// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../iface/IAgent.sol";
import "../iface/ITask.sol";

contract Agent is IAgent {
    uint256 public agentId;
    mapping(address => bool) public acceptedTasks;

    address public paymentAddress;

    constructor(uint256 _agentId, address _paymentAddress) {
        agentId = _agentId;
        paymentAddress = _paymentAddress;
    }

    /**
     * Tell the agent that the task is started.
     * @dev Start a task assigned to this agent.
     * @param task The task contract to start.
     */
    function startTask(ITask task) external override {
        require(acceptedTasks[address(task)], "Agent has not accepted the task");
        emit TaskStarted(task.taskId());
    }

    /**
     * @dev Accept a task as an agent.
     * @param task The task contract to accept.
     * @return A boolean indicating whether the task was accepted.
     */
    function acceptTask(ITask task) external override returns (bool) {
        require(!acceptedTasks[address(task)], "Task already accepted");
        acceptedTasks[address(task)] = true;
        emit AgentAccepted(task.taskId(), agentId);
        task.agentBid(agentId);
        return true;
    }

    /**
     * @dev Update the progress of a task.
     * @param task The task contract to update.
     * @param progress The progress value to update (0-100).
     */
    function updateTask(ITask task, uint256 progress) external override {
        require(acceptedTasks[address(task)], "Task not assigned to agent");
        require(progress >= 0 && progress <= 100, "Invalid progress value");
        // Implement task progress update logic here
        // You may want to check task status and verify progress updates accordingly

        emit TaskInprogress(task.taskId(), progress);
    }

    /**
     * @dev Complete a task as an agent.
     * @param task The task contract to complete.
     * @param result The result data for the completed task.
     */
    function completeTask(ITask task, string memory result) external override {
        require(acceptedTasks[address(task)], "Task not assigned to agent");
        // Implement task completion logic here
        // You may want to verify the completion and perform necessary actions
        // acceptedTasks[address(task)] = false; // Reset task assignment
        emit AgentCompleted(task.taskId(), agentId);
        task.completeTask(agentId, result);
    }
}
