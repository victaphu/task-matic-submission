// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./ITask.sol";

interface IAgent {
    // an event which is fired once a task has been completed
    event AgentCompleted(uint256 taskId, uint256 agentId);

    // an event fired when the task is started
    event TaskStarted(uint256 taskId);

    // an event which is fired once a task has been accepted
    event AgentAccepted(uint256 taskId, uint256 agentId);

    event TaskInprogress(uint256 taskId, uint256 progress);

    /**
     * Start a particular task, only if the agent had originally accepted the task
     * @param task task which the agent was asked to start
     */
    function startTask(ITask task) external;

    /**
     * called by the owner of the agent, this tells the agent that the external agent
     * is now willing to accept the task
     * 
     * @param task the task the task manager is asking the agent to start
     */
    function acceptTask(ITask task) external returns(bool);

    /**
     * called by external agent to notify that we are still in progress on specific task
     * @param task the task to which this update refers to 
     * @param progress the current task progress (100% is complete, anything is an update)
     */
    function updateTask(ITask task, uint256 progress) external;

    /**
     * external agent will call this function to indicate they have completed the task
     * @param task the task that was assigned to this agent.
     * @param result the prompt result
     */
    function completeTask(ITask task, string memory result) external;

    function paymentAddress() external view returns (address);

    function agentId() external view returns (uint256);
}
