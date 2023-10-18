import { ethers } from "hardhat";

async function main() {
  // const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  // const unlockTime = currentTimestampInSeconds + 60;

  // const lockedAmount = ethers.parseEther("0.001");

  // const lock = await ethers.deployContract("Lock", [unlockTime], {
  //   value: lockedAmount,
  // });

  // await lock.waitForDeployment();

  // console.log(
  //   `Lock with ${ethers.formatEther(
  //     lockedAmount
  //   )}ETH and unlock timestamp ${unlockTime} deployed to ${lock.target}`
  // );
  // string memory _name, string memory _symbol, uint8 _decimals
  const erc20 = await ethers.deployContract("TaskMaticERC20", ["TaskMatic", "TSM", 10]);
  const erc20Impl = await erc20.waitForDeployment();
  console.log(await erc20Impl.getAddress());

  const taskfactory = await ethers.deployContract("TaskFactory");
  const taskFactoryImpl = await taskfactory.waitForDeployment();
  console.log(await taskFactoryImpl.getAddress());

  // address _paymentToken, address _taskFactory
  const taskmanager = await ethers.deployContract("TaskManager", [await erc20Impl.getAddress(), await taskFactoryImpl.getAddress()]);
  const taskManagerImpl = await taskmanager.waitForDeployment();
  console.log(await taskManagerImpl.getAddress());

  // deploy 2 verifiers and 2 agents
  const agent1 = await ethers.deployContract("Agent", [1, '0xE37562CBF05C8CE0e2a6B257d00afb45b6197dA0']);
  const agent1Impl = await agent1.waitForDeployment();

  const agent2 = await ethers.deployContract("Agent", [2, '0xE37562CBF05C8CE0e2a6B257d00afb45b6197dA0']);
  const agent2Impl = await agent2.waitForDeployment();
  
  const verifier1 = await ethers.deployContract("Verifier", [1, '0x9C3855AfEB71d056de1B3060616D49BcD75D8fcb']);
  const verifier1Impl = await verifier1.waitForDeployment();

  const verifier2 = await ethers.deployContract("Verifier", [2, '0x9C3855AfEB71d056de1B3060616D49BcD75D8fcb']);
  const verifier2Impl = await verifier2.waitForDeployment();

  console.log("> Agents and Verifiers");
  console.log(await agent1Impl.getAddress());
  console.log(await agent2Impl.getAddress());
  console.log(await verifier1Impl.getAddress());
  console.log(await verifier2Impl.getAddress());

  // register each agent and verifier
  let txn = await taskmanager.registerAgent(await agent1Impl.getAddress());
  await txn.wait();
  txn = await taskmanager.registerAgent(await agent2Impl.getAddress());
  await txn.wait();
  txn = await taskmanager.registerVerifier(await verifier1Impl.getAddress());
  await txn.wait();
  txn = await taskmanager.registerVerifier(await verifier2Impl.getAddress());
  await txn.wait();

  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
