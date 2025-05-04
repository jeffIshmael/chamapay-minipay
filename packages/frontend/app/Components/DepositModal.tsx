"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { FiCopy, FiX, FiCheck } from "react-icons/fi";
import { toast } from "sonner";
import { showToast } from "./Toast";

export default function DepositModal({
  isOpen,
  onClose,
  address,
}: {
  isOpen: boolean;
  onClose: () => void;
  address: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      showToast("Address copied!","info");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy address");
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-sm rounded-2xl bg-white p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold text-gray-900">
              Deposit cUSD
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 bg-transparent hover:bg-gray-100 rounded-full p-1">
              <FiX size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              Send cUSD to this address to deposit into your wallet:
            </p>

            <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
              <p className="font-mono text-sm truncate">{address}</p>
              <button
                onClick={copyAddress}
                className="ml-2 p-2 rounded-full bg-gray-200 hover:bg-gray-300"
              >
                {copied ? <FiCheck className="text-green-500" /> : <FiCopy />}
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> Only send cUSD (Celo Dollar) to this address. Sending
                other assets may result in permanent loss.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={onClose}
                className="w-full bg-downy-600 text-white py-3 rounded-lg font-medium hover:bg-downy-700 transition"
              >
                Done
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}