"use client";

import React, { useState } from "react";
import { HiChevronLeft, HiChevronRight, HiOutlineX } from "react-icons/hi";
import { Chama } from "../MyChamas/page";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { formatEther } from "viem";
import { getUser } from "@/lib/chama";
import { useIsFarcaster } from "../context/isFarcasterContext";

const PayoutCongrats = ({
  chamas,
  onClose,
}: {
  chamas: Chama[];
  onClose: () => void;
}) => {
  const [current, setCurrent] = useState(0);
  const { isFarcaster, setIsFarcaster } = useIsFarcaster();
  const { width, height } = useWindowSize();

  const handleNext = () => setCurrent((prev) => (prev + 1) % chamas.length);
  const handlePrev = () =>
    setCurrent((prev) => (prev - 1 + chamas.length) % chamas.length);

  const chama = chamas[current];
  const latestOutcome = chama.roundOutcome[chama.roundOutcome.length - 1];
  const isDisburse = latestOutcome?.disburse;

  // NOTE: getUsername not usable here as it's async and React won't wait.

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      {/* Confetti if disbursed */}
      {isDisburse && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-gradient-to-b from-downy-100 to-gray-50 border border-downy-400 border-lg rounded-2xl shadow-xl w-[90%] max-w-xs p-5 relative"
      >
        {/* Close Button (inside the card now) */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-all"
        >
          <HiOutlineX size={16} className="text-gray-700" />
        </button>

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
                  <svg
                    className="w-7 h-7 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path d="M9 12l2 2 4-4m5 4a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg
                    className="w-7 h-7 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
                  </svg>
                )}
              </div>

              {/* Title */}
              <h2 className="text-lg font-bold mb-1">
                {isDisburse ? "🎉 Someone Got Paid!" : "⚠️ Payout Missed!"}
              </h2>

              {/* Message */}
              <p className="text-sm text-gray-600 mb-3">
                {isDisburse ? (
                  <>
                    Woohoo!{" "}
                    <span className="font-semibold text-green-600">
                      {chama.name}
                    </span>{" "}
                    chama just made a successful payout. Nice work keeping the
                    circle going! 🎉
                  </>
                ) : (
                  <>
                    Oops! Looks like not everyone in{" "}
                    <span className="font-semibold text-green-600">
                      {chama.name}
                    </span>{" "}
                    contributed this round ({latestOutcome.chamaRound} of cycle{" "}
                    {latestOutcome.chamaCycle}).
                    <p>
                      Don&apos;t worry — your funds are safe and refunded. Let&apos;s
                      smash it next time! 💪
                    </p>
                  </>
                )}
              </p>

              {/* Details */}
              {isDisburse && (
                <>
                  <div className="bg-gray-50 p-2 rounded-lg border text-left mb-4">
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-semibold">
                        {chama.payOuts[
                          chama.payOuts.length - 1
                        ]?.receiver.slice(0, 6)}
                        ...
                        {chama.payOuts[
                          chama.payOuts.length - 1
                        ]?.receiver.slice(-4)}
                      </span>{" "}
                      received{" "}
                      <span className="text-green-500 text-semibold">
                        {formatEther(
                          chama.payOuts[chama.payOuts.length - 1].amount
                        )}{" "}
                        cUSD
                      </span>{" "}
                      for round {latestOutcome.chamaRound} of cycle{" "}
                      {latestOutcome.chamaCycle}.
                    </p>
                  </div>

                  {/* Action Button */}

                  <button className="w-full py-2 flex items-center justify-center gap-2 bg-purple-600 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-purple-700 active:scale-95 transition-transform duration-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      className="fill-current"
                    >
                      <path d="M18.24.24H5.76A5.76 5.76 0 0 0 0 6v12a5.76 5.76 0 0 0 5.76 5.76h12.48A5.76 5.76 0 0 0 24 18V6A5.76 5.76 0 0 0 18.24.24m.816 17.166v.504a.49.49 0 0 1 .543.48v.568h-5.143v-.569A.49.49 0 0 1 15 17.91v-.504c0-.22.153-.402.358-.458l-.01-4.364c-.158-1.737-1.64-3.098-3.443-3.098s-3.285 1.361-3.443 3.098l-.01 4.358c.228.042.532.208.54.464v.504a.49.49 0 0 1 .543.48v.568H4.392v-.569a.49.49 0 0 1 .543-.479v-.504c0-.253.201-.454.454-.472V9.039h-.49l-.61-2.031H6.93V5.042h9.95v1.966h2.822l-.61 2.03h-.49v7.896c.252.017.453.22.453.472" />
                    </svg>
                    <span>Brag a Little 🚀</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots & Navigation */}
        {chamas.length > 1 && (
          <div className="flex justify-center items-center mt-4 space-x-4">
            {/* Previous Button */}
            <button
              onClick={handlePrev}
              className="p-2 rounded-full bg-downy-100 text-downy-600 shadow hover:bg-downy-200 transition-all"
            >
              <HiChevronLeft size={18} />
            </button>

            {/* Dots */}
            <div className="flex space-x-2">
              {chamas.map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === current ? "bg-downy-500 scale-110" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="p-2 rounded-full bg-downy-100 text-downy-600 shadow hover:bg-downy-200 transition-all"
            >
              <HiChevronRight size={18} />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PayoutCongrats;
