import React from "react";
import { HiOutlineX } from "react-icons/hi";

const PayoutCongrats = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-[90%] max-w-md text-center relative">
        
        {/* Close Button */}
        <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <HiOutlineX size={24} />
        </button>

        {/* Congrats Message */}
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-green-600 mb-2">🎉 Congratulations!</h1>
          <p className="text-gray-700 mb-4">
            Hurray! Your <span className="font-semibold text-green-600">Celo Devs</span> chama has successfully reached a payout milestone.
          </p>
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-semibold">Drips</span> just received <span className="font-semibold">10 cUSD</span> as the payout for Cycle 2, Round 4 of the <span className="font-semibold text-green-600">Celo Devs</span> chama.
          </p>

          {/* Optional Fancy Image or SVG */}
          <div className="my-4">
            {/* Example SVG */}
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

          {/* Action Button */}
          <button className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow">
            Cast & Flex 💬
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayoutCongrats;
