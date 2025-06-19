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

interface EventLog {
  args: {
    _chamaId: bigint;
    recipient: string;
    amount: bigint;
  };
  transactionHash: string;
}

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
export async function getFundsDisbursedEventLogs(chamaId: number): Promise<{
  args: {
    chamaId: string;
    recipient: string;
    amount: string;
  };
  transactionHash: string;
} | null> {
  try {
    // Fetch logs
    const logs = await publicClient.getLogs({
      address: contractAddress,
      event: parseAbiItem(
        "event FundsDisbursed(uint indexed chamaId, address indexed recipient, uint amount)"
      ),
      args: {
        chamaId: BigInt(chamaId),
      },
      fromBlock: 37162926n,
      toBlock: 38164790n,
    });

    // If no logs found
    if (logs.length === 0) return null;

    const lastLog = logs[logs.length - 1];

    if (
      !lastLog.args ||
      lastLog.args.chamaId === undefined ||
      lastLog.args.recipient === undefined ||
      lastLog.args.amount === undefined
    ) {
      await sendEmail(
        `Malformed log for chamaId ${chamaId}`,
        JSON.stringify(lastLog)
      );
      return null;
    }

    // Extract essential data and convert BigInt to string
    const essentialData = {
      args: {
        chamaId: lastLog.args.chamaId.toString(),
        recipient: lastLog.args.recipient,
        amount: lastLog.args.amount.toString(),
      },
      transactionHash: lastLog.transactionHash,
    };

    // Optional: send to dev email for tracking
    await sendEmail("Latest Log Essentials", JSON.stringify(essentialData));

    return essentialData;
  } catch (error) {
    await sendEmail(
      `Error getting logs for chamaId ${chamaId}`,
      JSON.stringify(error)
    );
    return null;
  }
}
