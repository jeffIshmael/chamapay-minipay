"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { FiX, FiUser, FiDollarSign } from "react-icons/fi";
import { processCheckout } from "@/app/Blockchain/TokenTransfer";
import { showToast } from "./Toast";
import { parseEther } from "viem";
import erc20Abi from "@/app/ChamaPayABI/ERC20.json";
import { cUSDContractAddress } from "../ChamaPayABI/ChamaPayContract";
import { useWriteContract } from "wagmi";

export default function SendModal({
  isOpen,
  onClose,
  balance,
  isFarcaster,
}: {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  isFarcaster: boolean;
}) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { writeContractAsync } = useWriteContract();

  const handleSend = async () => {
    // Validate inputs
    if (!recipient || !amount) {
      showToast("Please fill all fields", "warning");
      return;
    }

    if (!recipient.startsWith("0x") || recipient.length !== 42) {
      showToast("Please enter a valid Ethereum address", "warning");
      return;
    }

    if (isNaN(parseFloat(amount))) {
      showToast("Please enter a valid amount", "warning");
      return;
    }

    if (parseFloat(amount) <= 0) {
      showToast("Amount must be greater than 0", "warning");
      return;
    }

    if (parseFloat(amount) > balance) {
      showToast("Insufficient balance", "warning");
      return;
    }

    try {
      setIsSending(true);
      const parsedAmount = parseEther(amount);
      // const sent = await processCheckout(recipient as `0x${string}`, parsedAmount,currentConnector);
      let sent: string | boolean = false;
      if (isFarcaster) {
        const sendHash = await writeContractAsync({
          address: cUSDContractAddress,
          abi: erc20Abi,
          functionName: "transfer",
          args: [recipient, parsedAmount],
        });
        if (sendHash) {
          sent = sendHash;
        } else {
          sent = false;
          showToast("unable to send", "warning");
        }
      } else {
        const paid = await processCheckout(
          recipient as `0x${string}`,
          parsedAmount,
        );
        sent = paid;
      }
      if (!sent) {
        showToast("Unable to send payment. Please try again.", "error");
        return;
      }
      showToast(`${amount} cUSD sent successfully!`, "success");
      setRecipient("");
      setAmount("");
      onClose();
    } catch (error) {
      console.error("Send error:", error);
      showToast(
        `Failed to send: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "error"
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-sm rounded-2xl bg-white p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold text-gray-900">
              Send cUSD
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 bg-transparent hover:bg-gray-100 rounded-full p-1"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                  className="pl-10 w-full rounded-lg border-gray-300 focus:border-downy-500 focus:ring-downy-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (cUSD)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiDollarSign className="text-gray-400" />
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-10 w-full rounded-lg border-gray-300 focus:border-downy-500 focus:ring-downy-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    onClick={() => setAmount(balance.toFixed(3).toString())}
                    className="text-xs text-downy-600 hover:text-downy-800 bg-transparent hover:bg-gray-100 rounded-md p-1"
                  >
                    Max
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Available: {balance.toFixed(3)} cUSD
              </p>
            </div>

            <div className="pt-4 flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSend()}
                disabled={isSending}
                className={`flex-1 bg-downy-600 text-white py-2 rounded-lg font-medium hover:bg-downy-700 transition ${
                  isSending ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
