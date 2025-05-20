import React from "react";
import dayjs from "dayjs";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { FaCheckCircle, FaHourglassHalf } from "react-icons/fa";

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

      <VerticalTimeline lineColor="#0e7490">
        {sortedMembers.map((member, index) => {
          const isPaid = dayjs().isAfter(member.payoutDate, "day");
          const isNext =
            index ===
            sortedMembers.findIndex((m) =>
              dayjs(m.payoutDate).isAfter(dayjs(), "day")
            );

          const icon = isPaid ? (
            <FaCheckCircle />
          ) : (
            <FaHourglassHalf />
          );

          const iconStyle = isPaid
            ? { background: "#bbf7d0", color: "#15803d" } // green
            : { background: "#fef08a", color: "#b45309" }; // yellow

          const cardBg = isNext
            ? "#dbeafe" // light blue for the upcoming one
            : "#ecfeff"; // default background

          return (
            <VerticalTimelineElement
              key={member.id}
              date={dayjs(member.payoutDate).format("MMM D, YYYY")}
              icon={icon}
              iconStyle={iconStyle}
              contentStyle={{ background: cardBg, color: "#0f172a" }}
              contentArrowStyle={{ borderRight: `7px solid ${cardBg}` }}
            >
              <h4 className="text-lg font-semibold mb-1">
                {member.user.name || `Member ${index + 1}`}
              </h4>
              <p className="text-sm">
                <span className="font-medium">Wallet:</span>{" "}
                {member.user.address.slice(0, 10)}...
              </p>
              <p className="mt-1">
                Status:{" "}
                <span
                  className={`font-semibold ${
                    isPaid ? "text-green-700" : "text-yellow-600"
                  }`}
                >
                  {isPaid ? "Paid" : "Pending"}
                </span>
              </p>
            </VerticalTimelineElement>
          );
        })}
      </VerticalTimeline>
    </div>
  );
};

export default ChamaSchedule;
