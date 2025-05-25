import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  useReadContract,
  useAccount,
  useWriteContract,
  useSwitchChain,
  useChainId,
} from "wagmi";
import { celo, celoAlfajores } from "viem/chains";
import erc20Abi from "@/app/ChamaPayABI/ERC20.json";
import { processCheckout } from "../Blockchain/TokenTransfer";
import {
  cUSDContractAddress,
  contractAddress,
  contractAbi,
} from "../ChamaPayABI/ChamaPayContract";
import { makePayment } from "../../lib/chama";
import { parseEther } from "viem";
import { showToast } from "./Toast";
import { useIsFarcaster } from "../context/isFarcasterContext";
import { approveTx, registrationTx } from "@/lib/divviRegistration";
import { waitForTransactionReceipt } from "@wagmi/core";
import { config } from "@/Providers/BlockchainProviders";
import { approveViemTx } from "./ViemApprove";

const CUSDPay = ({
  chamaId,
  chamaBlockchainId,
  name,
  onClose,
  isLoading,
  setIsLoading,
}: {
  chamaId: number;
  chamaBlockchainId: number;
  name: string;
  onClose: () => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}) => {
  const { isConnected, address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [amount, setAmount] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const { isFarcaster, setIsFarcaster } = useIsFarcaster();

  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
  } = useReadContract({
    chainId: celo.id,
    address: cUSDContractAddress,
    functionName: "balanceOf",
    abi: erc20Abi,
    args: [address],
  });

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address) {
      showToast("Please connect wallet", "warning");
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    const amount = parseFloat(data.amount as string);

    if (isNaN(amount) || amount <= 0) {
      showToast("Invalid amount", "warning");
      return;
    }

    // amount + txfee
    const totalAmount = Number(amount) * 1.01;

    // Check if user has sufficient balance
    const balance = Number(balanceData) / 10 ** 18;
    if (totalAmount > balance) {
      showToast("Insufficient cUSD balance", "error");
      return;
    }
    const amountInWei = parseEther(totalAmount.toString());

    try {
      setIsLoading(true);
      let txHash: string | null = null;
      if (isFarcaster) {
        const approveHash = await writeContractAsync({
          address: cUSDContractAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [contractAddress, amountInWei],
        });
        const transactionHash = await waitForTransactionReceipt(config, {
          hash: approveHash,
        });
        txHash = transactionHash.transactionHash;
      } else {
        const approveTxHash = await approveViemTx(contractAddress, amountInWei);
        if (!approveTxHash) {
          txHash = null;
          return;
        }
        txHash = approveTxHash;
      }

      if (txHash) {
        const depositArgs = [BigInt(chamaBlockchainId), amountInWei];
        const hash = await registrationTx("depositCash", depositArgs);
        if (!hash) {
          showToast("unable to write to bc. try again.", "error");
          return;
        }
        await makePayment(
          amountInWei,
          hash,
          chamaId,
          address as string,
          "You deposited"
        );

        showToast(`${amount} cUSD paid to ${name}`, "success");
        onClose();
      } else {
        showToast("Unable to complete payment, please try again", "error");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      showToast("A problem occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
      setIsCalculating(false);
    }
  };

  const formatBalance = (balance: bigint | undefined) => {
    if (isBalanceLoading) return "Loading...";
    if (isBalanceError || !balance) return "Error loading balance";
    return (Number(balance) / 10 ** 18).toFixed(3);
  };

  const calculateTxCost = (amount: string) => {
    if (!amount || isNaN(parseFloat(amount))) return "0.00";
    if (parseFloat(amount) * 0.05 > 0.00009)
      return (parseFloat(amount) * 0.05).toFixed(4);
    return "< 0.0001";
  };

  return (
    <div>
      <div className="flex items-center space-x-3 mb-4">
        <Image
          src={"/static/images/cUSD.png"}
          alt="cUSD logo"
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Pay with cUSD</h3>
          <p className="text-xs text-gray-500">Chama: {name}</p>
        </div>
      </div>

      <form onSubmit={handlePayment} className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="amount" className="text-sm font-medium text-gray-700">
            Amount (cUSD)
          </label>
          <div className="relative">
            <input
              type="number"
              id="amount"
              name="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.0001"
              min="0"
              className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:ring focus:ring-downy-200 focus:border-blue-500"
              required
              disabled={isLoading}
            />
            <span className="absolute left-2 top-2.5 text-gray-500">$</span>
          </div>
        </div>

        <div className="text-sm space-y-1 ">
          <div className="flex justify-end text-gray-600 gap-1">
            <span>Available: </span>
            <span className="font-medium">
              {formatBalance(balanceData as bigint)} cUSD
            </span>
          </div>
          {Number(amount) > 0 && (
            <div
              className="flex justify-end text-gray-600 gap-1"
              style={{ fontFamily: "Lobster, cursive" }}
            >
              <span>Tx fee (5%):</span>
              <span className="font-medium">
                {isCalculating ? (
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-400"></span>
                ) : (
                  `${calculateTxCost(amount)} cUSD`
                )}
              </span>
            </div>
          )}
          {Number(amount) > 0 && (
            <div className="flex justify-end text-gray-800 font-medium pt-1 gap-1">
              <span>Total:</span>
              <span>
                {isCalculating ? (
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-400"></span>
                ) : (
                  `${(parseFloat(amount) * 1.05).toFixed(4)} cUSD`
                )}
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !amount || parseFloat(amount) <= 0}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            isLoading
              ? "bg-downy-300 text-gray-600 cursor-not-allowed"
              : "bg-downy-500 text-white hover:bg-downy-600"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            "make payment"
          )}
        </button>
      </form>
    </div>
  );
};

export default CUSDPay;
