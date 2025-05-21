import React from "react";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { FiClock, FiFileText, FiGift, FiUsers, FiCalendar, FiDollarSign } from "react-icons/fi";
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

  const nextMemberIndex = sortedMembers.findIndex((m) =>
    dayjs(m.payoutDate).isAfter(dayjs(), "day")
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-downy-100 via-white to-downy-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold text-gray-800">{chama.name}</h2>
            <FiFileText className="text-downy-500 text-xl" />
          </div>
          <p className="text-gray-600 mt-1">
            <span className="font-medium text-gray-800">Total Members:</span>{" "}
            {chama.members.length} • <span>Cycle:</span> {chama.cycleTime} days
          </p>
          <h3 className="text-xl font-semibold text-gray-800 mt-4">
            Payout Schedule
          </h3>
        </motion.div>

        <div className="relative pl-6">
          <div className="absolute left-3 top-0 h-full w-1 bg-downy-200 rounded-full"></div>

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
                className="mb-8 relative"
              >
                <div
                  className={`absolute left-0 w-4 h-4 top-4 rounded-full -ml-[6px] border-4 transition-all duration-300 ${
                    isCurrent
                      ? "bg-white border-indigo-600 animate-pulse"
                      : isPaid
                      ? "bg-green-500 border-green-300"
                      : isNext
                      ? "bg-yellow-400 border-yellow-200"
                      : "bg-gray-300 border-gray-100"
                  }`}
                ></div>

                <div
                  className={`bg-white border shadow-md rounded-xl p-4 md:p-6 transition-all duration-300 ${
                    isCurrent
                      ? "ring-2 ring-indigo-500"
                      : isNext
                      ? "ring-1 ring-yellow-300"
                      : ""
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="text-gray-500 text-sm">#{index + 1}</h4>
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        {member.user.name || `Member ${index + 1}`}
                        {isCurrent && (
                          <span className="px-2 py-1 text-xs font-bold bg-indigo-100 text-indigo-700 rounded-full">
                            TODAY
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {member.user.address.slice(0, 6)}...
                        {member.user.address.slice(-4)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <FiGift className="text-lg text-downy-500" />
                        {Number(formatEther(chama.amount)) *
                          chama.members.length}{" "}
                        cUSD
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <FiClock className="text-lg text-downy-500" />
                        {dayjs(member.payoutDate).format("MMM D, YYYY")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 border-t pt-3 text-center">
                    <span
                      className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                        isCurrent
                          ? "bg-indigo-100 text-indigo-800"
                          : isPaid
                          ? "bg-green-100 text-green-800"
                          : isNext
                          ? "bg-yellow-100 text-yellow-800"
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
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChamaSchedule;
