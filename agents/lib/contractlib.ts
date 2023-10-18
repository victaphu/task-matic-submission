const { ethers } = require("ethers");
require('dotenv').config({ path: '.env-nodejs' });
const agentAbi = require("./agent.json");
const verifierAbi = require("./verifier.json");
const erc20Abi = require("./erc20.json");
const taskAbi = require("./task.json");
const { abi } = require("./taskmanager.json");


// Initialize an Ethereum provider and signer (you can replace with your preferred setup)
export const provider = new ethers.JsonRpcProvider(process.env.JSON_RPC);

// Contract addresses and ABI
const taskManagerAddress = process.env.TASKMANAGER_ADDRESS; // Replace with the TaskManager contract address
const taskManagerABI = abi; // Replace with the ABI of the TaskManager contract
export const taskManagerContract = new ethers.Contract(taskManagerAddress, taskManagerABI, provider);

/*
 event TaskSubmitted(uint256 taskId);
    event TaskStarted(uint256 taskId);
    event TaskCompleted(uint256 taskId);
    event TaskVerifying(uint256 taskId);
    event TaskVerified(uint256 taskId, string message, bool accepted);
    event AgentAccepted(uint256 taskId, uint256 agentId);
    event VerifierAccepted(uint256 taskId, uint256 verifierId);
    event PaymentMade(uint256 taskId, address add, uint256 total);
*/
export function listenForTasks(listener : (taskId: any, event: any) => void) {
    // Create contract instances
    // Event filter to listen for TaskSubmitted events
    const taskSubmittedFilter = taskManagerContract.filters.TaskSubmitted();

    // Listen for TaskSubmitted events
    taskManagerContract.on(taskSubmittedFilter, listener);
}

// when status changes to verifying the verifier can start its work!
export function listenForVerify(listener : (taskId: any, event: any) => void) {
    // Create contract instances
    // Event filter to listen for TaskSubmitted events
    const taskSubmittedFilter = taskManagerContract.filters.TaskVerifying();

    // Listen for TaskSubmitted events
    taskManagerContract.on(taskSubmittedFilter, listener);
}

export function listenForComplete(listener : (taskId: any, event: any) => void) {
    // Create contract instances
    // Event filter to listen for TaskSubmitted events
    const taskSubmittedFilter = taskManagerContract.filters.TaskCompleted();

    // Listen for TaskSubmitted events
    taskManagerContract.on(taskSubmittedFilter, listener);
}

const agentABI = agentAbi.abi; // Replace with the ABI of the TaskManager contract
const verifierABI = verifierAbi.abi; // Replace with the ABI of the TaskManager contract

export function getAgent(agentAddress: string) {
    const agentContract = new ethers.Contract(agentAddress, agentABI, provider);
    return agentContract;
}

export function getVerifier(verifierAddress: string) {
    const verifierContract = new ethers.Contract(verifierAddress, verifierABI, provider);
    return verifierContract;
}

export function getERC20() {
    const erc20 = new ethers.Contract(process.env.ERC20_ADDRESS, erc20Abi.abi, provider);

    return erc20;
}

export function getTask(taskAddress: string) {
    const verifierContract = new ethers.Contract(taskAddress, taskAbi.abi, provider);
    return verifierContract;
}