"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { FiX, FiUser, FiDollarSign } from "react-icons/fi";
import { toast } from "sonner";
import { showToast } from "./Toast";

export default function SendModal({
  isOpen,
  onClose,
  balance,
}: {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
}) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!recipient || !amount) {
      showToast("Please fill all fields","warning");
      return;
    }

    if (parseFloat(amount) > balance) {
      showToast("Insufficient balance", "warning");
      return;
    }

    try {
      setIsSending(true);
      // Implement your send logic here
      // This would typically involve a smart contract call
      showToast(`${amount} cUSD sent successfully!`,"success");
      onClose();
    } catch (error) {
      showToast("Failed to send transaction","error");
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
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 bg-transparent hover:bg-gray-100 rounded-full p-1">
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
                    onClick={() => setAmount((balance.toFixed(3)).toString())}
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
                onClick={handleSend}
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