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
export async function getFundsDisbursedEventLogs(chamaId: number): Promise<number | Error> {
  try {
    let latestLog: any;
    await sendEmail(
      `fetching latest block`,
      "loading..."
    );
    // Get the latest block number to start watching from
    // const latestBlock = await publicClient.getBlockNumber();

    await sendEmail(
      `latest celo block`,
      JSON.stringify(38164790n)
    );

    // getting the disburse events
    const logs = await publicClient.getLogs({
      address: contractAddress,
      event: parseAbiItem(
        "event FundsDisbursed(uint indexed chamaId, address indexed recipient, uint amount)"
      ),
      args: {
        chamaId: BigInt(chamaId),
      },
      fromBlock: 37162926n, // block of chamapay contract creation
      toBlock: 38164790n,
    });
    // send the log to dev email
    await sendEmail(
      `⏳ the payout events for ${chamaId}`,
      JSON.stringify(logs)
    );
    //get the latest log
    const lastLog = logs[logs.length - 1];
    latestLog = logs;
    await sendEmail(
      `⏳ the last log events for ${chamaId}`,
      JSON.stringify(lastLog)
    );

    return logs.length;
  } catch (error) {
    // console.error("Error watching for deposits:", error);
    await sendEmail(
      `⏳ error getting logs ${chamaId}`,
      JSON.stringify(error)
    );
    return error as Error;
  }
}
