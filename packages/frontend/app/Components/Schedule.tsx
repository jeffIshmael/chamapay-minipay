"use client";
import React, { useState } from "react";
import Withdrawals from "./Withdrawals";
import Deposits from "./Deposits";

const Schedule = () => {
  const [showDeposit, setShowDeposit] = useState(false);

  const members = [
    { name: "John", date: "15 SEP" },
    { name: "Jeff", date: "22 SEP" },
    { name: "Jane", date: "29 SEP" },
    { name: "Jack", date: "06 OCT" },
  ];

  const progressPercentage = 60;

  const toggleView = (type: string) => {
    setShowDeposit(type === "deposits");
  };

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center p-4">
      {/* Cycle progress container */}
      <div className="relative mt-14">
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
              <p className="text-6xl font-semibold mt-4">2</p>
            </div>
          </div>

          {/* Member clouds */}
          {members.map((member, index) => {
            const angle = (index / members.length) * 360;
            const rotate = `rotate(${angle}deg) translate(140px) rotate(-${angle}deg)`;

            return (
              <div
                key={member.name}
                className="absolute flex flex-col items-center justify-center w-[100px] h-[60px] rounded-full bg-downy-400 shadow-lg p-2"
                style={{
                  transform: rotate,
                }}
              >
                <p className="text-sm font-bold">{member.name}</p>
                <p className="text-xs">{member.date}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment History */}
      <div className="mt-12 w-full flex flex-col items-center">
        <h1 className="text-2xl font-semibold mb-2">Payment History</h1>
        <div className="flex mb-2 rounded-lg py-1 bg-gray-300 w-full  relative">
          <button
            onClick={() => toggleView("withdrawals")}
            className={`rounded-md w-1/2 py-1 hover:bg-downy-300  ${
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
          {!showDeposit ? <Withdrawals /> : <Deposits />}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
