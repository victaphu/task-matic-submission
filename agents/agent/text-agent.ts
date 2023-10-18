require('dotenv').config({ path: '.env-nodejs' });
import { ethers } from "ethers";
import { textPromptResponse } from "../lib/ai-lib";
import { getAgent, getTask, listenForComplete, listenForTasks, provider, taskManagerContract } from "../lib/contractlib";

const wallet = new ethers.Wallet(process.env.AGENT_PRIVATE_KEY!, provider);
const agent = getAgent(process.env.AGENT2_ADDRESS!).connect(wallet);
const handler = async (event: any) => {
  const taskId = event.args[0].toString();
  console.log(`TaskSubmitted event received for taskId: ${taskId}`);

  try {
    // Fetch task details from TaskManager using taskId
    const task = await taskManagerContract.tasks(taskId);
    console.log('Task discovered', task.task);
    let txn = await agent.acceptTask(task.task);

    const prompt = await getTask(task.task).proposalText();
    console.log(prompt);
    const response = await textPromptResponse(prompt);
    console.log(JSON.stringify(response[0].predictions));
    await txn.wait();

    txn = await agent.completeTask(task.task, response[0].predictions[0].structValue.fields.content.stringValue);
    await txn.wait();
    console.log(`Agent registered for taskId: ${taskId}`);
  } catch (error) {
    console.error("Error processing TaskSubmitted event:", error);
  }
}

const completeHandler = async (event: any) => {
  const taskId = event.args[0].toString();
  console.log(`TaskComplete event received for taskId: ${taskId}`);

  try {
    console.log('withdrawing amount for the agent');
    const txn = await taskManagerContract.connect(wallet).agentWithdrawRequest(taskId, 2);
    await txn.wait();
    console.log('withdrawing was successful!');
  } catch (error) {
    console.error("Error processing TaskComplete event:", error);
  }
}

async function start() {
  console.log('AGENT 2 Started');
  listenForTasks(handler);
  listenForComplete(completeHandler); // withdraw $_$
}

start();
