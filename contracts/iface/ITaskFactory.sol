// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./ITask.sol";

interface ITaskFactory {
    function createTask(
        uint256 _taskId,
        uint256 _verifierFee,
        uint256 _agentFee,
        uint256 _maxAgents,
        uint256 _maxVerifiers,
        address _taskManager,
        string memory _proposal
    ) external returns(ITask);
}
