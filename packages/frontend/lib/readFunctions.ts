import { sendEmail } from "@/app/actions/emailService";
import {
  contractAbi,
  contractAddress,
} from "@/app/ChamaPayABI/ChamaPayContract";
import { createPublicClient, http, Log, parseAbiItem } from "viem";
import { celo } from "viem/chains";

export const publicClient = createPublicClient({
  chain: celo,
  transport: http(),
});

export async function getLatestChamaId() {
  const result = await publicClient.readContract({
    abi: contractAbi,
    address: contractAddress,
    functionName: "totalChamas",
  });

  return Number(result);
}

// function to get individual chama balance
export async function getIndividualBalance(
  chamaBlockchainId: number,
  address: `0x${string}`
) {
  const result = await publicClient.readContract({
    abi: contractAbi,
    address: contractAddress,
    functionName: "getBalance",
    args: [BigInt(chamaBlockchainId), address],
  });
  return result;
}

// function to get FundsDisbursed event logs
export async function getFundsDisbursedEventLogs(chamaId: number) {
  try {
    let latestLog: any;
    // Get the latest block number to start watching from
    const latestBlock = await publicClient.getBlockNumber();

    // Set up the event filter
    const fundsDisbursedEvent = {
      address: contractAddress,
      event: {
        type: "event",
        name: "FundsDisbursed",
        inputs: [
          {
            indexed: false,
            internalType: "uint256",
            name: "chamaId",
            type: "uint256",
          },
          {
            indexed: true,
            internalType: "address",
            name: "receiver",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
      } as const,
      fromBlock: latestBlock - BigInt(1000), // Look back 100 blocks to catch recent events
      toBlock: "latest",
    };

    // Watch for new events
    const unwatch = publicClient.watchContractEvent({
      address: contractAddress,
      abi: contractAbi,
      eventName: "FundsDisbursed",
      args: {
        chamaId: chamaId,
      },
      onLogs: async (logs: any) => {
        await sendEmail(
          `⏳ the payout events for ${chamaId}`,
          JSON.stringify(logs)
        );
        const lastLog = logs[logs.length - 1];
        console.log(lastLog);
        latestLog = lastLog;
      },
    });
    const watch = publicClient.watchEvent({
      address: contractAddress,
      event: parseAbiItem(
        "event FundsDisbursed(uint indexed chamaId, address indexed recipient, uint amount)"
      ),
      args: {
        chamaId: BigInt(chamaId),
      },
      onLogs: async (logs) => {
        await sendEmail(
          `⏳ the payout events for ${chamaId}`,
          JSON.stringify(logs)
        );
      },
    });
    return latestLog;
  } catch (error) {
    console.error("Error watching for deposits:", error);
  }
}
