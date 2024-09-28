"use client";

import React, { useEffect, useState } from "react";
import Withdrawals from "./Withdrawals";
import Deposits from "./Deposits";
import dayjs from "dayjs";
import { useAccount, useReadContract } from "wagmi";
import { contractAbi, contractAddress } from "../ChamaPayABI/ChamaPayContract";
import { getUser } from "../api/chama";
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

const Schedule = ({ chamaId }: { chamaId: number }) => {
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
    args: [BigInt(chamaId - 3)], // Example chamaId, replace 0 with actual chamaId when needed
  });

  const startDate = beginDate; // Start date of the chama cycle
  const endDate = beginDate + duration * members.length; // End date of the chama cycle (calculated based on members)
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

    if (isConnected && address) {
      const result = Number(chamaBalance)/10**18;
      console.log(result);
      setBalance(result);
    }
  }, [chamaBalance, address]);

  // Helper to calculate each member's position and payout date
  const calculateMemberPosition = (index: number) => {
    // Calculate each member's angle based on their index
    const angle = (index / members.length) * 360;
    return `rotate(${angle}deg) translate(140px) rotate(-${angle}deg)`;
  };

  const calculatePayoutDate = (index: number) => {
    // Calculate the payout date for each member based on the startDate and duration
    return dayjs(startDate)
      .add(index * duration, "day")
      .format("DD MMM");
  };

  const toggleView = (type: string) => {
    setShowDeposit(type === "deposits");
  };

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center p-4">
      {/* Top right balance display */}
      <div className="absolute top-4 right-4 bg-white shadow-md p-4 rounded-md">
        <h3 className="text-lg font-bold">My chama Bal</h3>
        <p className="text-2xl font-semibold">{balance} cKES</p>
      </div>

      {/* Cycle progress container */}
      <div className="relative mt-14">
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
