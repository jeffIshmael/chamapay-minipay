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
  const totalAmount = Number(formatEther(chama.amount)) * chama.members.length;

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
    <div className="min-h-screen bg-gradient-to-br from-downy-50 to-downy-100 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-800">{chama.name} Chama</h2>
                <FiFileText className="text-downy-500 text-xl" />
              </div>
              <h1 className="text-xl font-semibold text-gray-700 mt-1">Payout Schedule</h1>
            </div>
            
            <div className="bg-downy-50 rounded-lg p-3">
              <p className="text-downy-800 font-medium flex items-center gap-2">
                <FiDollarSign className="text-downy-600" />
                <span>Total Pool:</span> 
                <span className="text-gray-800">{totalAmount.toFixed(2)} cUSD</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
              <div className="bg-downy-100 p-2 rounded-full">
                <FiUsers className="text-downy-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Members</p>
                <p className="font-semibold text-gray-800">{chama.members.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
              <div className="bg-downy-100 p-2 rounded-full">
                <FiClock className="text-downy-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Cycle Time</p>
                <p className="font-semibold text-gray-800">{chama.cycleTime} days</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
              <div className="bg-downy-100 p-2 rounded-full">
                <FiCalendar className="text-downy-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Started</p>
                <p className="font-semibold text-gray-800">
                  {dayjs(chama.startDate).format("MMM D, YYYY")}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Timeline Section */}
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-6 top-0 h-full w-1 bg-downy-200 rounded-full"></div>

          {sortedMembers.map((member, index) => {
            const isPaid = dayjs().isAfter(member.payoutDate, "day");
            const isNext = index === nextMemberIndex;
            const isCurrent = isNext && dayjs().isSame(member.payoutDate, "day");

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="mb-6 pl-12 relative"
              >
                {/* Timeline dot */}
                <div
                  className={`absolute left-0 w-5 h-5 rounded-full -ml-[10px] top-6 border-4 transition-all duration-300 ${
                    isCurrent
                      ? "bg-white border-downy-600 animate-pulse"
                      : isPaid
                      ? "bg-green-500 border-green-300"
                      : isNext
                      ? "bg-amber-400 border-amber-200"
                      : "bg-gray-300 border-gray-100"
                  }`}
                ></div>

                {/* Member card */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className={`bg-white p-5 rounded-xl shadow-sm transition-all duration-300 ${
                    isCurrent
                      ? "ring-2 ring-downy-500 border border-downy-100"
                      : isNext
                      ? "ring-1 ring-amber-300 border border-amber-100"
                      : "border border-gray-100"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-downy-600 font-medium">#{index + 1}</span>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {member.user.name || `Member ${index + 1}`}
                        </h3>
                        {isCurrent && (
                          <span className="ml-auto px-2 py-1 text-xs font-bold bg-downy-100 text-downy-800 rounded-full">
                            TODAY
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm mt-1">
                        {member.user.address.slice(0, 6)}...{member.user.address.slice(-4)}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <FiGift className="text-downy-500" />
                        <span className="text-gray-700 font-medium">
                          {Number(formatEther(chama.amount)).toFixed(2)} cUSD
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <FiClock className="text-downy-500" />
                        <span className="text-gray-700 font-medium">
                          {dayjs(member.payoutDate).format("MMM D, YYYY")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="mt-4 flex justify-center">
                    <div
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                        isCurrent
                          ? "bg-downy-100 text-downy-800"
                          : isPaid
                          ? "bg-green-100 text-green-800"
                          : isNext
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {isCurrent
                        ? "Payment Due Today"
                        : isPaid
                        ? "Payment Completed"
                        : isNext
                        ? "Upcoming Payment"
                        : "Pending Payment"}
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