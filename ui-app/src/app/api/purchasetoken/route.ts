import { ethers } from "ethers";
import erc20ABI from "./erc20.json";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const provider = new ethers.JsonRpcProvider(process.env.JSON_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const erc20 = new ethers.Contract('0x7581a34d18B3c31f2f8101EF223E96350c1000dF', erc20ABI.abi, wallet);

  const res = await erc20.transfer(searchParams.get('address'), 10000);
  await res.wait();

  return Response.json({
    "success": true,
  });
}