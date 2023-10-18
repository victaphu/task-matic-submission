// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../iface/ITask.sol";
import "../iface/IVerifier.sol";

contract Verifier is IVerifier {
    uint256 public verifierId;
    mapping(address => bool) public acceptedTasks;
    address public paymentAddress;

    constructor(uint256 _verifierId, address _paymentAddress) {
        verifierId = _verifierId;
        paymentAddress = _paymentAddress;
    }

    /**
     * @dev Verifier accepts a task for verification.
     * @param task The task contract to accept for verification.
     * @return A boolean indicating whether the task was accepted for verification.
     */
    function acceptVerificationTask(ITask task) external override returns (bool) {
        require(!acceptedTasks[address(task)], "Task already accepted for verification");
        acceptedTasks[address(task)] = true;
        emit VerificationAccepted(task.taskId(), verifierId);
        task.verifierBid(verifierId);
        return true;
    }

    /**
     * @dev Submit verification feedback and rating for a completed task.
     * @param task The task contract being verified.
     * @param _statusSlot The slot of the task that's being verified
     * @param rating The rating given by the verifier (0-100).
     * @param feedback The feedback or comments on the task result.
     */
    function submitVerification(ITask task, uint256 _statusSlot, uint8 rating, string memory feedback) external override {
        require(acceptedTasks[address(task)], "Task not accepted for verification");
        require(rating >= 0 && rating <= 100, "Invalid rating value");
        task.taskVerified(verifierId, _statusSlot, feedback, rating);
        // Implement task verification logic here
        // You may want to check the task status and perform necessary actions based on the rating and feedback
        // acceptedTasks[address(task)] = false; // Reset task assignment
        emit VerificationSubmitted(task.taskId(), verifierId, rating, feedback);
    }
}
