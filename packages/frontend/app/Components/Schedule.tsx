"use client";

import React, { useEffect, useState } from "react";
import Withdrawals from "./Withdrawals";
import Deposits from "./Deposits";
import dayjs from "dayjs";
import { useAccount, useReadContract } from "wagmi";
import { contractAbi, contractAddress } from "../ChamaPayABI/ChamaPayContract";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiDollarSign,
  FiClock,
  FiLock,
  FiCalendar,
  FiUsers,
} from "react-icons/fi";
import { formatEther } from "viem";
import { formatTimeRemaining } from "@/lib/paydate";
import { IoMdCalendar, IoMdPerson, IoMdWallet } from "react-icons/io";
import { toast } from "sonner";
import { showToast } from "./Toast";
import { TbProgress } from "react-icons/tb";

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

type Account = [bigint, bigint];

const Schedule = ({ chama, type }: { chama: Chama; type: string }) => {
  const [showDeposit, setShowDeposit] = useState(false);
  const [activeTab, setActiveTab] = useState<"personal" | "chama">("personal");
  const [members, setMembers] = useState<User[]>([]);
  const [round, setRound] = useState(0);
  const [balance, setBalance] = useState<Account | []>([]);
  const [cycle, setCycle] = useState(0);
  const { address } = useAccount();
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [timeUntilStart, setTimeUntilStart] = useState("");

  const { data } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "getBalance",
    args: [BigInt(Number(chama.blockchainId)), address],
  });

  // Update your useEffect for initial data loading
  useEffect(() => {
    if (data) {
      setBalance(data as Account);
      setMembers(chama.members);
      setRound(chama.round);
      setCycle(chama.cycle);
    }
  }, [data, chama]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000); // update every second

    return () => clearInterval(interval); // cleanup when component unmounts
  }, []);

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!chama?.startDate || !chama?.cycleTime || !chama?.members) return 0;

    const startDate = new Date(chama.startDate);
    const startTime = startDate.getTime();

    // Total duration = cycleTime (in days) × number of members
    const totalDays = chama.cycleTime * chama.members.length;
    const totalMilliseconds = totalDays * 24 * 60 * 60 * 1000; // convert days to ms

    const endTime = startTime + totalMilliseconds;
    const currentTime = Date.now();

    if (currentTime < startTime) return 0;
    if (currentTime >= endTime) return 100;

    const elapsedDuration = currentTime - startTime;
    return Math.min((elapsedDuration / totalMilliseconds) * 100, 100);
  };

  const progress = calculateProgress();

  //function to ge a members payout date
  // const getMemberPayoutDate = (memberIndex: number) => {
  //   if (!chama?.startDate || !chama.cycleTime) return "";
  //   const payoutDate = new Date(chama?.startDate);
  //   payoutDate.setDate(
  //     payoutDate.getDate() + chama.cycleTime * (memberIndex + 1)
  //   );
  //   return payoutDate;
  // };

  useEffect(() => {
    let mounted = true;

    const updateTime = async () => {
      if (!chama?.startDate) return;

      const startTime = new Date(chama.startDate).getTime();
      const diff = startTime - currentTime;
      const result =
        diff <= 0 ? "Starting..." : await formatTimeRemaining(diff);
      if (mounted) {
        setTimeUntilStart(result);
      }
    };

    const interval = setInterval(updateTime, 1000);
    updateTime(); // Initial call

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [chama?.startDate, currentTime]);

  // Calculate member position around the circle
  const calculateMemberPosition = (index: number) => {
    const angle = (index / members.length) * 360;
    return `rotate(${angle}deg) translate(140px) rotate(-${angle}deg)`;
  };

  const toggleView = (type: string) => {
    setShowDeposit(type === "deposits");
  };

  // function to get user to receive payout next
  const getCurrentRecipient = () => {
    if (
      !chama?.startDate ||
      currentTime < new Date(chama.startDate).getTime()
    ) {
      return null;
    }

    // Calculate current round index (0-based)
    const startTime = new Date(chama.startDate).getTime();
    const elapsedTime = currentTime - startTime;
    const cycleDuration = chama.cycleTime * 24 * 60 * 60 * 1000;
    const currentRoundIndex =
      Math.floor(elapsedTime / cycleDuration) % members.length;

    return members[currentRoundIndex]?.user;
  };

  const lockedAmount = balance[1] ? Number(balance[1]) / 10 ** 18 : 0;
  const userBalance = balance[0] ? Number(balance[0]) / 10 ** 18 : 0;
  const getMemberPayoutDate = (index: number) => {
    if (!chama.startDate || !chama.cycleTime) return new Date();
    return dayjs(chama.startDate)
      .add(chama.cycleTime * (index + 1), "day")
      .toDate();
  };

  // Find current user's position and details
  const currentUser = chama.members.find((m) => m.user.address === address);
  const userIndex = chama.members.findIndex((m) => m.user.address === address);
  const userPayDate = getMemberPayoutDate(userIndex);

  // Personal Schedule View
  const PersonalSchedule = () => (
    <div className="space-y-4">
      {/* Balance Card */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-800">Your Chama Balance</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-downy-100 text-downy-800 px-2 py-1 rounded-full">
              Cycle {chama.cycle}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-downy-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <FiDollarSign className="text-downy-600" />
              <span className="text-sm font-medium">Available</span>
            </div>
            <p className="text-xl font-bold mt-1">
              {userBalance.toFixed(2)} cUSD
            </p>
          </div>

          <div className="bg-downy-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <FiLock className="text-downy-600" />
              <span className="text-sm font-medium">Locked</span>
            </div>
            <p className="text-xl font-bold mt-1">
              {lockedAmount.toFixed(2)} cUSD
            </p>
          </div>
        </div>
      </div>

      {/* Next Payout */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-medium text-gray-800 mb-3">Your Next Payout</h3>

        <div className="flex items-center justify-center">
          <div className="relative w-40 h-40">
            {/* Circular progress */}
            <div className="absolute inset-0 rounded-full border-8 border-downy-100 flex items-center justify-center">
              <div className="text-center">
                <FiCalendar className="mx-auto text-downy-500 text-2xl mb-2" />
                <p className="text-sm text-gray-500">Your turn on</p>
                <p className="font-bold text-downy-600">
                  {dayjs(userPayDate).format("MMM D")}
                </p>
              </div>
            </div>

            {/* Progress indicator */}
            <div
              className="absolute inset-0 rounded-full border-8 border-transparent"
              style={{
                borderTopColor: "#06b6d4",
                borderRightColor: "#06b6d4",
                transform: `rotate(${calculateUserProgress()}deg)`,
              }}
            />
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {dayjs(userPayDate).format("dddd, MMMM D, YYYY [at] h:mm A")}
          </p>
          {dayjs(userPayDate).isAfter(dayjs()) && (
            <p className="text-downy-600 font-medium mt-1">
              {formatTimeRemaining(dayjs(userPayDate).diff(dayjs()))} remaining
            </p>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-200 pb-2 mb-4">
          <button
            onClick={() => setShowDeposit(false)}
            className={`flex-1 py-2 font-medium ${
              !showDeposit
                ? "text-downy-600 border-b-2 border-downy-500"
                : "text-gray-500"
            }`}
          >
            Your Payouts
          </button>
          <button
            onClick={() => setShowDeposit(true)}
            className={`flex-1 py-2 font-medium ${
              showDeposit
                ? "text-downy-600 border-b-2 border-downy-500"
                : "text-gray-500"
            }`}
          >
            Your Deposits
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={showDeposit ? "deposits" : "withdrawals"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {showDeposit ? (
              <Deposits chamaId={chama.id} />
            ) : (
              <Withdrawals chamaId={chama.id} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );

  // Chama Schedule View
  const ChamaSchedule = () => (
    <div className="space-y-4">
      {/* Cycle Overview */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-medium text-gray-800 mb-3">Cycle Overview</h3>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-downy-50 p-3 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-1">
              <FiUsers className="text-downy-600" />
              <span className="text-sm">Members</span>
            </div>
            <p className="text-xl font-bold mt-1">{chama.members.length}</p>
          </div>

          <div className="bg-downy-50 p-3 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-1">
              <TbProgress className="text-downy-600" />
              <span className="text-sm">Round</span>
            </div>
            <p className="text-xl font-bold mt-1">
              {chama.round}/{chama.members.length}
            </p>
          </div>

          <div className="bg-downy-50 p-3 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-1">
              <FiDollarSign className="text-downy-600" />
              <span className="text-sm">Amount</span>
            </div>
            <p className="text-xl font-bold mt-1">
              {Number(formatEther(chama.amount))} cUSD
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Cycle Progress</span>
            <span className="text-sm font-bold text-downy-600">
              {Math.round(calculateCycleProgress())}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-downy-500 h-2 rounded-full"
              style={{ width: `${calculateCycleProgress()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timeline View */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-medium text-gray-800 mb-3">Payout Schedule</h3>

        <div className="space-y-4">
          {chama.members.map((member, index) => (
            <div
              key={member.id}
              className={`p-3 rounded-lg border ${
                member.user.address === address
                  ? "border-downy-500 bg-downy-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index < chama.round
                        ? "bg-green-100 text-green-800"
                        : index === chama.round
                        ? "bg-downy-100 text-downy-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">
                      {member.user.name || `Member ${index + 1}`}
                      {member.user.address === address && (
                        <span className="ml-2 text-xs bg-downy-100 text-downy-800 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {dayjs(getMemberPayoutDate(index)).format("MMM D, YYYY")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-medium ${
                      index < chama.round
                        ? "text-green-600"
                        : index === chama.round
                        ? "text-downy-600"
                        : "text-gray-500"
                    }`}
                  >
                    {index < chama.round
                      ? "Completed"
                      : index === chama.round
                      ? "Current"
                      : "Upcoming"}
                  </p>
                  {index === chama.round && (
                    <p className="text-xs text-downy-500">
                      {formatTimeRemaining(
                        dayjs(getMemberPayoutDate(index)).diff(dayjs())
                      )}{" "}
                      left
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Payouts */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-medium text-gray-800 mb-3">All Payouts</h3>
        <Withdrawals chamaId={chama.id} />
      </div>
    </div>
  );

  // Helper functions
  const calculateUserProgress = () => {
    if (!chama.startDate || !userPayDate) return 0;
    const now = dayjs();
    const start = dayjs(chama.startDate);
    const end = dayjs(userPayDate);

    if (now.isBefore(start)) return 0;
    if (now.isAfter(end)) return 360;

    const total = end.diff(start);
    const elapsed = now.diff(start);
    return (elapsed / total) * 360;
  };

  const calculateCycleProgress = () => {
    if (!chama.startDate || !chama.cycleTime) return 0;
    const now = dayjs();
    const start = dayjs(chama.startDate);
    const end = start.add(chama.cycleTime * chama.members.length, "day");

    if (now.isBefore(start)) return 0;
    if (now.isAfter(end)) return 100;

    const total = end.diff(start);
    const elapsed = now.diff(start);
    return (elapsed / total) * 100;
  };

  return (
    <div className="min-h-screen bg-downy-100 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-downy-600 to-downy-700 px-6 pt-8 pb-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold text-white">{chama.name}</h1>
        <p className="text-downy-100">
          {type} Chama • Cycle {chama.cycle}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 mt-4">
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab("personal")}
            className={`flex-1 py-2 text-center font-medium rounded-lg ${
              activeTab === "personal"
                ? "bg-downy-500 text-white"
                : "text-gray-600"
            }`}
          >
            Personal Schedule
          </button>
          <button
            onClick={() => setActiveTab("chama")}
            className={`flex-1 py-2 text-center font-medium rounded-lg ${
              activeTab === "chama"
                ? "bg-downy-500 text-white"
                : "text-gray-600"
            }`}
          >
            Chama Schedule
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 mt-4 pb-6">
        {activeTab === "personal" ? <PersonalSchedule /> : <ChamaSchedule />}
      </div>
    </div>
  );
};

export default Schedule;
