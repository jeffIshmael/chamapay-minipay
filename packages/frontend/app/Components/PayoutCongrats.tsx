"use client";

import React, { useState } from "react";
import { HiOutlineX } from "react-icons/hi";
import { Chama } from "../MyChamas/page";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { formatEther } from "viem";
import { getUser } from "@/lib/chama";

const PayoutCongrats = ({
  chamas,
  onClose,
}: {
  chamas: Chama[];
  onClose: () => void;
}) => {
  const [current, setCurrent] = useState(0);
  const { width, height } = useWindowSize();

  const handleNext = () => setCurrent((prev) => (prev + 1) % chamas.length);
  const handlePrev = () => setCurrent((prev) => (prev - 1 + chamas.length) % chamas.length);

  const chama = chamas[current];
  const latestOutcome = chama.roundOutcome[chama.roundOutcome.length - 1];
  const isDisburse = latestOutcome?.disburse;

  // NOTE: getUsername not usable here as it's async and React won't wait.

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white p-2 rounded-full shadow hover:bg-gray-100"
      >
        <HiOutlineX size={20} className="text-gray-700" />
      </button>

      {/* Confetti if disbursed */}
      {isDisburse && (
        <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />
      )}

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl w-[90%] max-w-xs p-5 relative"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              {/* Status Icon */}
              <div className="mx-auto mb-3 w-14 h-14 rounded-full flex items-center justify-center bg-green-50">
                {isDisburse ? (
                  <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M9 12l2 2 4-4m5 4a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
                  </svg>
                )}
              </div>

              {/* Title */}
              <h2 className="text-lg font-bold mb-1">
                {isDisburse ? "🎉 Payout Successful!" : "⚠️ Payout Unsuccessful."}
              </h2>

              {/* Message */}
              <p className="text-sm text-gray-600 mb-3">
                {isDisburse ? (
                  <>Your <span className="font-semibold text-green-600">{chama.name}</span> chama has completed a payout!</>
                ) : (
                  <>Not all members of <span className="font-semibold text-green-600">{chama.name}</span> contributed this round.</>
                )}
              </p>

              {/* Details */}
              <div className="bg-gray-50 p-3 rounded-lg border text-left mb-4">
                <p className="text-xs text-gray-500">
                  Cycle {latestOutcome.chamaCycle} • Round {latestOutcome.chamaRound}
                </p>
                {isDisburse && (
                  <p className="text-xs text-gray-500 mt-1">
                    Paid to: {chama.payOuts[chama.payOuts.length - 1]?.receiver.slice(0, 6)}...{chama.payOuts[chama.payOuts.length - 1]?.receiver.slice(-4)}
                  </p>
                )}
              </div>

              {/* Action Button */}
              {isDisburse && (
                <button className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                  Share Achievement
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots & Navigation */}
        {chamas.length > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button onClick={handlePrev} className="text-xs text-gray-500 hover:text-gray-700">Prev</button>
            <div className="flex space-x-2">
              {chamas.map((_, i) => (
                <span key={i} className={`w-2 h-2 rounded-full ${i === current ? "bg-green-500" : "bg-gray-300"}`} />
              ))}
            </div>
            <button onClick={handleNext} className="text-xs text-gray-500 hover:text-gray-700">Next</button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PayoutCongrats;
