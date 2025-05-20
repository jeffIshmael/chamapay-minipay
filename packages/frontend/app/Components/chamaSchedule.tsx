import React from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dayjsLocalizer(dayjs);

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

  const events = chama.members.map((member, index) => {
    const payoutDate = dayjs(chama.startDate)
      .add(chama.cycleTime * index, "day")
      .toDate();
    return {
      title: member.user.name || `Member ${index + 1}`,
      start: payoutDate,
      end: payoutDate,
      allDay: true,
    };
  });

  return (
    <div className="min-h-screen bg-downy-100 p-6 space-y-12">
      <h2 className="text-2xl font-bold text-downy-900">
        Payout Schedule for {chama.name}
      </h2>

      {/* 1. Calendar-like layout */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Schedule Overview</h3>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          views={["month"]}
          defaultView="month"
        />
      </div>

      {/* 2. Leaderboard */}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cycle
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Member
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payout Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {chama.members.map((member, index) => {
            const payoutDate = dayjs(chama.startDate).add(
              chama.cycleTime * index,
              "day"
            );
            const isPaid = dayjs().isAfter(payoutDate, "day");
            return (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {member.user.name || `Member ${index + 1}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {payoutDate.format("MMM D, YYYY")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      isPaid
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {isPaid ? "Paid" : "Pending"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 3. Payout History */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Payout History</h3>
        <ul className="bg-white rounded-xl shadow divide-y">
          {chama.members
            .filter((_, index) => {
              const payoutDate = dayjs(chama.startDate).add(
                chama.cycleTime * index,
                "day"
              );
              return dayjs().isAfter(payoutDate, "day");
            })
            .map((member, index) => {
              const payoutDate = dayjs(chama.startDate).add(
                chama.cycleTime * index,
                "day"
              );
              return (
                <li
                  key={member.id}
                  className="flex justify-between items-center p-3"
                >
                  <span className="text-gray-800">
                    {member.user.name || `Member ${index + 1}`}
                  </span>
                  <span className="text-sm text-gray-600">
                    {payoutDate.format("MMM D, YYYY")}
                  </span>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
};

export default ChamaSchedule;
