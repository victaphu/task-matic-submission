require('dotenv').config({ path: '.env-nodejs' });
import { ethers } from "ethers";
import { textPromptResponse } from "../lib/ai-lib";
import { getTask, getVerifier, listenForComplete, listenForTasks, listenForVerify, provider, taskManagerContract } from "../lib/contractlib";

const wallet = new ethers.Wallet(process.env.VERIFIER_PRIVATE_KEY!, provider);
const verifier = getVerifier(process.env.VERIFIER2_ADDRESS!).connect(wallet);
const handler = async (event: any) => {
  const taskId = event.args[0].toString();
  console.log(`TaskSubmitted event received for taskId: ${taskId}`);

  try {
    // Fetch task details from TaskManager using taskId
    const task = await taskManagerContract.tasks(taskId);
    console.log('Task discovered', task.task);
    console.log(await verifier.verifierId());
    const txn = await verifier.acceptVerificationTask(task.task);
    await txn.wait();
    console.log(`Verifier registered for taskId: ${taskId}`);
  } catch (error) {
    console.error("Error processing TaskSubmitted event:", error);
  }
}

const verifyHandler = async (event: any) => {
  const taskId = event.args[0].toString();
  console.log(`TaskVerify event received for taskId: ${taskId}`);

  try {
    // Fetch task details from TaskManager using taskId
    const task = await taskManagerContract.tasks(taskId);
    console.log('Task discovered', task.task);
    const taskObj = await getTask(task.task);
    const prompt = await taskObj.proposalText();
    console.log(prompt);

    const agentProgress = await taskObj.agentProgress();
    const result = agentProgress[0].responseData;
    console.log(result);

    const response = await textPromptResponse(
      `Please first give a rank of how well was prompt answered between 0 to 100. Please put the rating, followed by || to separate the ranking and the feedback. If its less than 80 please explain why you gave this score. prompt is ${prompt}. response is ${result}`);

    console.log(response[0].predictions[0].structValue.fields.content.stringValue);
    console.log(`Verifier registered for taskId: ${taskId}`);

    const data = response[0].predictions[0].structValue.fields.content.stringValue

    const rating = data.substring(0, data.indexOf("||")).trim();
    console.log("Answer Rating is: ", rating);
    const txn = await verifier.connect(wallet).submitVerification(task.task, 0, +rating, data);
    await txn.wait();

  } catch (error) {
    console.error("Error processing TaskSubmitted event:", error);
  }
}

const completeHandler = async (event: any) => {
  const taskId = event.args[0].toString();
  console.log(`TaskComplete event received for taskId: ${taskId}`);

  try {
    console.log('withdrawing amount for the verifier');
    const txn = await taskManagerContract.connect(wallet).verifierWithdrawRequest(taskId, 2);
    await txn.wait();
    console.log('withdrawing was successful!');
  } catch (error) {
    console.error("Error processing TaskComplete event:", error);
  }
}

async function start() {
  console.log('VERIFIER 2 Started');
  listenForTasks(handler);
  listenForVerify(verifyHandler); // check the result
  listenForComplete(completeHandler); // get my money!
}

start();
