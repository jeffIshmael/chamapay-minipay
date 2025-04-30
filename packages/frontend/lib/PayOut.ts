// this file contains a payout smart contract function that is done by agent wallet

import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celoAlfajores } from "viem/chains";
import { contractAbi, contractAddress } from "../app/ChamaPayABI/ChamaPayContract";

import dotenv from "dotenv";
dotenv.config();

const agentWalletPrivateKey = process.env.AGENT_WALLET_PRIVATE_KEY;

if (!agentWalletPrivateKey) {
  throw new Error("AGENT_WALLET_PRIVATE_KEY is not set");
}

const agentWalletAccount = privateKeyToAccount(
  agentWalletPrivateKey as `0x${string}`
);

const publicClient = createPublicClient({
  chain: celoAlfajores,
  transport: http(),
});

const walletClient = createWalletClient({
  chain: celoAlfajores,
  transport: http(),
  account: agentWalletAccount,
});

// function to get the balance of the agent wallet
export const getAgentWalletBalance = async () => {
  const balance = await publicClient.getBalance({
    address: agentWalletAccount.address,
  });
  return balance;
};

// function to perform payout smart contract function
export const performPayout = async (chamaId: number) => {
  const chamaIds = [BigInt(chamaId)];
  const tx = await walletClient.writeContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "checkPayDate",
    args: [chamaIds],
  });
  return tx;
};