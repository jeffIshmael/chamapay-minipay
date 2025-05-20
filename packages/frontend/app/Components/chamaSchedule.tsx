import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { FaCheckCircle, FaHourglassHalf, FaUser } from "react-icons/fa";
import { FiDollarSign, FiClock, FiUser } from "react-icons/fi";
import { IoMdCalendar } from "react-icons/io";
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
    payoutDate.setDate(payoutDate.getDate() + chama.cycleTime * (index + 1));
    return payoutDate;
  };

  const sortedMembers = chama.members
    .map((member, index) => ({
      ...member,
      payoutDate: getMemberPayoutDate(index),
      position: index + 1,
    }))
    .sort((a, b) => a.payoutDate.getTime() - b.payoutDate.getTime());

  const currentRoundIndex = sortedMembers.findIndex((member) =>
    dayjs().isBefore(member.payoutDate)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {chama.name} Payout Schedule
          </h1>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center bg-downy-50 px-4 py-2 rounded-lg">
              <IoMdCalendar className="text-downy-600 mr-2" />
              <div>
                <p className="text-xs text-gray-600">Cycle Start</p>
                <p className="font-medium">
                  {dayjs(chama.startDate).format("MMM D, YYYY")}
                </p>
              </div>
            </div>
            <div className="flex items-center bg-downy-50 px-4 py-2 rounded-lg">
              <FiClock className="text-downy-600 mr-2" />
              <div>
                <p className="text-xs text-gray-600">Current Round</p>
                <p className="font-medium">
                  {currentRoundIndex === -1
                    ? "Completed"
                    : `Round ${currentRoundIndex + 1}`}
                </p>
              </div>
            </div>
            <div className="flex items-center bg-downy-50 px-4 py-2 rounded-lg">
              <FiDollarSign className="text-downy-600 mr-2" />
              <div>
                <p className="text-xs text-gray-600">Amount</p>
                <p className="font-medium">
                  {Number(formatEther(chama.amount))} cUSD
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <FiUser className="mr-2 text-downy-600" />
            Member Payout Timeline
          </h2>

          <VerticalTimeline lineColor="#e5e7eb" className="!w-full">
            {sortedMembers.map((member, index) => {
              const isPaid = dayjs().isAfter(member.payoutDate);
              const isCurrent = index === currentRoundIndex;
              const isUpcoming = index > currentRoundIndex;

              const icon = isPaid ? (
                <FaCheckCircle className="text-white" />
              ) : (
                <FaHourglassHalf className="text-white" />
              );

              const iconBg = isPaid
                ? "bg-green-500"
                : isCurrent
                ? "bg-downy-500"
                : "bg-gray-400";

              const dateColor = isCurrent
                ? "text-downy-600 font-semibold"
                : "text-gray-500";

              const cardBg = isCurrent
                ? "bg-downy-50 border-downy-200"
                : "bg-white border-gray-200";

              return (
                <VerticalTimelineElement
                  key={member.id}
                  className="vertical-timeline-element--work"
                  contentStyle={{
                    background: "transparent",
                    boxShadow: "none",
                    padding: "0 0 20px 0",
                  }}
                  contentArrowStyle={{ display: "none" }}
                  date={dayjs(member.payoutDate).format("MMM D, YYYY")}
                  dateClassName={`text-sm ${dateColor}`}
                  iconStyle={{
                    background: iconBg,
                    boxShadow:
                      "0 0 0 4px #fff, inset 0 2px 0 rgba(0,0,0,.08), 0 3px 0 4px rgba(0,0,0,.05)",
                  }}
                  icon={icon}
                >
                  <div className={`p-4 border rounded-lg ${cardBg}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {member.user.name || `Member ${member.position}`}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {member.user.address.slice(0, 6)}...
                          {member.user.address.slice(-4)}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isPaid
                            ? "bg-green-100 text-green-800"
                            : isCurrent
                            ? "bg-downy-100 text-downy-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {isPaid ? "Paid" : isCurrent ? "Current" : "Upcoming"}
                      </span>
                    </div>
                    {isCurrent && (
                      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center text-sm text-downy-600">
                        <FiClock className="mr-2" />
                        <span>
                          {dayjs(member.payoutDate).isBefore(dayjs())
                            ? "Payment due now"
                            : `Due in ${dayjs(member.payoutDate).fromNow(
                                true
                              )}`}
                        </span>
                      </div>
                    )}
                  </div>
                </VerticalTimelineElement>
              );
            })}
          </VerticalTimeline>
        </div>
      </div>
    </div>
  );
};

export default ChamaSchedule;
