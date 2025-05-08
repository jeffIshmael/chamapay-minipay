"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import MPesaPay from "./MPesaPay";
import CUSDPay from "./cUSDPay";
import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import {showToast} from "./Toast"

const Pay = ({
  openModal,
  closeModal,
  chamaId,
  chamaName,
  chamaBlockchainId,
}: {
  openModal: boolean;
  closeModal: () => void;
  chamaId: number;
  chamaName: string;
  chamaBlockchainId: number;
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Handle closing animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      closeModal();
      setIsClosing(false);
      setSelectedPaymentMethod("");
    }, 300);
  };

  // Close modal when clicking on backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (openModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openModal]);

  return (
    <AnimatePresence>
      {openModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isClosing ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleBackdropClick}
          className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-end ${
            isLoading ? "pointer-events-none" : ""
          }`}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: isClosing ? "100%" : 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white w-full max-w-sm rounded-t-3xl shadow-xl relative"
          >
            <button
              onClick={handleClose}
              disabled={isLoading}
              className={`absolute top-4 right-4 p-1 rounded-full bg-transparent hover:bg-gray-200 transition-colors ${
                isLoading
                  ? "cursor-not-allowed opacity-50 hover:bg-transparent"
                  : ""
              }`}
            >
              <FiX className="w-6 h-6 text-gray-600 " />
            </button>

            <div className="p-6">
              <h1 className="text-xl font-bold text-center mb-4">
                Pay to {chamaName}
              </h1>

              {!selectedPaymentMethod ? (
                <div className="space-y-4">
                  <h2 className=" font-medium text-center text-gray-600 mb-4">
                    Select Payment Method
                  </h2>
                  <div className="space-y-3">
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPaymentMethod("cusd")}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 relative">
                          <Image
                            src="/static/images/cUSD.png"
                            alt="cUSD logo"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <h3 className="text-lg font-medium">Pay with cUSD</h3>
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5 text-gray-400"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.div>

                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPaymentMethod("mpesa")}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 relative">
                          <Image
                            src="/static/images/mpesa.png"
                            alt="M-Pesa logo"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <h3 className="text-lg font-medium">Pay with M-Pesa</h3>
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5 text-gray-400"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setSelectedPaymentMethod("")}
                    disabled={isLoading}
                    className={`flex items-center mb-4 text-gray-600 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-md p-2 transition-colors ${
                      isLoading
                        ? "cursor-not-allowed opacity-50 hover:bg-transparent"
                        : ""
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 mr-1"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Back to payment methods
                  </button>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedPaymentMethod}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {selectedPaymentMethod === "mpesa" && (
                        <MPesaPay chamaName={chamaName} />
                      )}
                      {selectedPaymentMethod === "cusd" && (
                        <CUSDPay
                          chamaId={chamaId}
                          chamaBlockchainId={chamaBlockchainId}
                          name={chamaName}
                          onClose={handleClose}
                          isLoading={isLoading}
                          setIsLoading={setIsLoading}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Pay;
