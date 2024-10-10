"use client";

import React, { useEffect, useState } from "react";
import Withdrawals from "./Withdrawals";
import Deposits from "./Deposits";
import dayjs from "dayjs";
import { useAccount, useReadContract } from "wagmi";
import { contractAbi, contractAddress } from "../ChamaPayABI/ChamaPayContract";
import { getUser } from "../../lib/chama";
import { Suspense } from "react";

type Member = {
  name: string;
  date: string;
};

type ChamaDetailsTuple = [
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  string,
  string[]
];

const Schedule = ({ chamaId, type }: { chamaId: number; type: string }) => {
  const [showDeposit, setShowDeposit] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [members, setMembers] = useState<string[]>([]);
  const [round, setRound] = useState(0);
  const [duration, setDuration] = useState(0);
  const [beginDate, setBeginDate] = useState(0);
  const [userDetails, setUserDetails] = useState<{ [key: string]: any }>({});
  const [balance, setBalance] = useState(0); // New state for balance
  const { isConnected, address } = useAccount();

  const {
    data: chamaDetails,
    isError,
    isLoading,
  } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "getChama",
    args: [BigInt(chamaId - 3)], // Example chamaId, replace 0 with actual chamaId when needed
  });

  const { data: chamaBalance } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "getBalance",
    args: [BigInt(chamaId - 3), address], // Example chamaId, replace 0 with actual chamaId when needed
  });

  const startDate = beginDate; // Start date of the chama cycle
  //at this time, the cycle starts from first payout
  const firstPayoutDate = beginDate + duration * 24 * 60 * 60 * 1000;
  const endDate = beginDate + duration * 24 * 60 * 60 * 1000 * members.length; // End date of the chama cycle (calculated based on members)
  const totalDays = dayjs(endDate).diff(dayjs(startDate), "day");

  useEffect(() => {
    // Calculate the progress percentage based on today's date
    const today = dayjs();
    const elapsedDays = today.diff(dayjs(startDate), "day");
    const progress = (elapsedDays / totalDays) * 100;
    setProgressPercentage(progress);
  }, [startDate, totalDays]);

  useEffect(() => {
    if (chamaDetails) {
      const results = chamaDetails as ChamaDetailsTuple | undefined;
      console.log(results);
      if (results && Array.isArray(results[7])) {
        setMembers(results[7]); // Set members based on addresses from the contract
        setDuration(Number(results[3])); // Set duration from contract data
        setRound(Number(results[4])); // Set the current round from contract data
        setBeginDate(Number(results[2])); // Set the start date of the chama
      }
    }
  }, [chamaDetails]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (members.length > 0) {
        const details = await Promise.all(
          members.map(async (address) => {
            const userData = await getUser(address); // Fetch user details from your API
            return { address, userData }; // Return address and userData pair
          })
        );

        const userDetailsMap = details.reduce(
          (acc, { address, userData }) => ({
            ...acc,
            [address]: userData, // Store user data keyed by address
          }),
          {}
        );
        setUserDetails(userDetailsMap); // Store the user details
      }
    };

    fetchUserDetails(); // Call the function
  }, [members]);

  useEffect(() => {
    // Add your logic here to get the balance for the current user

    if (chamaBalance) {
      const result = Number(chamaBalance) / 10 ** 18;
      console.log(result);
      setBalance(result);
    }
  }, [chamaBalance]);

  // Helper to calculate each member's position and payout date
  const calculateMemberPosition = (index: number) => {
    // Calculate each member's angle based on their index
    const angle = (index / members.length) * 360;
    return `rotate(${angle}deg) translate(140px) rotate(-${angle}deg)`;
  };

  const calculatePayoutDate = (index: number) => {
    // Calculate the payout date for each member based on the startDate and duration
    return dayjs(firstPayoutDate)
      .add(index * duration, "day")
      .format("DD MMM");
  };

  const toggleView = (type: string) => {
    setShowDeposit(type === "deposits");
  };

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center p-4">
      {/* Top right balance display */}
      {type === "Public" ? (
        <div className="flex items-center bg-downy-50 w-fit px-4 py-2 border shadow-md rounded-full border-downy-300">
          <div className="flex flex-col">
            <h1 className="text-center">Chama Balance</h1>
            <div className="flex items-center justify-between ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-downy-500 mr-1"
              >
                <path
                  fillRule="evenodd"
                  d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-600">0 cKES</span>
              <div className="w-[1px] h-6 bg-gray-400 mx-4"></div>{" "}
              {/* Vertical Divider */}
              <span className="text-gray-700">{balance} cKES</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex  right-2 sm:top-2 sm:right-0 bg-downy-50 border border-downy-300 shadow-md justify-end p-2 sm:p-2 rounded-md z-50">
          <div className="flex flex-col items-center">
            <p className="font-normal text-gray-800">Chama Balance</p>
            <p className="font-normal text-gray-600">{balance} cKES</p>
          </div>
        </div>
      )}

      {/* Cycle progress container */}
      <div className="relative mt-12">
        <Suspense fallback={<div className="items-center">Loading...</div>}>
          <div
            className="relative w-[250px] h-[250px] rounded-full bg-white flex justify-center items-center"
            style={{
              background: `conic-gradient(#66d9d0 ${progressPercentage}%, #d1f6f1 ${progressPercentage}% 100%)`,
            }}
          >
            {/* Inner circle */}
            <div className="absolute w-[180px] h-[180px] bg-white rounded-full flex justify-center items-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold">CYCLE</h1>
                <p className="text-6xl font-semibold mt-4">{round}</p>
              </div>
            </div>

            {/* Member clouds */}
            {members.map((address, index) => (
              <div
                key={address}
                className="absolute flex flex-col items-center justify-center w-[100px] h-[60px] rounded-full bg-downy-400 shadow-lg p-2"
                style={{
                  transform: calculateMemberPosition(index),
                }}
              >
                <p className="text-sm font-bold">
                  {userDetails[address]?.name || "Unknown"}
                </p>
                <p className="text-xs">{calculatePayoutDate(index)}</p>
              </div>
            ))}
          </div>
        </Suspense>
      </div>

      {/* Payment History */}
      <div className="mt-12 w-full flex flex-col items-center">
        <h1 className="text-2xl font-semibold mb-2">Payment History</h1>
        <div className="flex mb-2 rounded-lg py-1 bg-gray-300 w-full relative">
          <button
            onClick={() => toggleView("withdrawals")}
            className={`rounded-md w-1/2 py-1 hover:bg-downy-300 ${
              !showDeposit ? "bg-downy-500" : "bg-transparent"
            }`}
          >
            Withdrawals
          </button>
          <button
            onClick={() => toggleView("deposits")}
            className={`rounded-md w-1/2 py-1 hover:bg-downy-300 ${
              showDeposit ? "bg-downy-500" : "bg-transparent"
            }`}
          >
            Deposits
          </button>
        </div>

        {/* Conditionally render Withdrawals or Deposits */}
        <div className="mt-2 w-full px-4">
          {!showDeposit ? (
            <Withdrawals cycle={round} />
          ) : (
            <Deposits chamaId={chamaId} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
