import { ethers } from "ethers";
import { getERC20, provider, taskManagerContract } from "../lib/contractlib";

// submit a task!
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

async function submitTask() {
    const erc20 = getERC20();
    let txn = await erc20.connect(wallet).approve(await taskManagerContract.getAddress(), 1000000000000000);
    await txn.wait();

    console.log(process.argv[2]);

    if (process.argv.length < 3) {
        console.log("Supply prompt in quotes as the only arg to this function call.");
        process.exit(-1);
    }

    console.log("Submitting a test task for agent 2 and verifier 2");
    console.log("Submitting prompt \"", process.argv[2], "\"");
    txn = await taskManagerContract.connect(wallet).createTask(
        50,
        50,
        1,
        1,
        process.argv[2]);

    await txn.wait();
};

submitTask();