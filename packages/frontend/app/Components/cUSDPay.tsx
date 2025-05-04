import Image from "next/image";
import React from "react";
import { useReadContract, useAccount, useWriteContract } from "wagmi";
import { celoAlfajores } from "viem/chains";
import erc20Abi from "@/app/ChamaPayABI/ERC20.json";
import { processCheckout } from "../Blockchain/TokenTransfer";
import {
  cUSDContractAddress,
  contractAddress,
  contractAbi,
} from "../ChamaPayABI/ChamaPayContract";
import { makePayment } from "../../lib/chama";
import { toast } from "sonner";
import { parseEther } from "viem";
import { showToast } from "./Toast";

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

  const { data } = useReadContract({
    chainId: celoAlfajores.id,
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
    // Convert the input amount (as a string) to a float
    const amount = parseFloat(data.amount as string);

    if (isNaN(amount) || amount <= 0) {
      showToast("Invalid amount", "warning");
      return;
    }
    // Convert to wei
    const amountInWei = parseEther(amount.toString());

    try {
      setIsLoading(true);
      const txHash = await processCheckout(cUSDContractAddress, amountInWei);

      if (txHash) {
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: contractAbi,
          functionName: "depositCash",
          args: [BigInt(chamaBlockchainId), amountInWei],
        });
        if (hash) {
          await makePayment(
            amountInWei,
            txHash,
            chamaId,
            address as string,
            "You deposited"
          );

          showToast(`${amount} cUSD paid to ${name}`, "success");
          onClose();
          setIsLoading(false);
        } else {
          showToast("unable to make payment, please try again", "error");
        }
      } else {
        showToast(
          "Unable to make payment, please ensure you have enough cUSD.",
          "error"
        );
      }
    } catch (error) {
      console.log(error);
      showToast("A problem occured. Ensure wallet is connected.","error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 pt-2 rounded-lg shadow-md max-w-sm mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Image
          src={"/static/images/cUSD.png"}
          alt="cUSD logo"
          width={50}
          height={50}
        />
        <h3 className="text-xl font-semibold">cUSD Pay</h3>
      </div>
      <div>
        <form onSubmit={handlePayment} className="space-y-4">
          <div className="flex flex-col">
            <label
              htmlFor="amount"
              className="text-sm font-medium text-gray-600"
            >
              Amount (cUSD)
            </label>
            <input
              type="text"
              id="amount"
              name="amount"
              placeholder="Input amount"
              className="mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-downy-200"
              required
            />
          </div>
          <p className="text-right text-sm text-gray-500">
            Available balance:{(Number(data) / 10 ** 18).toFixed(3)} cUSD
          </p>
          <button
            type="submit"
            className={`w-full py-2 font-semibold rounded-md  transition duration-300 ${
              isLoading
                ? "text-downy-400 bg-downy-100 cursor-not-allowed hover:bg-downy-100"
                : " bg-downy-500 text-white hover:bg-downy-600"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Pay"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CUSDPay;
