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
import { getAgentSmartAccount } from "./Pimlico";
dotenv.config();

interface EventLog {
  args: {
    _chamaId: bigint;
    recipient: string;
    amount: bigint;
  };
  transactionHash: string;
}

const publicClient = createPublicClient({
  chain: celo,
  transport: http(),
});


// function to get the balance of the agent wallet
export const getAgentWalletBalance = async () => {
  const {account, smartAccountClient} = await getAgentSmartAccount();
  const balance = await publicClient.getBalance({
    address: account.address,
  });
  return formatEther(balance);
};

// function to perform payout smart contract function
export const performPayout = async (
  chamaBlockchainId: number
): Promise<{ txHash: string; blockNumber: bigint }> => {
  const chamaId = [BigInt(chamaBlockchainId)];
  try {
    const {account, smartAccountClient} = await getAgentSmartAccount();
    console.log("The agent account address", account.address);

    const txHash = await smartAccountClient.writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: "checkPayDate",
      args: [chamaId],
    });
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    return {
      txHash: txHash.toString(),
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.log(error);
    await sendEmail("The error from payout", JSON.stringify(error));
    throw error;
  }
};

// function to set the payout order
export const setBcPayoutOrder = async (
  chamaId: BigInt,
  addressArray: `0x${string}`[]
): Promise<string | Error> => {
  try {
    const {account, smartAccountClient} = await getAgentSmartAccount();
    console.log("The agent account address", account.address);
    const txHash = await smartAccountClient.writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: "setPayoutOrder",
      args: [chamaId, addressArray],
    });

    return txHash;
  } catch (error) {
    console.log(error);
    return error as Error;
  }
};
