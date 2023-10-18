// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./iface/ITaskFactory.sol";
import "./iface/ITaskManager.sol";
import "./iface/ITask.sol";
import "./iface/IAgent.sol";
import "./iface/IVerifier.sol";
import "./iface/IERC20.sol";
import "./common/Utils.sol";

contract TaskManager is ITaskManager {
    address public owner; // The owner of the Task Manager contract
    IERC20 public paymentToken; // The ERC20 token used for payments
    ITaskFactory public taskFactory;

    mapping(address => uint256) public agentsRegistered;
    mapping(address => uint256) public verifiersRegistered;
    mapping(uint256 => Task) public tasks;
    mapping(uint256 => mapping(uint256 => bool)) private paymentMade;
    mapping(uint256 => mapping(uint256 => bool)) private verifierPaymentMade;
    mapping(address => bool) public whitelistWithdraw;

    uint256 public taskIdCounter = 1;

    struct Task {
        TaskStatus status;
        ITask task;
        uint256 taskId;
        address taskSubmitter;
        uint256 payment;
        uint256 verifierPayments;
    }

    constructor(address _paymentToken, address _taskFactory) {
        owner = msg.sender;
        paymentToken = IERC20(_paymentToken);
        taskFactory = ITaskFactory(_taskFactory);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    modifier onlyRegisteredAgent() {
        require(
            agentsRegistered[msg.sender] > 0,
            "Only registered agents can perform this action"
        );
        _;
    }

    modifier onlyRegisteredVerifier() {
        require(
            verifiersRegistered[msg.sender] > 0,
            "Only registered verifiers can perform this action"
        );
        _;
    }

    modifier taskExists(uint256 taskId) {
        require(tasks[taskId].status != TaskStatus.INIT, "Task does not exist");
        _;
    }

    // Register agents and verifiers
    function registerAgent(IAgent agent) external {
        agentsRegistered[address(agent)] = agent.agentId();
        whitelistWithdraw[agent.paymentAddress()] = true;
    }

    function registerVerifier(IVerifier verifier) external {
        verifiersRegistered[address(verifier)] = verifier.verifierId();
        whitelistWithdraw[verifier.paymentAddress()] = true;
    }

    function createTask(
        uint256 verifierFee,
        uint256 agentFee,
        uint256 maxAgents,
        uint256 maxVerifiers,
        string memory proposal
    ) external returns (ITask) {
        uint256 taskId = taskIdCounter++;
        ITask task = taskFactory.createTask(
            taskId,
            verifierFee,
            agentFee,
            maxAgents,
            maxVerifiers,
            address(this),
            proposal
        );
        submitTask(task, agentFee, verifierFee);
        return task;
    }

    // Submit a task
    function submitTask(
        ITask task,
        uint256 payment,
        uint256 verifierPayments
    ) internal {
        uint256 taskId = task.taskId();
        require(
            tasks[taskId].status == TaskStatus.INIT,
            "Task already submitted"
        );
        tasks[taskId] = Task({
            status: TaskStatus.STARTED,
            taskId: taskId,
            task: task,
            taskSubmitter: msg.sender,
            payment: payment,
            verifierPayments: verifierPayments
        });
        makePayment(payment + verifierPayments);
        emit TaskSubmitted(taskId);
    }

    function agentVerifiedResult(
        uint256 taskId,
        uint256 agentId
    ) public view returns (uint256) {
        ITask task = tasks[taskId].task;
        require(
            task.taskStatus() == TaskStatus.COMPLETED,
            "cannot withdraw if task status not complete"
        );
        require(
            task.agent(agentId) != address(0),
            "agent did not execute the task"
        );

        AgentProgress[] memory progress = task.agentProgress();
        uint256 successfulAgents = 0;
        uint256 totalBalance = task.agentFee();

        for (uint256 i = 0; i < progress.length; ++i) {
            // if (progress[i].agentId == agentId) {
            // Calculate the success ratio of the agent
            uint256 successRatio = (progress[i].verifierAccepted * 100) /
                (progress[i].verifierAccepted + progress[i].verifierRejected);

            // Check if the agent's success ratio is greater than or equal to 80
            if (successRatio >= 80) {
                successfulAgents++;
            } else {
                return 0; // Agent did not submit successfully
            }
            // }
        }

        if (successfulAgents == 0) {
            return 0; // No successful submissions by the agent
        }

        // Calculate and return the agent's share of the total balance
        return ((totalBalance * 1 ether) / successfulAgents) / 1 ether;
    }

    function agentWithdrawRequest(uint256 taskId, uint256 agentId) external {
        uint256 total = agentVerifiedResult(taskId, agentId);
        ITask task = tasks[taskId].task;
        require(
            total > 0,
            "No amount to withdraw, perhaps the task was rejected, please inspect results"
        );
        require(
            IAgent(task.agent(agentId)).paymentAddress() == msg.sender,
            "payment address not the same as agent settings"
        );
        require(paymentMade[taskId][agentId] == false, "Payment already made");
        require(
            paymentToken.transfer(msg.sender, total),
            "Failed to transfer payment"
        );
        paymentMade[taskId][agentId] = true;

        emit PaymentMade(taskId, msg.sender, total);
    }

    function verifierWithdrawRequest(
        uint256 taskId,
        uint256 verifierId
    ) external {
        ITask task = tasks[taskId].task;
        require(
            task.taskStatus() == TaskStatus.COMPLETED,
            "cannot withdraw if task status not complete"
        );
        require(
            task.verifier(verifierId) != address(0),
            "verifier not registered for given task"
        );
        require(
            IVerifier(task.verifier(verifierId)).paymentAddress() == msg.sender,
            "verifier not payment address for given task"
        );

        require(
            verifierPaymentMade[taskId][verifierId] == false,
            "Payment already made"
        );
        verifierPaymentMade[taskId][verifierId] = true;

        require(
            paymentToken.transfer(
                msg.sender,
                (tasks[taskId].verifierPayments * 1 ether) /
                    task.totalVerifierBids() /
                    1 ether
            ),
            "failed to transfer payment"
        );
    }

    // Payment handling, pay the token into this smart contract and then payout once done
    function makePayment(uint256 amount) private {
        require(
            paymentToken.transferFrom(msg.sender, address(this), amount),
            "Payment failed"
        );
    }

    // Task Manager functions
    function taskStarted(uint256 taskId) external override taskExists(taskId) {
        // Implement taskStarted logic
        emit TaskStarted(taskId);
        tasks[taskId].status = TaskStatus.STARTED;
    }

    function taskCompleted(
        uint256 taskId
    ) external override taskExists(taskId) {
        // payout to each agent
        emit TaskCompleted(taskId);
        tasks[taskId].status = TaskStatus.COMPLETED;
    }

    function taskVerifying(
        uint256 taskId
    ) external override taskExists(taskId) {
        // Implement taskVerifying logic
        emit TaskVerifying(taskId);
        tasks[taskId].status = TaskStatus.VERIFYING;
    }

    function taskVerified(
        uint256 taskId,
        uint256 verifierId,
        bool accepted,
        string memory message
    ) external override taskExists(taskId) {
        // Implement taskVerified logic
        emit TaskVerified(taskId, message, accepted);
        tasks[taskId].status = TaskStatus.VERIFYING;
    }

    function agentAccepted(
        uint256 taskId,
        uint256 agentId
    ) external override taskExists(taskId) {
        // Implement agentAccepted logic
        emit AgentAccepted(taskId, agentId);
    }

    function verifierAccepted(
        uint256 taskId,
        uint256 verifierId
    ) external override taskExists(taskId) {
        // Implement verifierAccepted logic
        emit VerifierAccepted(taskId, verifierId);
    }
}
