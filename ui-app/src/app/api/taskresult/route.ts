import { ethers } from "ethers";
import task from "./task.json";
import taskmanager from "./taskmanager.json";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const provider = new ethers.JsonRpcProvider(process.env.JSON_RPC);

  const taskId = searchParams.get('taskId');
  const taskmgr = new ethers.Contract('0x68134c2D0138Cd2E811d275062e88BaE35A9fcA6', taskmanager.abi, provider);

  const taskObj = await taskmgr.tasks(taskId);
  console.log(taskObj.task);

  const taskImpl = new ethers.Contract(taskObj.task, task.abi, provider);

  const res = (await taskImpl.agentProgress())[0];

  // const erc20 = new ethers.Contract('0x7581a34d18B3c31f2f8101EF223E96350c1000dF', task.abi, wallet);

  // const res = await erc20.transfer(searchParams.get('address'), 10000);
  // await res.wait();

  return Response.json({
    agentId: res.agentId.toString(),
    responseData: res.responseData,
    verifierAccepted: res.verifierAccepted.toString(), // number of accepted verifiers
    verifierRejected: res.verifierRejected.toString(), // number of accepted verifiers
  });
}