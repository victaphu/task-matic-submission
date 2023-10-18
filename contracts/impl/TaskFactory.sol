// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../iface/ITask.sol";
import "../iface/ITaskFactory.sol";
import "../impl/Task.sol";

contract TaskFactory is ITaskFactory {
    function createTask(
        uint256 _taskId,
        uint256 _verifierFee,
        uint256 _agentFee,
        uint256 _maxAgents,
        uint256 _maxVerifiers,
        address _taskManager,
        string memory _proposal
    ) external returns(ITask) {
        return new Task(_taskId, _verifierFee, _agentFee, _maxAgents, _maxVerifiers, _taskManager, _proposal);
    }
}
