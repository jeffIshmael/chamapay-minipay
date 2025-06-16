// this file contains a payout smart contract function that is done by agent wallet

import {
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  formatEther,
  http,
  parseAbiItem,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
import {
  contractAbi,
  contractAddress,
} from "../app/ChamaPayABI/ChamaPayContract";
import { serializeTransaction } from "viem";

import dotenv from "dotenv";
import { getDataSuffix, submitReferral } from "@divvi/referral-sdk";
import { sendEmail } from "@/app/actions/emailService";
dotenv.config();

interface EventLog {
  args: {
    _chamaId: bigint;
    recipient: string;
    amount: bigint;
  };
  transactionHash: string;
}

const agentWalletPrivateKey = process.env.AGENT_WALLET_PRIVATE_KEY;

if (!agentWalletPrivateKey) {
  throw new Error("AGENT_WALLET_PRIVATE_KEY is not set");
}

const agentWalletAccount = privateKeyToAccount(
  agentWalletPrivateKey as `0x${string}`
);

const publicClient = createPublicClient({
  chain: celo,
  transport: http(),
});

const walletClient = createWalletClient({
  chain: celo,
  transport: http(),
  account: agentWalletAccount,
});

const dataSuffix = getDataSuffix({
  consumer: "0x4821ced48Fb4456055c86E42587f61c1F39c6315",
  providers: [
    "0x0423189886d7966f0dd7e7d256898daeee625dca",
    "0x5f0a55fad9424ac99429f635dfb9bf20c3360ab8",
    "0x6226dde08402642964f9a6de844ea3116f0dfc7e",
  ],
});

// function to get the balance of the agent wallet
export const getAgentWalletBalance = async () => {
  const balance = await publicClient.getBalance({
    address: agentWalletAccount.address,
  });
  return formatEther(balance);
};

// function to perform payout smart contract function
export const performPayout = async (
  chamaBlockchainId: number
): Promise<string | Error> => {
  const chamaId = [BigInt(chamaBlockchainId)];
  try {
    const { request } = await publicClient.simulateContract({
      account: agentWalletAccount,
      address: contractAddress,
      abi: contractAbi,
      functionName: "checkPayDate",
      args: [chamaId],
    });
    const txHash = await walletClient.writeContract(request);
    return txHash;
  } catch (error) {
    console.log(error);
    await sendEmail("The error from payout", JSON.stringify(error));
    return error as Error;
  }
};

// function to set the payout order
export const setBcPayoutOrder = async (
  chamaId: BigInt,
  addressArray: `0x${string}`[]
): Promise<string | Error> => {
  try {
    const { request } = await publicClient.simulateContract({
      account: agentWalletAccount,
      address: contractAddress,
      abi: contractAbi,
      functionName: "setPayoutOrder",
      args: [chamaId, addressArray],
    });
    const txHash = await walletClient.writeContract(request);

    return txHash;
  } catch (error) {
    console.log(error);
    return error as Error;
  }
};

// function to get events
export async function getFundsDisbursedEventLogsPayout(chamaId: number): Promise<EventLog [] | Error> {
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

    return latestLog;
  } catch (error) {
    // console.error("Error watching for deposits:", error);
    await sendEmail(
      `⏳ error getting logs ${chamaId}`,
      JSON.stringify(error)
    );
    return error as Error;
  }
}

export const registerDivvi: (
  chamaId: BigInt,
  addressArray: `0x${string}`[]
) => Promise<string | Error> = async (
  chamaId: BigInt,
  addressArray: `0x${string}`[]
): Promise<string | Error> => {
  try {
    const functionData = encodeFunctionData({
      abi: contractAbi,
      functionName: "setPayoutOrder",
      args: [chamaId, addressArray],
    });
    const fullData = functionData + dataSuffix.replace(/^0x/, "");

    const gas = await publicClient.estimateGas({
      account: agentWalletAccount,
      to: contractAddress,
      data: fullData as `0x${string}`,
      value: 0n,
    });

    const tx = await walletClient.prepareTransactionRequest({
      to: contractAddress,
      data: fullData as `0x${string}`,
      value: 0n,
      gas,
    });

    const signedTx = await walletClient.signTransaction(tx);

    const txHash = await publicClient.sendRawTransaction({
      serializedTransaction: signedTx,
    });

    const chainId = await walletClient.getChainId();

    await submitReferral({
      txHash,
      chainId,
    });

    return txHash;
  } catch (error) {
    console.log(error);
    return error as Error;
  }
};

