"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { FiX, FiCopy, FiCheck } from "react-icons/fi";
import QRCode from "react-qr-code";
import { toast } from "sonner";

export default function QRCodeModal({
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
      toast.success("Address copied!");
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
              Receive Funds
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 bg-transparent hover:bg-gray-100 rounded-full p-1">
              <FiX size={24} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <QRCode
                  value={address}
                  size={180}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-2">Scan this QR code to receive payments</p>
              
              <div className="bg-gray-100 p-3 rounded-lg flex justify-between items-center">
                <p className="font-mono text-sm truncate">{address}</p>
                <button
                  onClick={copyAddress}
                  className="ml-2 p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  {copied ? <FiCheck className="text-green-500" /> : <FiCopy />}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Tip:</strong> You can also share this QR code to receive payments
                from other cUSD wallets.
              </p>
            </div>

            <div className="pt-2">
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