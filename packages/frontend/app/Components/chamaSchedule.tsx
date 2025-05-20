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

  const firstPayout = dayjs(chama.startDate).toDate();
  const lastPayout = dayjs(chama.startDate)
    .add(chama.cycleTime * chama.members.length, "day")
    .toDate();

  const events = chama.members.map((member, index) => {
    const payoutDate = dayjs(chama.startDate)
      .add(chama.cycleTime * index, "day")
      .toDate();
    const isPaid = dayjs().isAfter(payoutDate, "day");
    return {
      title: `${member.user.name || `Member ${index + 1}`} ${
        isPaid ? "✔️" : ""
      }`,
      start: payoutDate,
      end: payoutDate,
      allDay: true,
    };
  });

  return (
    <div className="min-h-screen bg-downy-100 p-6">
      <h2 className="text-2xl font-bold text-downy-900">
        Payout Schedule for {chama.name}
      </h2>

      {/* 1. Calendar-like layout */}
      <div className="rounded-xl shadow-lg bg-white p-4 my-6">
        <h3 className="text-lg font-semibold mb-2">Schedule Overview</h3>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          views={["month"]}
          defaultView="month"
          min={firstPayout}
          max={lastPayout}
          toolbar={true}
          popup={true}
          onNavigate={(date, view, action) => {
            if (dayjs(date).isBefore(firstPayout) || dayjs(date).isAfter(lastPayout)) {
              return;
            }
          }}
        />
      </div>

      {/* 2. Leaderboard */}
      <div className="my-6 bg-white rounded-xl shadow-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-semibold text-downy-900">
            {chama.name} Payout Order
          </div>
          <div className="text-sm text-gray-500">Cycle {chama.cycle}</div>
        </div>

        <table className="w-full table-auto border-collapse">
          <thead className="bg-downy-50 text-downy-800">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-bold uppercase">
                #
              </th>
              <th className="px-4 py-2 text-left text-xs font-bold uppercase">
                Member
              </th>
              <th className="px-4 py-2 text-left text-xs font-bold uppercase">
                Payout Date
              </th>
              <th className="px-4 py-2 text-left text-xs font-bold uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {chama.members.map((member, index) => {
              const payoutDate = dayjs(chama.startDate).add(
                chama.cycleTime * index,
                "day"
              );
              const isPaid = dayjs().isAfter(payoutDate, "day");
              return (
                <tr key={member.id} className="hover:bg-downy-100/20">
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">
                    {member.user.name || `Member ${index + 1}`}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {payoutDate.format("MMM D, YYYY")}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        isPaid
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {isPaid ? (
                        <>
                          <span className="mr-1">✔️</span> Paid
                        </>
                      ) : (
                        "Pending"
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
