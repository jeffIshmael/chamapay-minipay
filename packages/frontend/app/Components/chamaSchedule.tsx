import React from "react";
import dayjs from "dayjs";
import { motion } from "framer-motion";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Payout Timeline for {chama.name}
          </h2>
          <p className="text-gray-600">
            Total members: {chama.members.length} • Cycle: {chama.cycleTime} days
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-6 top-0 h-full w-1 bg-indigo-200 rounded-full"></div>

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
                  className={`bg-white p-6 rounded-xl shadow-lg transition-all duration-300 ${
                    isCurrent
                      ? "ring-2 ring-indigo-500"
                      : isNext
                      ? "ring-1 ring-amber-300"
                      : ""
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
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
                    <div className="mt-2 md:mt-0 text-right">
                      <div className="text-lg font-medium text-gray-700">
                        {dayjs(member.payoutDate).format("MMM D, YYYY")}
                      </div>
                      <div
                        className={`mt-1 inline-block px-3 py-1 text-sm font-semibold rounded-full ${
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
                  </div>

                  {/* Additional details */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Round:</span> {chama.round}
                    </div>
                    <div>
                      <span className="font-medium">Cycle:</span> {chama.cycle}
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