import {
  contractAbi,
  contractAddress,
} from "@/app/ChamaPayABI/ChamaPayContract";
import { createPublicClient, http } from 'viem'
import { celoAlfajores } from 'viem/chains'
 
export const publicClient = createPublicClient({
  chain: celoAlfajores,
  transport: http()
})

export async function getLatestChamaId() {
  const result = await publicClient.readContract({
    abi: contractAbi,
    address: contractAddress,
    functionName: "totalChamas",
  });

  return Number(result);
}
