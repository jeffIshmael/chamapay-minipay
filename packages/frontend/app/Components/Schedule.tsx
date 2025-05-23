"use client";

import React, { useEffect, useState } from "react";
import Withdrawals from "./Withdrawals";
import Deposits from "./Deposits";
import dayjs from "dayjs";
import { useAccount, useReadContract } from "wagmi";
import { contractAbi, contractAddress } from "../ChamaPayABI/ChamaPayContract";
import { motion, AnimatePresence } from "framer-motion";
import { FiDollarSign, FiClock, FiLock } from "react-icons/fi";
import { formatEther } from "viem";
import { formatTimeRemaining } from "@/lib/paydate";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
// @ts-ignore
import LiquidFillGauge from "react-liquid-gauge";
import { IoMdCalendar, IoMdPerson, IoMdWallet } from "react-icons/io";
import { toast } from "sonner";
import { showToast } from "./Toast";

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

const Schedule = ({
  chama,
  type,
  payoutOrder,
}: {
  chama: Chama;
  type: string;
  payoutOrder: string | null;
}) => {
  const [showDeposit, setShowDeposit] = useState(false);
  const [members, setMembers] = useState<User[]>([]);
  const [round, setRound] = useState(0);
  const [balance, setBalance] = useState<Account | []>([]);
  const [cycle, setCycle] = useState(0);
  const { address } = useAccount();
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [timeUntilStart, setTimeUntilStart] = useState("");
  const [timeUntilUserPayout, setTimeUntilUserPayout] = useState("");
  const [userPayoutProgress, setUserPayoutProgress] = useState(0);

  const { data } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "getBalance",
    args: [BigInt(Number(chama.blockchainId)), address],
  });

  const payoutOrderArray: User[] = payoutOrder ? JSON.parse(payoutOrder) : chama.members;

  // Update your useEffect for initial data loading
  useEffect(() => {
    if (data) {
      setBalance(data as Account);
      setMembers(payoutOrderArray);
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
  // const calculateProgress = () => {
  //   if (!chama?.startDate || !chama?.cycleTime || !chama?.members) return 0;

  //   const startDate = new Date(chama.startDate);
  //   const startTime = startDate.getTime();

  //   // Total duration = cycleTime (in days) × number of members
  //   const totalDays = chama.cycleTime * chama.members.length;
  //   const totalMilliseconds = totalDays * 24 * 60 * 60 * 1000; // convert days to ms

  //   const endTime = startTime + totalMilliseconds;
  //   const currentTime = Date.now();

  //   if (currentTime < startTime) return 0;
  //   if (currentTime >= endTime) return 100;

  //   const elapsedDuration = currentTime - startTime;
  //   return Math.min((elapsedDuration / totalMilliseconds) * 100, 100);
  // };

  // const progress = calculateProgress();

  //function to ge a members payout date
  const getMemberPayoutDate = (memberIndex: number) => {
    if (!chama?.startDate || !chama.cycleTime) return "";
    const payoutDate = new Date(chama?.startDate);
    payoutDate.setDate(
      payoutDate.getDate() + chama.cycleTime * (memberIndex + 1)
    );
    return payoutDate;
  };

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

  // Calculate user's payout date and progress
  useEffect(() => {
    if (!chama.started || !address) return;

    const updateUserPayoutInfo = async () => {
      const userIndex = chama.members.findIndex(
        (m) => m.user.address === address
      );
      if (userIndex === -1) return;

      const userPayoutDate = getMemberPayoutDate(userIndex);
      const now = dayjs();
      const payoutDate = dayjs(userPayoutDate);

      if (now.isAfter(payoutDate)) {
        setTimeUntilUserPayout("Payment due now");
        setUserPayoutProgress(100);
      } else {
        const diff = payoutDate.diff(now);
        setTimeUntilUserPayout(await formatTimeRemaining(diff));

        // Calculate progress (0-100) based on time remaining
        const cycleDuration = chama.cycleTime * 24 * 60 * 60 * 1000;
        const elapsed = cycleDuration - diff;
        const progress = Math.min((elapsed / cycleDuration) * 100, 100);
        setUserPayoutProgress(progress);
      }
    };

    updateUserPayoutInfo();
    const interval = setInterval(updateUserPayoutInfo, 1000);
    return () => clearInterval(interval);
  }, [chama, address, currentTime]);

  // Calculate member position around the circle
  const calculateMemberPosition = (index: number) => {
    const angle = (index / members.length) * 360;
    return `rotate(${angle}deg) translate(140px) rotate(-${angle}deg)`;
  };

  const isLiquidHigh = userPayoutProgress > 50; // adjust threshold as needed
  const textColor = isLiquidHigh ? "text-white" : "text-gray-800";
  const subTextColor = isLiquidHigh ? "text-gray-200" : "text-gray-500";

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

  const renderProgressIndicator = () => {
    if (!chama.started) {
      return (
        <div className="relative w-64 h-64 rounded-full bg-white shadow-lg">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(#66d9d0 0% 100%, #d1f6f1 0% 100%)`,
            }}
          />
          <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
            <FiClock className="text-downy-500 mb-2 animate-pulse" size={28} />
            <p className="text-sm text-gray-500">Starts in</p>
            <p className="text-2xl font-semibold text-downy-600 mt-1">
              {timeUntilStart}
            </p>
          </div>
        </div>
      );
    }
    

    // Only render liquid gauge if we have valid user data
    const userIndex = chama.members.findIndex(
      (m) => m.user.address === address
    );
    if (userIndex === -1) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">You are not a member of this chama</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48">
          <LiquidFillGauge
            value={Math.round(userPayoutProgress)}
            width={200}
            height={200}
            textSize={1}
            textOffsetX={0}
            textOffsetY={0}
            riseAnimation
            waveAnimation
            waveFrequency={2}
            waveAmplitude={1}
            gradient
            circleStyle={{
              fill: "#06b6d4",
            }}
            waveStyle={{
              fill: "#06b6d4",
            }}
            textRenderer={() => null} // Disable default text
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <FiClock className="text-downy-500 mb-2" size={24} />
            <p className="text-xl font-semibold text-downy-600 mt-1">
              {timeUntilUserPayout}
            </p>
            <p
              className={`transition-colors duration-300 text-sm ${subTextColor} mt-1`}
            >
              To your payout
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">
          Your payout date:{" "}
          {dayjs(getMemberPayoutDate(userIndex)).format("MMM D, YYYY h:mm A")}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-downy-100 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-downy-600 to-downy-700 px-6 pt-8 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white">{chama.name}</h1>
            <p className="text-downy-100">{type} Chama</p>
          </div>

          {/* Balance Card */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <IoMdWallet className="text-white" />
                <p className="text-white text-sm font-medium">Chama Balance</p>
              </div>

              {type === "Public" ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1 bg-downy-600  rounded-md p-2">
                    <FiDollarSign className="text-white" size={14} />
                    <span className="text-white font-semibold text-sm">
                      {userBalance.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 bg-downy-600  rounded-md p-2">
                    <FiLock className="text-white" size={14} />
                    <span className="text-white font-semibold text-sm">
                      {lockedAmount.toFixed(3)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <FiDollarSign className="text-white" size={14} />
                  <span className="text-white font-semibold">
                    {userBalance.toFixed(3)} cUSD
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cycle Progress */}
      <div className="px-2 mt-2 bg-white p-4 rounded-2xl shadow-md border border-gray-100">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              {chama.started ? "Your Payout Progress" : "Cycle Progress"}
            </h2>
            <div className="bg-downy-100 text-downy-600 px-3 py-1 rounded-full text-sm font-medium">
              Cycle {cycle}
            </div>
          </div>
          {renderProgressIndicator()}
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 text-center">
          {/* Next Payout */}
          <div className="bg-downy-50 p-2 rounded-lg">
            <FiClock className="mx-auto text-downy-600" />
            <p className="text-xs font-semibold text-gray-600 mt-1">
              Next Payout
            </p>
            {!chama.started ? (
              <p className="text-xs text-gray-500 mt-1">---</p>
            ) : (
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-between w-full">
                  <IoMdCalendar className="text-gray-500" />
                  <p className="text-xs font-semibold text-gray-500 mt-1">
                    {dayjs(chama.payDate).utc().local().format("MMM D, YYYY")}
                  </p>
                </div>
                <div className="flex items-center justify-between w-full">
                  <FiClock className="text-gray-500" />
                  <p className="text-xs font-semibold text-gray-500 mt-1 mr-2">
                    {dayjs(chama.payDate).utc().local().format("h:mm A")}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Receiver */}
          <div className="bg-downy-50 p-2 rounded-lg">
            <IoMdPerson className="mx-auto text-downy-600" />
            <p className="text-xs text-gray-600 font-semibold mt-1">Receiver</p>
            {!chama?.startDate ||
            currentTime < new Date(chama.startDate).getTime() ? (
              <p className="text-xs text-gray-500 mt-2">---</p>
            ) : getCurrentRecipient()?.address === address?.toString() ? (
              <div className="flex items-center flex-col">
                <span className="text-2xl">🎉</span>
                <p className=" text-downy-600 font-semibold mt-1">You</p>
              </div>
            ) : (
              <>
                <p className="font-semibold text-xs text-gray-500 mt-2">
                  {getCurrentRecipient()?.name?.split(" ")[0] || "Member"}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      getCurrentRecipient()?.address || ""
                    );
                    showToast("Address copied to clipboard", "info");
                  }}
                  className="text-xs text-gray-600 mt-1 hover:text-downy-600 bg-downy-200 border border-gray-200 rounded-md p-1"
                >
                  {getCurrentRecipient()?.address?.slice(0, 6)}...
                  {getCurrentRecipient()?.address?.slice(-4)}
                </button>
              </>
            )}
          </div>

          {/* Amount */}
          <div className="bg-downy-50 p-2 rounded-lg">
            <FiDollarSign className="mx-auto text-downy-600" />
            <p className="text-xs font-bold text-gray-600 mt-1">Amount</p>
            {!chama?.startDate ||
            currentTime < new Date(chama.startDate).getTime() ? (
              <p className="text-xs text-gray-500 mt-1">---</p>
            ) : (
              <p className="text-xs font-semibold text-gray-500 mt-2">
                {Number(formatEther(chama.amount)) * members.length} cUSD
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="px-2 mt-2">
        <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100">
          <div className="flex border-b border-gray-200 pb-2 mb-4">
            <button
              onClick={() => toggleView("withdrawals")}
              className={`flex-1 py-2 font-medium bg-transparent rounded-md ${
                !showDeposit
                  ? "text-downy-600 border-b-2 border-downy-500"
                  : "text-gray-500"
              }`}
            >
              Payouts{" "}
            </button>
            <button
              onClick={() => toggleView("deposits")}
              className={`flex-1 py-2 font-medium bg-transparent rounded-md ${
                showDeposit
                  ? "text-downy-600 border-b-2 border-downy-500"
                  : "text-gray-500"
              }`}
            >
              Deposits
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
              {!showDeposit ? (
                <Withdrawals chamaId={chama.id} />
              ) : (
                <Deposits chamaId={chama.id} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
