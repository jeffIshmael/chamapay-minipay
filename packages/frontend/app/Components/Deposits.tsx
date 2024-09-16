import React from "react";

const Deposits = () => {
  const deposits = [
    { name: "Clemo", date: "22nd Sep", amount: 2000, cycle: 1 },
    { name: "Macash", date: "25th Sep", amount: 2000, cycle: 1 },
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Deposits History</h2>
      {deposits.map((deposit, index) => (
        <div
          key={index}
          className="p-4 mb-4 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex justify-between items-center mb-2">
            <p className="text-lg font-bold text-gray-800">{deposit.name}</p>
            <p className="text-sm text-gray-500">{deposit.date}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-md text-gray-600">Cycle {deposit.cycle}</p>
            <p className="text-md text-blue-500 font-semibold">{deposit.amount} cKES</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Deposits;
