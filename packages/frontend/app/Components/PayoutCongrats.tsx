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

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % chamas.length);
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + chamas.length) % chamas.length);
  };

  const chama = chamas[current];
  const latestOutcome = chama.roundOutcome[chama.roundOutcome.length - 1];
  const isDisburse = latestOutcome?.disburse;

  // getting username from address
  const getUsername = async (address: string) => {
    const user = await getUser(address);
    return user?.name;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-[90%] max-w-md text-center relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <HiOutlineX size={24} />
        </button>

        {/* Confetti for Disburse */}
        {isDisburse && (
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={200}
          />
        )}

        {/* Slide Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
          >
            {" "}
            {isDisburse ? (
              <>
                <h1 className="text-2xl font-bold text-green-600 mb-2">
                  🎉 Payout Successful!
                </h1>
                <p className="text-gray-700 mb-4">
                  Fantastic! Your{" "}
                  <span className="font-semibold text-green-600">
                    {chama.name}
                  </span>{" "}
                  chama has successfully completed a payout cycle.
                </p>

                <p className="text-sm text-gray-600 mb-4">
                  <span className="font-semibold">
                    {getUsername(
                      chama.payOuts[chama.payOuts.length - 1]?.receiver
                    )}
                  </span>{" "}
                  just received{" "}
                  <span className="font-semibold">
                    {formatEther(
                      chama.payOuts[chama.payOuts.length - 1]?.amount
                    )}{" "}
                    cUSD
                  </span>{" "}
                  for Cycle {latestOutcome.chamaCycle}, Round{" "}
                  {latestOutcome.chamaRound}.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-red-600 mb-2">
                  ⚠️ Payout Unsuccessful
                </h1>

                <p className="text-gray-700 mb-4">
                  Unfortunately, not all members of{" "}
                  <span className="font-semibold text-green-600">
                    {chama.name}
                  </span>{" "}
                  contributed for Cycle {latestOutcome.chamaCycle}, Round{" "}
                  {latestOutcome.chamaRound}.
                </p>

                <p className="text-sm text-gray-600 mb-4">
                  But don&apos;t worry — all contributions have been safely refunded.
                  Let&apos;s try again in the next round!
                </p>
              </>
            )}
            {/* Optional Fancy Image or SVG */}
            <div className="my-4">
              <svg
                className="mx-auto w-20 h-20 text-green-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M9 12l2 2 4-4m5 4a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {/* Show Button only if disbursed */}
            {isDisburse && (
              <button className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow">
                Cast & Flex 💬
              </button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-4 space-x-2">
          {chamas.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-3 h-3 rounded-full cursor-pointer ${
                index === current ? "bg-green-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Prev/Next Buttons */}
        {chamas.length > 1 && (
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePrev}
              className="text-sm text-gray-600 hover:text-green-600"
            >
              Prev
            </button>
            <button
              onClick={handleNext}
              className="text-sm text-gray-600 hover:text-green-600"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayoutCongrats;
