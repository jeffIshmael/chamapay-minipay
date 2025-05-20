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
} from "react-icons/fi";
import { formatEther } from "viem";
import { formatTimeRemaining } from "@/lib/paydate";
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
    fid: number| null;
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
      <div className="px-2 mt-2">
        <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Cycle Progress</h2>
            <div className="bg-downy-100 text-downy-600 px-3 py-1 rounded-full text-sm font-medium">
              Cycle {cycle}
            </div>
          </div>

          {/* Progress Circle */}
          <div className="relative mx-auto w-[200px] h-[200px]">
            <div
              className="absolute w-full h-full rounded-full"
              style={{
                background: `conic-gradient(#66d9d0 ${progress}%, #e5f7f5 ${progress}% 100%)`,
              }}
            >
              <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                {chama?.startDate &&
                currentTime < new Date(chama.startDate).getTime() ? (
                  <div className="flex flex-col items-center">
                    <FiClock className="text-downy-500 mb-2" size={24} />
                    <p className="text-sm text-gray-500">Starts in</p>
                    <p className="text-xl text-downy-500 mt-1">
                      {timeUntilStart}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-gray-500">Current Round</span>
                    <p className="text-4xl font-bold text-downy-600 mt-1">
                      {round}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Member Indicators */}
            {members.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="absolute top-1/2 left-1/2 w-16 h-16 -ml-8 -mt-8 flex flex-col items-center justify-center"
                style={{
                  transform: calculateMemberPosition(index),
                }}
              >
                {/* <div className="bg-downy-500 text-white text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                  {index + 1}
                </div> */}
                <div className="absolute -bottom-6 text-xs font-medium text-center border border-gray-200 rounded-md p-2 w-20">
                  <p className="truncate">
                    {chama?.startDate &&
                    currentTime < new Date(chama.startDate).getTime()
                      ? "---"
                      : member.user.name?.split(" ")[0] || "Member"}
                  </p>
                  <p className="text-downy-600">
                    {chama?.startDate &&
                    currentTime < new Date(chama.startDate).getTime()
                      ? "---"
                      : dayjs(getMemberPayoutDate(index)).format(
                          "MMM D, YYYY h:mm A"
                        )}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 text-center">
            {/* Next Payout */}
            <div className="bg-downy-50 p-2 rounded-lg">
              <FiClock className="mx-auto text-downy-600" />
              <p className="text-xs font-semibold text-gray-600 mt-1">
                Next Payout
              </p>
              {!chama?.startDate ||
              currentTime < new Date(chama.startDate).getTime() ? (
                <p className="text-xs text-gray-500 mt-1">---</p>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-between w-full">
                    <IoMdCalendar className="text-gray-500" />
                    <p className="text-xs font-semibold text-gray-500 mt-1">
                      {dayjs(chama.payDate).format("MMM D, YYYY")}
                    </p>
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <FiClock className="text-gray-500" />
                    <p className="text-xs font-semibold text-gray-500 mt-1 mr-2">
                      {dayjs(chama.payDate).format("h:mm A")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Receiver */}
            <div className="bg-downy-50 p-2 rounded-lg">
              <IoMdPerson className="mx-auto text-downy-600" />
              <p className="text-xs text-gray-600 font-semibold mt-1">
                Receiver
              </p>
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