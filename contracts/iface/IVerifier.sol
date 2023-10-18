// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./ITask.sol";

interface IVerifier {
    // An event that is fired when a verifier accepts a task
    event VerificationAccepted(uint256 taskId, uint256 verifierId);
    // An event that is fired when a verifier submits verification feedback.
    event VerificationSubmitted(uint256 taskId, uint256 verifierId, uint8 rating, string feedback);

    /**
     * Verifier accepts a task to verify.
     * @param task The task contract to accept for verification.
     * @return A boolean indicating whether the task was accepted for verification.
     */
    function acceptVerificationTask(ITask task) external returns (bool);

    /**
     * Submit verification feedback and rating for a completed task.
     * @param task The task contract being verified.
     * @param rating The rating given by the verifier (0-100).
     * @param feedback The feedback or comments on the task result.
     */
    function submitVerification(ITask task, uint256 _statusSlot, uint8 rating, string memory feedback) external;

    function paymentAddress() external view returns (address);

    function verifierId() external view returns (uint256);
}
