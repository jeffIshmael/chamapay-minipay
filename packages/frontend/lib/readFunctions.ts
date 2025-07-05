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
    chamaId: string;
    recipient: string;
    amount: string;
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
export async function getFundsDisbursedEventLogs(
  chamaId: number
): Promise<EventLog | null> {
  try {
    // get latest block no.
    const latestCeloBlock = await publicClient.getBlockNumber();
    
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
      toBlock: latestCeloBlock,
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

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

// function to check if the outcome was a disburse or refund
export async function getPaydateCheckedEventLogs(
  chamaId: number,
  fromBlock: bigint 
): Promise<boolean | null> {
  try {
    const MAX_RETRIES = 3;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const latestCeloBlock = await publicClient.getBlockNumber();

      const logs = await publicClient.getLogs({
        address: contractAddress,
        event: parseAbiItem(
          "event PayDateChecked(uint indexed _chamaId, bool _isPastPayDate, bool _isAllMembersContributed, bool isDisbursed)"
        ),
        args: {
          _chamaId: BigInt(chamaId),
        },
        fromBlock: 38969721n,
        toBlock: latestCeloBlock,
      });

      if (logs.length > 0) {
        const lastLog = logs[logs.length - 1];

        if (
          !lastLog.args ||
          lastLog.args._chamaId === undefined ||
          lastLog.args._isAllMembersContributed === undefined ||
          lastLog.args._isPastPayDate === undefined ||
          lastLog.args.isDisbursed === undefined
        ) {
          await sendEmail(
            `checkpaydate log for chamaId ${chamaId}`,
            JSON.stringify(lastLog)
          );
          return null;
        }

        const { _isAllMembersContributed, isDisbursed } = lastLog.args;

        if (_isAllMembersContributed && isDisbursed) return true;
        if (!_isAllMembersContributed && !isDisbursed) return false;

        await sendEmail(
          "checking paydate abnormality",
          JSON.stringify({
            ...lastLog.args,
            _chamaId: lastLog.args._chamaId?.toString(),
          })
        );
        return false;
      }

      // Wait before retrying
      await delay(6000 * (attempt + 1));
    }

    // After retries
    await sendEmail(`Paydate log not found after retries for ${chamaId}`, "No logs after 3 attempts.");
    return null;
  } catch (error) {
    await sendEmail(
      `Error getting logs for chamaId ${chamaId}`,
      JSON.stringify(error)
    );
    return null;
  }
}

