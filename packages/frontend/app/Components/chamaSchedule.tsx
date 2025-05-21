import React from "react";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { FiClock, FiFileText, FiGift } from "react-icons/fi";
import { formatEther } from "viem";

interface User {
  chamaId: number;
  id: number;
  payDate: Date;
  user: {
    id: number;
    address: string;
    name: string | null;
    isFarcaster: boolean;
    fid: number | null;
  };
  userId: number;
}

interface Chama {
  adminId: number;
  amount: bigint;
  createdAt: Date;
  cycleTime: number;
  id: number;
  round: number;
  cycle: number;
  blockchainId: string;
  maxNo: number;
  members: User[];
  name: string;
  payDate: Date;
  slug: string;
  startDate: Date;
  started: boolean;
  type: string;
}

const ChamaSchedule = ({ chama }: { chama: Chama }) => {
  const getMemberPayoutDate = (index: number): Date => {
    const payoutDate = new Date(chama.startDate);
    payoutDate.setDate(payoutDate.getDate() + chama.cycleTime * index);
    return payoutDate;
  };

  const now = new Date();

  const sortedMembers = chama.members
    .map((member, index) => ({
      ...member,
      payoutDate: getMemberPayoutDate(index),
    }))
    .sort((a, b) => a.payoutDate.getTime() - b.payoutDate.getTime());

  // Find the next member to be paid
  const nextMemberIndex = sortedMembers.findIndex((m) =>
    dayjs(m.payoutDate).isAfter(dayjs(), "day")
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-downy-200 to-downy-100 pt-4 p-2">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {chama.name} Chama
            </h2>
            <FiFileText className="justify-self-end text-downy-500 text-lg" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              Payout Schedule
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-800">
                Total members:
              </span>{" "}
              {chama.members.length}
            </p>
            <p className="text-gray-600">• Cycle: {chama.cycleTime} days</p>
          </div>
        </motion.div>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-6 top-0 h-full w-1 bg-indigo-200 rounded-full"></div>

          {sortedMembers.map((member, index) => {
            const isPaid = dayjs().isAfter(member.payoutDate, "day");
            const isNext = index === nextMemberIndex;
            const isCurrent =
              isNext && dayjs().isSame(member.payoutDate, "day");

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="mb-8 pl-12 relative"
              >
                {/* Timeline dot */}
                <div
                  className={`absolute left-0 w-5 h-5 rounded-full -ml-[10px] top-4 border-4 transition-all duration-300 ${
                    isCurrent
                      ? "bg-white border-indigo-600 animate-pulse"
                      : isPaid
                      ? "bg-green-500 border-green-300"
                      : isNext
                      ? "bg-amber-400 border-amber-200"
                      : "bg-gray-300 border-gray-100"
                  }`}
                ></div>

                {/* Member card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`bg-white p-2 rounded-xl shadow-lg transition-all duration-300 ${
                    isCurrent
                      ? "ring-2 ring-indigo-500"
                      : isNext
                      ? "ring-1 ring-amber-300"
                      : ""
                  }`}
                >
                  <div className="">
                    <div>
                      <h3 className="text-gray-500 text-sm">
                        # {index + 1}
                      </h3>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {member.user.name || `Member ${index + 1}`}
                        {isCurrent && (
                          <span className="ml-2 px-2 py-1 text-xs font-bold bg-indigo-100 text-indigo-800 rounded-full">
                            TODAY
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {member.user.address.slice(0, 6)}...
                        {member.user.address.slice(-4)}
                      </p>
                    </div>
                    <div>
                      <FiGift className="text-gray-500 text-lg" />
                      <p className="text-gray-500 text-sm">
                        {Number(formatEther(chama.amount)) * chama.members.length} cUSD
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0 text-right">
                    <FiClock />
                      <div className="text-lg font-medium text-gray-700">
                        {dayjs(member.payoutDate).format("MMM D, YYYY")}
                      </div>
                    </div>
                  </div>

                  {/* Additional details */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center text-sm text-gray-500">
                    <div
                      className={`mt-1 inline-block px-3 py-2 text-lg font-semibold rounded-full ${
                        isCurrent
                          ? "bg-indigo-100 text-indigo-800"
                          : isPaid
                          ? "bg-green-100 text-green-800"
                          : isNext
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {isCurrent
                        ? "Payment Due"
                        : isPaid
                        ? "Paid"
                        : isNext
                        ? "Up Next"
                        : "Pending"}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChamaSchedule;
