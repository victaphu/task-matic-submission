// Import Hardhat modules
const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");

describe("TaskManager", function () {
  let TaskManager;
  let taskManager;
  let MockERC20;
  let mockERC20;
  let MockTaskFactory;
  let mockTaskFactory;
  let MockTask;
  let mockTask;
  let MockAgent;
  let mockAgent;
  let MockVerifier;
  let mockVerifier;
  let accounts;
  let ownerAddress = "0xOwnerAddress"; // Replace with an actual address
  let agentAddress = "0xAgentAddress"; // Replace with an actual address
  let verifierAddress = "0xVerifierAddress"; // Replace with an actual address
  const verifierFee = 100; // Replace with desired fee values
  const agentFee = 50;
  const maxAgents = 1;
  const maxVerifiers = 1;
  const proposal = "Task Proposal Text";

  before(async function () {
    // Get test accounts
    accounts = await ethers.getSigners();
    let mockAgentPaymentAddress = accounts[1].address;
    let mockVerifierPaymentAddress = accounts[2].address;

    // Deploy MockERC20
    MockERC20 = await ethers.getContractFactory("MockERC20");
    mockERC20 = await MockERC20.deploy("MockToken", "MTK", 10);

    // Deploy MockTaskFactory
    MockTaskFactory = await ethers.getContractFactory("TaskFactory");
    mockTaskFactory = await MockTaskFactory.deploy();

    // Deploy Mock Agent
    MockAgent = await ethers.getContractFactory("Agent");
    mockAgent = await MockAgent.deploy(1, mockAgentPaymentAddress);
    agentAddress = await mockAgent.getAddress();

    // Deploy Mock Verifier
    MockVerifier = await ethers.getContractFactory("Verifier");
    mockVerifier = await MockVerifier.deploy(1, mockVerifierPaymentAddress);
    verifierAddress = await mockVerifier.getAddress();

    // Deploy TaskManager
    TaskManager = await ethers.getContractFactory("TaskManager");
    taskManager = await TaskManager.deploy(await mockERC20.getAddress(), await mockTaskFactory.getAddress());

    // Deploy MockTask
    // MockTask = await ethers.getContractFactory("Task");
    // uint256 verifierFee, uint256 agentFee, uint256 maxAgents, uint256 maxVerifiers, string memory proposal
    // mockTask = await MockTask.deploy(1, 100, 50, 1, 1, await taskManager.getAddress(), "Task Proposal Text");
    await mockERC20.connect(accounts[0]).approve(await taskManager.getAddress(), 150);
    await taskManager.createTask(100, 50, 1, 1, "Task Proposal Text");
    const { task } = await taskManager.tasks(1);
    mockTask = task;
  });

  it("should allow owner to register agents and verifiers", async function () {
    await taskManager.registerAgent(agentAddress);
    await taskManager.registerVerifier(verifierAddress);

    const agentId = await taskManager.agentsRegistered(agentAddress);
    const verifierId = await taskManager.verifiersRegistered(verifierAddress);
    const notExist = await taskManager.verifiersRegistered(await accounts[4].address);
    expect(agentId).to.equal(1);
    expect(verifierId).to.equal(1);
    expect(notExist).to.equal(0);
  });

  it("should allow users to create and submit tasks", async function () {

    await mockERC20.connect(accounts[0]).approve(await taskManager.getAddress(), 150);

    await expect(() =>
      taskManager.createTask(verifierFee, agentFee, maxAgents, maxVerifiers, proposal)
    )
      .to.changeTokenBalance(mockERC20, accounts[0], -1 * (verifierFee + agentFee));

    const task = await taskManager.tasks(1);
    console.log(task);
    expect(task.status).to.equal(1); // TaskStatus.STARTED
  });

  it("should allow agents and verifiers to request withdrawals", async function () {
    // Assuming you have a completed task with successful agents and verifiers
    // Mock the task's completion and success

    await mockAgent.connect(accounts[1]).acceptTask(mockTask);
    await mockVerifier.connect(accounts[2]).acceptVerificationTask(mockTask);
    await mockAgent.connect(accounts[1]).startTask(mockTask);
    await mockAgent.connect(accounts[1]).completeTask(mockTask, "Mock Agent Done!");

    await expect(mockAgent.connect(accounts[1]).completeTask(mockTask, "Mock Agent Done!")).to.be.revertedWith("Agent submitted already");

    const task = await taskManager.tasks(1);

    // cannot withdraw yet!
    await expect(taskManager.agentWithdrawRequest(1, 1)).to.be.revertedWith("cannot withdraw if task status not complete");
    await expect(taskManager.verifierWithdrawRequest(1, 1)).to.be.revertedWith("cannot withdraw if task status not complete");

    // lets verify it
    await mockVerifier.connect(accounts[2]).submitVerification(mockTask, 0, 90, "Success");

    await expect(taskManager.agentWithdrawRequest(1, 1)).to.be.revertedWith("payment address not the same as agent settings");
    await expect(taskManager.verifierWithdrawRequest(1, 1)).to.be.revertedWith("verifier not payment address for given task");
    // // Agent withdrawal
    await expect(() => taskManager.connect(accounts[1]).agentWithdrawRequest(1, 1))
      .to.changeTokenBalance(mockERC20, accounts[1], 50); // Adjust based on your test case

    // // Verifier withdrawal
    await expect(() => taskManager.connect(accounts[2]).verifierWithdrawRequest(1, 1))
      .to.changeTokenBalance(mockERC20, accounts[2], 100); // Adjust based on your test case
  });

  it("should allow owner to register agents and verifiers", async function () {
    // Register 5 agents
    for (let i = 1; i <= 5; i++) {
      const agent = await (await ethers.getContractFactory("Agent")).deploy(i, accounts[i].address);
      await taskManager.registerAgent(await agent.getAddress());
      const agentId = await taskManager.agentsRegistered(await agent.getAddress());
      expect(agentId).to.equal(i);
    }

    // Register 3 verifiers
    for (let i = 1; i <= 3; i++) {
      const verifier = await (await ethers.getContractFactory("Verifier")).deploy(i, accounts[i + 5].address);
      await taskManager.registerVerifier(await verifier.getAddress());
      const verifierId = await taskManager.verifiersRegistered(await verifier.getAddress());
      expect(verifierId).to.equal(i);
    }
  });

  it("should allow users to create and complete tasks", async function () {
    // Create a task
    await mockERC20.connect(accounts[0]).approve(await taskManager.getAddress(), verifierFee + agentFee);
    await taskManager.createTask(verifierFee, agentFee, 5, 3, proposal);

    // Get the task
    const id = await taskManager.taskIdCounter();
    let task = await taskManager.tasks(+(await taskManager.taskIdCounter()).toString() - 1);

    // Ensure task is in STARTED status
    console.log(task);
    // expect(task.status).to.equal(1); // TaskStatus.STARTED

    // Agents complete the task
    const agents = [];
    for (let i = 1; i <= 5; i++) {
      const agent = await (await ethers.getContractFactory("Agent")).deploy(i, accounts[i].address);
      agents.push(agent)
      // const agent = (await ethers.getContractFactory("Agent")).attach(agentAddress); // Use existing agents
      console.log('task acceptance', task.task, i);
      await agent.connect(accounts[i]).acceptTask(task.task);
      console.log('task', i, ' completed!');
    }

    for (let i = 1; i <= 5; i++) {
      const agent = agents[i-1];
      await agent.connect(accounts[i]).startTask(task.task);
      await agent.connect(accounts[i]).completeTask(task.task, `Agent ${i} Done!`);
      
    }

    task = await taskManager.tasks(+(await taskManager.taskIdCounter()).toString() - 1);
    // Verify that task status is now VERIFYING
    expect(task.status).to.equal(3); // TaskStatus.VERIFYING

    // Verifiers verify the task
    for (let i = 1; i <= 3; i++) {
      console.log('setting up verifier', i);
      const verifier = await (await ethers.getContractFactory("Verifier")).deploy(i, accounts[i + 5].address);
      await verifier.connect(accounts[i + 5]).acceptVerificationTask(task.task);
      for (let j = 0; j < 5; ++j) {
        await verifier.connect(accounts[i + 5]).submitVerification(task.task, j, 90, `Verifier ${i} Feedback`);
      }

    }

    // Verify that task status is now COMPLETED
    expect(task.status).to.equal(3); // TaskStatus.COMPLETED

    // Agent and Verifier withdrawal
    for (let i = 1; i <= 5; i++) {
      const agentBalanceBefore = await mockERC20.balanceOf(accounts[i]);
      await taskManager.connect(accounts[i]).agentWithdrawRequest(3, i);
      const agentBalanceAfter = await mockERC20.balanceOf(accounts[i]);
      expect(+agentBalanceAfter.toString() - (+agentBalanceBefore.toString())).to.equal(agentFee / 5);
    }

    for (let i = 1; i <= 3; i++) {
      const verifierBalanceBefore = await mockERC20.balanceOf(accounts[i + 5]);
      await taskManager.connect(accounts[i + 5]).verifierWithdrawRequest(3, i);
      const verifierBalanceAfter = await mockERC20.balanceOf(accounts[i + 5]);
      expect(+(verifierBalanceAfter.toString()) - (+verifierBalanceBefore.toString())).to.equal(Math.floor(verifierFee/3));
    }
  });
});
