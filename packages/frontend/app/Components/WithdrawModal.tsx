"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { FiX, FiDollarSign } from "react-icons/fi";
import { showToast } from "./Toast";
import { parseEther } from "viem";
import { processCheckout } from "../Blockchain/TokenTransfer";
import { cUSDContractAddress } from "../ChamaPayABI/ChamaPayContract";
import erc20Abi from "@/app/ChamaPayABI/ERC20.json";
import { useWriteContract } from "wagmi";
import { registrationTokenTx } from "@/lib/divviRegistration";

export default function WithdrawModal({
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
  const [amount, setAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [receiver, setReceiver] = useState("");
  const [destination, setDestination] = useState("mpesa"); // 'bank' or 'crypto'
  const { writeContractAsync } = useWriteContract();

  const handleWithdraw = async () => {
    // Validate inputs
    if (!receiver || !amount) {
      showToast("Please fill all fields", "warning");
      return;
    }

    if (!receiver.startsWith("0x") || receiver.length !== 42) {
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
      setIsWithdrawing(true);
      const parsedAmount = parseEther(amount);
      // const sent = await registrationTokenTx(
      //   receiver,
      //   parsedAmount,
      //   "transfer"
      // );
      const sent = await writeContractAsync({
        address: cUSDContractAddress,
        abi: erc20Abi,
        functionName: "transfer",
        args: [receiver, parsedAmount],
      });
      if (!sent) {
        showToast("Unable to withdraw. Please try again.", "error");
        return;
      }

      showToast(`${amount} cUSD withdrawn successfully!`, "success");
      setReceiver("");
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
      setIsWithdrawing(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-sm rounded-2xl bg-white p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold text-gray-900">
              Withdraw Funds
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 bg-transparent hover:bg-gray-100 rounded-full p-1"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setDestination("mpesa")}
                className={`flex-1 py-2 text-center ${
                  destination === "mpesa"
                    ? "bg-downy-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Mpesa
              </button>
              <button
                onClick={() => setDestination("crypto")}
                className={`flex-1 py-2 text-center ${
                  destination === "crypto"
                    ? "bg-downy-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Crypto Wallet
              </button>
            </div>

            {destination === "mpesa" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> M-pesa section is still under
                  development.
                </p>
              </div>
            )}

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

            {destination === "mpesa" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="number"
                  placeholder="e.g. 0712345678"
                  className="w-full rounded-lg border-gray-300 focus:border-downy-500 focus:ring-downy-500 mb-2"
                />
              </div>
            )}

            {destination === "crypto" && (
              <div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    value={receiver}
                    onChange={(e) => setReceiver(e.target.value)}
                    placeholder="0x..."
                    className="w-full rounded-lg border-gray-300 focus:border-downy-500 focus:ring-downy-500"
                  />
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                    <p className="text-yellow-800 text-sm">
                      <strong>Note:</strong> Only send to an address that is on
                      the celo network. Sending to other networks may result in
                      permanent loss.
                    </p>
                  </div>
                </div>
                <div className="pt-2 flex space-x-3">
                  <button
                    onClick={onClose}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWithdraw}
                    disabled={isWithdrawing}
                    className={`flex-1 bg-downy-600 text-white py-2 rounded-lg font-medium hover:bg-downy-700 transition ${
                      isWithdrawing ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isWithdrawing ? "Processing..." : "Withdraw"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
