"use client";
import React, { useEffect, useState } from "react";
import { getPaymentsById } from "../../lib/chama"; // assuming both APIs are imported correctly
import { formatEther } from "viem";

interface Deposit {
  amount: bigint;
  chamaId: number;
  description: string | null;
  doneAt: Date;
  id: number;
  txHash: string;
  userId: number;
}

const Deposits = ({ chamaId }: { chamaId: number }) => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDeposits = async () => {
      setLoading(true);
      const results: Deposit[] = await getPaymentsById(chamaId);
      if (results) {
        setDeposits(results);
      }
      setLoading(false);
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
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Deposits History
      </h2>

      {deposits.length === 0 && (
        <div className="flex items-center">
          <h2>No deposits made.</h2>
        </div>
      )}

      {loading && !deposits ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        deposits.map((deposit: Deposit, index: number) => (
          <div
            key={index}
            className="p-4 mb-4 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-lg font-bold text-gray-800">
                {deposit.description ? deposit.description : "You locked"}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(deposit.doneAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-md text-blue-500 font-semibold">
                {formatEther(deposit.amount)} cUSD
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Deposits;
