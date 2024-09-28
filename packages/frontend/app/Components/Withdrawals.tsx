"use client";

import React, { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { contractAddress, contractAbi } from "../ChamaPayABI/ChamaPayContract";
import { getUser } from "../api/chama";


interface Withdrawal {
  id: number;
  chamaId: number;
  receiver: string;
  amount: number;
  timestamp: number;
}

interface User {
  id: number;
  name: string | null; // Allow name to be nullable
  address: string | null; // Allow address to be nullable
}


const Withdrawals = ( {cycle}: {cycle:number} ) => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});
  const { data, isError, isLoading } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "getPayments",
  });

  useEffect(() => {
    if (data) {
      const results = data as Withdrawal[];
      setWithdrawals(results);
      console.log(data);
    }

    const fetchUserNames = async (withdrawals: Withdrawal[]) => {
      const namesMap: { [key: string]: string } = {};

      // Fetch user names for each deposit asynchronously
      for (const withdrawal of withdrawals) {
        const userData: User | null = await getUser(withdrawal.receiver);
        if (userData) {
          // Check if name is null, and provide a fallback (e.g., "Unknown User")
          namesMap[withdrawal.receiver] = userData.name || "Unknown User";
        }
      }
      setUserNames(namesMap);
    };

    fetchUserNames(withdrawals);
  }, [data]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

 

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Withdrawals History
      </h2>

      {withdrawals.length === 0 && (
        <div className="flex items-center">
          <p>No withdrawals found.</p>
        </div>
      )}

      {withdrawals.map((withdrawal : Withdrawal, index) => (
        <div
          key={index}
          className="p-4 mb-4 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-downy-500 mr-2"
              >
                <path
                  fillRule="evenodd"
                  d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z"
                  clipRule="evenodd"
                />
              </svg>

              <p className="text-lg font-bold text-gray-800">
                {userNames[withdrawal.receiver] || "Loading..."}
              </p>
            </div>
            <p className="text-sm text-gray-500">{formatDate(Number(withdrawal.timestamp))}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-md text-gray-600">Cycle {cycle}</p>
            <p className="text-md text-downy-500 font-semibold">
              {withdrawal.amount} cKES
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Withdrawals;
