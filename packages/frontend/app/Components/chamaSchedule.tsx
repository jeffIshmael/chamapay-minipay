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

  const pastPayouts = sortedMembers.filter(
    (member) => new Date(member.payoutDate) < now
  );

  const upcomingPayouts = sortedMembers.filter(
    (member) => new Date(member.payoutDate) >= now
  );

  return (
    <div className="min-h-screen bg-downy-100 p-6 space-y-12">
      <h2 className="text-2xl font-bold text-downy-900">Payout Schedule for {chama.name}</h2>

      {/* 1. Calendar-like layout */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Schedule Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sortedMembers.map((member, index) => (
            <div
              key={member.id}
              className="bg-white p-4 rounded-xl shadow flex flex-col space-y-2"
            >
              <p className="text-downy-700 font-medium">
                {member.user.name || `Member ${index + 1}`}
              </p>
              <p className="text-sm text-gray-600">
                Payout Date: {dayjs(getMemberPayoutDate(index)).format("MMM D, YYYY")}
              </p>
              <p className="text-sm text-gray-500">Slot #{index + 1}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Leaderboard */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Payout Leaderboard</h3>
        <ul className="bg-white rounded-xl shadow divide-y">
          {sortedMembers.map((member, index) => (
            <li
              key={member.id}
              className="flex justify-between items-center p-3"
            >
              <span className="text-downy-800 font-medium">
                #{index + 1}. {member.user.name || "Unnamed Member"}
              </span>
              <span className="text-sm text-gray-600">
                {dayjs(member.payoutDate).format("MMM D")}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 3. Payout History */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Payout History</h3>
        {pastPayouts.length === 0 ? (
          <p className="text-sm text-gray-500">No payouts have been made yet.</p>
        ) : (
          <ul className="bg-white rounded-xl shadow divide-y">
            {pastPayouts.map((member, index) => (
              <li
                key={member.id}
                className="flex justify-between items-center p-3"
              >
                <span className="text-gray-800">
                  {member.user.name || "Unnamed Member"}
                </span>
                <span className="text-sm text-gray-600">
                  {dayjs(member.payoutDate).format("MMM D, YYYY")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChamaSchedule;
