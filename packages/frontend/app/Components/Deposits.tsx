import React, { useEffect, useState } from "react";
import { getPaymentsById, getUserById } from "../api/chama"; // assuming both APIs are imported correctly

interface Deposit {
  amount: number;
  chamaId: number;
  doneAt: Date;
  id: number;
  txHash: string;
  userId: number;
}

interface User {
  id: number;
  name: string | null; // Allow name to be nullable
  address: string | null; // Allow address to be nullable
}

const Deposits = ({ chamaId }: { chamaId: number }) => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [userNames, setUserNames] = useState<{ [key: number]: string }>({}); // store userId => name mapping

  useEffect(() => {
    const fetchDeposits = async () => {
      const results: Deposit[] = await getPaymentsById(chamaId);
      if (results) {
        setDeposits(results);
        fetchUserNames(results);
      }
    };

    const fetchUserNames = async (deposits: Deposit[]) => {
      const namesMap: { [key: number]: string } = {};

      // Fetch user names for each deposit asynchronously
      for (const deposit of deposits) {
        const userData: User | null = await getUserById(deposit.userId);
        if (userData) {
          // Check if name is null, and provide a fallback (e.g., "Unknown User")
          namesMap[deposit.userId] = userData.name || "Unknown User";
        }
      }
      setUserNames(namesMap);
    };

    fetchDeposits();
  }, [chamaId]); // Make sure to add the dependency here

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Deposits History
      </h2>

      {deposits.length === 0 && (
        <div className="flex items-center">
          <h2>No deposits made.</h2>
        </div>
      )}

      {deposits.map((deposit: Deposit, index: number) => (
        <div
          key={index}
          className="p-4 mb-4 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex justify-between items-center mb-2">
            <p className="text-lg font-bold text-gray-800">
              {userNames[deposit.userId] || "Loading..."}
            </p>
            <p className="text-sm text-gray-500">
              {formatDate(deposit.doneAt)}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-md text-blue-500 font-semibold">
              {deposit.amount} cKES
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Deposits;
