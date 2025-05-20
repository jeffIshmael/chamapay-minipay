import React from "react";
import dayjs from "dayjs";

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

  return (
    <div className="min-h-screen bg-downy-100 p-6">
      <h2 className="text-2xl font-bold text-downy-900 mb-6">
        Payout Timeline for {chama.name}
      </h2>

      <div className="relative border-l-4 border-downy-300 ml-4">
        {sortedMembers.map((member, index) => {
          const isPaid = dayjs().isAfter(member.payoutDate, "day");
          const isNext =
            index ===
            sortedMembers.findIndex((m) =>
              dayjs(m.payoutDate).isAfter(dayjs(), "day")
            );

          return (
            <div
              key={member.id}
              className="mb-10 ml-4 group relative"
              title={`${isPaid ? "Paid" : isNext ? "Next" : "Pending"}`}
            >
              <div
                className={`absolute w-4 h-4 rounded-full -left-2.5 top-1.5 border-2 group-hover:scale-125 transition-transform duration-150 ease-in-out ${
                  isPaid
                    ? "bg-green-500 border-green-700"
                    : isNext
                    ? "bg-yellow-400 border-yellow-600"
                    : "bg-gray-300 border-gray-500"
                }`}
              ></div>
              <div className="bg-white p-4 rounded-xl shadow-md">
                <div className="text-lg font-semibold text-downy-900">
                  {member.user.name || `Member ${index + 1}`}
                </div>
                <div className="text-sm text-gray-600">
                  {dayjs(member.payoutDate).format("MMM D, YYYY")}
                </div>
                <div
                  className={`mt-2 inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    isPaid
                      ? "bg-green-100 text-green-800"
                      : isNext
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {isPaid ? "Paid" : isNext ? "Next" : "Pending"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChamaSchedule;
